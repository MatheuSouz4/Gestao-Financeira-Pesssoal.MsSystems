import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContasService } from '../../services/contas.service';
import { Financeiro, FinanceiroService } from '../../services/financeiro.service';
import { FinanceiroFormComponent } from './financeiro-form/financeiro-form.component';
import { QuitacaoFormComponent } from './quitacao-form/quitacao-form.component';

interface FinanceiroVM extends Financeiro {
  nomeConta: string;
  statusReal: string;
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule, FinanceiroFormComponent, QuitacaoFormComponent],
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss']
})
export class FinanceiroComponent implements OnInit {
  financeiros: FinanceiroVM[] = [];
  financeirosFiltrados: FinanceiroVM[] = [];
  termoPesquisa: string = '';
  
  // Controles de Modais
  isFormularioAberto: boolean = false;
  isModalQuitacaoAberto: boolean = false;

  financeiroEmEdicao: Financeiro | null = null;
  lancamentoParaQuitar: FinanceiroVM | null = null;

  constructor(
    private financeiroService: FinanceiroService,
    private contasService: ContasService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    combineLatest([
      this.financeiroService.financeiros$,
      this.contasService.listar()
    ]).pipe(
      map(([financeiros, contas]) => {
        return financeiros.map(f => {
          const nomeContaBase = f.conta ? f.conta.nome : 'Conta desconhecida';
          return {
            ...f,
            nomeConta: nomeContaBase,
            statusReal: this.financeiroService.calcularStatus(f)
          } as FinanceiroVM;
        });
      })
    ).subscribe(res => {
      this.financeiros = res;
      this.aplicarFiltro();
    });
  }

  aplicarFiltro(): void {
    const termo = this.termoPesquisa.toLowerCase();
    this.financeirosFiltrados = this.financeiros.filter(f =>
      f.nomeConta.toLowerCase().includes(termo) ||
      f.statusReal.toLowerCase().includes(termo) ||
      (f.descricao && f.descricao.toLowerCase().includes(termo))
    );
  }

  // --- LÓGICA DE CADASTRO/EDIÇÃO ---
  abrirFormularioCadastro(): void {
    this.financeiroEmEdicao = null;
    this.isFormularioAberto = true;
  }

  editarFinanceiro(financeiro: Financeiro): void {
    this.financeiroEmEdicao = financeiro;
    this.isFormularioAberto = true;
  }

  salvarFinanceiro(dados: any): void {
    const operacao$ = dados.id 
      ? this.financeiroService.atualizar(dados.id, dados) 
      : this.financeiroService.adicionar(dados);

    operacao$.subscribe({
      next: () => {
        this.toast.success('Operação realizada com sucesso!');
        this.fecharFormulario();
      },
      error: () => this.toast.error('Erro ao processar a solicitação.')
    });
  }

  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.financeiroEmEdicao = null;
  }

  // --- LÓGICA DE QUITAÇÃO ---
  abrirModalQuitacao(f: FinanceiroVM): void {
    this.lancamentoParaQuitar = f;
    this.isModalQuitacaoAberto = true;
  }

  processarQuitacao(formData: FormData): void {
    if (this.lancamentoParaQuitar?.id) {
      this.financeiroService.quitar(this.lancamentoParaQuitar.id, formData).subscribe({
        next: () => {
          this.toast.success('Lançamento quitado com sucesso!');
          this.isModalQuitacaoAberto = false;
          this.lancamentoParaQuitar = null;
          // O service reativo deve atualizar a lista automaticamente
        },
        error: () => this.toast.error('Erro ao registrar quitação.')
      });
    }
  }

  // --- AUXILIARES DE UI ---
  getProgressoVencimento(dataVencimento: string) {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 30) return 0;
    if (diffDays <= 0) return 100;
    return ((30 - diffDays) / 30) * 100;
  }

  getCorTimeline(dataVencimento: string) {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'prazo-vencido';
    if (diffDays <= 7) return 'prazo-alerta';
    return 'prazo-neutro';
  }
}