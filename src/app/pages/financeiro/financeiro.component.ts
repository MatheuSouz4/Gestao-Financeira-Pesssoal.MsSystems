import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContasService } from '../../services/contas.service';
import { Financeiro, FinanceiroService } from '../../services/financeiro.service';
import { FinanceiroFormComponent } from '../financeiro/financeiro-form/financeiro-form.component';

interface FinanceiroVM extends Financeiro {
  nomeConta: string;
  statusReal: string;
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule, FinanceiroFormComponent],
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss']
})
export class FinanceiroComponent implements OnInit {
  financeiros: FinanceiroVM[] = [];
  financeirosFiltrados: FinanceiroVM[] = [];
  termoPesquisa: string = '';
  
  isFormularioAberto: boolean = false;
  financeiroEmEdicao: Financeiro | null = null;

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
          // O backend agora traz a conta vinculada automaticamente
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

  abrirFormularioCadastro(): void {
    this.financeiroEmEdicao = null;
    this.isFormularioAberto = true;
  }

  editarFinanceiro(financeiro: Financeiro): void {
    this.financeiroEmEdicao = financeiro;
    this.isFormularioAberto = true;
  }

  salvarFinanceiro(dados: any): void {
    // Note que dados.id é usado na URL para atualizar, mas o body deve seguir o DTO
    const operacao$ = dados.id 
      ? this.financeiroService.atualizar(dados.id, dados) 
      : this.financeiroService.adicionar(dados);

    operacao$.subscribe({
      next: () => {
        this.toast.success('Operação realizada com sucesso!');
        this.fecharFormulario();
      },
      error: () => {
        this.toast.error('Ocorreu um erro ao processar a solicitação.');
      }
    });
  }

  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.financeiroEmEdicao = null;
  }

  // Exemplo de como calcular para o HTML
  getProgressoVencimento(dataVencimento: string) {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Se faltar mais de 30 dias, mostra no início (0%)
    // Se estiver no dia, mostra no fim (100%)
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