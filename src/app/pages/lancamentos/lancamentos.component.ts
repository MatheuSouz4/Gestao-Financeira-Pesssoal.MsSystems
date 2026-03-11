import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContasService } from '../../services/contas.service';
import { Lancamento, LancamentosService } from '../../services/lancamentos.service';
import { LancamentosFormComponent } from '../lancamentos/lancamentos-form/lancamentos-form.component';

interface LancamentoVM extends Lancamento {
  nomeConta: string;
  statusReal: string;
}

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, LancamentosFormComponent],
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.scss']
})
export class LancamentosComponent implements OnInit {
  lancamentos: LancamentoVM[] = [];
  lancamentosFiltrados: LancamentoVM[] = [];
  termoPesquisa: string = '';
  
  isFormularioAberto: boolean = false;
  lancamentoEmEdicao: Lancamento | null = null;

  constructor(
    private lancamentosService: LancamentosService,
    private contasService: ContasService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    // Seguindo sua lógica de combineLatest para montar a ViewModel
    combineLatest([
      this.lancamentosService.lancamentos$, // Assumindo que o service tem um BehaviorSubject ou similar
      this.contasService.listar()
    ]).pipe(
      map(([lancamentos, contas]) => {
        return lancamentos.map(l => {
          const contaBase = contas.find(c => c.id === l.contaId);
          return {
            ...l,
            nomeConta: contaBase ? contaBase.nome : 'Conta desconhecida',
            statusReal: this.lancamentosService.calcularStatus(l)
          } as LancamentoVM;
        });
      })
    ).subscribe(res => {
      this.lancamentos = res;
      this.aplicarFiltro();
    });
  }

  aplicarFiltro(): void {
    const termo = this.termoPesquisa.toLowerCase();
    this.lancamentosFiltrados = this.lancamentos.filter(l =>
      l.nomeConta.toLowerCase().includes(termo) ||
      l.statusReal.toLowerCase().includes(termo)
    );
  }

  abrirFormularioCadastro(): void {
    this.lancamentoEmEdicao = null;
    this.isFormularioAberto = true;
  }

  editarLancamento(lancamento: Lancamento): void {
    this.lancamentoEmEdicao = lancamento;
    this.isFormularioAberto = true;
  }

  salvarLancamento(dados: any): void {
    const operacao$ = dados.id 
      ? this.lancamentosService.atualizar(dados) 
      : this.lancamentosService.adicionar(dados);

    operacao$.subscribe({
      next: () => {
        this.toast.success('Operação realizada com sucesso!');
        this.fecharFormulario();
        // Se o service não for reativo (Observable), chame carregarDados() aqui
      }
    });
  }

  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.lancamentoEmEdicao = null;
  }
}