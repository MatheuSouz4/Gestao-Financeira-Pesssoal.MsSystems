import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContasService } from '../../services/contas.service';
import { Financeiro, FinanceiroService } from '../../services/financeiro.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EstornoFormComponent } from './estorno-form/estorno-form.component';
import { FinanceiroFormComponent } from './financeiro-form/financeiro-form.component';
import { QuitacaoFormComponent } from './quitacao-form/quitacao-form.component';

interface FinanceiroVM extends Financeiro {
  nomeConta: string;
  statusReal: string;
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule, FinanceiroFormComponent, QuitacaoFormComponent, EstornoFormComponent, DashboardComponent],
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss']
})
export class FinanceiroComponent implements OnInit {
  financeiros: FinanceiroVM[] = [];
  financeirosFiltrados: FinanceiroVM[] = [];
  contasDisponiveis: any[] = [];
  termoPesquisa: string = '';

  // Filtros Backend
  filtroStatus: string = '';
  filtroTipo: string = '';
  filtroContaId: string = '';
  filtroDataInicio: string = '';
  filtroDataFim: string = '';
  
  isFormularioAberto: boolean = false;
  isModalQuitacaoAberto: boolean = false;
  isModalEstornoAberto: boolean = false;

  financeiroEmEdicao: Financeiro | null = null;
  lancamentoParaQuitar: FinanceiroVM | null = null;
  lancamentoParaEstornar: FinanceiroVM | null = null;
  lancamentoSelecionadoDetalhes: FinanceiroVM | null = null;

  constructor(
    private financeiroService: FinanceiroService,
    private contasService: ContasService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
    this.carregarFinanceiro();
    
    this.financeiroService.financeiros$.subscribe(dados => {
      this.financeiros = dados.map(f => ({
        ...f,
        nomeConta: f.conta ? f.conta.nome : 'Conta desconhecida',
        statusReal: this.financeiroService.calcularStatus(f)
      }));

      this.financeiros.sort((a, b) => (b.id || 0) - (a.id || 0));
      this.aplicarFiltroLocal();
    });
  }

  carregarContas(): void {
    this.contasService.listar().subscribe({
      next: (contas) => this.contasDisponiveis = contas,
      error: () => this.toast.error('Erro ao carregar contas.')
    });
  }

  carregarFinanceiro(): void {
    this.financeiroService.listar().subscribe();
  }

  onFiltrar(status: string, tipo: string, contaId: string, inicio: string, fim: string): void {
    this.filtroStatus = status;
    this.filtroTipo = tipo;
    this.filtroContaId = contaId;
    this.filtroDataInicio = inicio;
    this.filtroDataFim = fim;

    this.financeiroService.listar(
      this.filtroStatus, 
      this.filtroTipo, 
      this.filtroContaId, 
      this.filtroDataInicio, 
      this.filtroDataFim
    ).subscribe({
      error: () => this.toast.error('Erro ao aplicar filtros no servidor.')
    });
  }

  aplicarFiltroLocal(): void {
    if (!this.termoPesquisa) {
      this.financeirosFiltrados = [...this.financeiros];
      return;
    }
    
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
    const operacao$ = dados.id 
      ? this.financeiroService.atualizar(dados.id, dados) 
      : this.financeiroService.adicionar(dados);

    operacao$.subscribe({
      next: () => {
        this.toast.success('Operação realizada com sucesso!');
        this.fecharFormulario();
        this.carregarFinanceiro();
      },
      error: () => this.toast.error('Erro ao processar a solicitação.')
    });
  }

  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.financeiroEmEdicao = null;
  }

  abrirModalQuitacao(f: FinanceiroVM): void {
    this.lancamentoParaQuitar = f;
    this.isModalQuitacaoAberto = true;
  }

  processarQuitacao(formData: FormData): void {
    if (this.lancamentoParaQuitar?.id) {
      this.financeiroService.quitar(this.lancamentoParaQuitar.id, formData).subscribe({
        next: () => {
          this.toast.success('Baixa registrada com sucesso!');
          this.isModalQuitacaoAberto = false;
          this.lancamentoParaQuitar = null;
          this.carregarFinanceiro(); // REQUISITO: Atualizar de imediato
        },
        error: () => this.toast.error('Erro ao registrar quitação.')
      });
    }
  }

  // --- MODAL DE DETALHES E ESTORNO ---
  abrirModalDetalhes(f: FinanceiroVM): void {
    this.lancamentoSelecionadoDetalhes = f;
  }

  fecharModalDetalhes(): void {
    this.lancamentoSelecionadoDetalhes = null;
  }

abrirModalEstorno(f: FinanceiroVM): void {
    this.lancamentoParaEstornar = f;
    this.isModalEstornoAberto = true;
  }

  processarEstorno(dados: { id: number, justificativa: string, retornarPendente: boolean }): void {
    this.financeiroService.estornar(dados.id, dados.justificativa, dados.retornarPendente).subscribe({
      next: () => {
        // Mensagem dinâmica dependendo da ação
        const msg = dados.retornarPendente ? 'Pagamento desfeito com sucesso!' : 'Pagamento estornado com sucesso!';
        this.toast.success(msg);
        this.isModalEstornoAberto = false;
        this.lancamentoParaEstornar = null;
        this.carregarFinanceiro();
      },
      error: () => this.toast.error('Erro ao processar a solicitação.')
    });
  }

  // --- AUXILIARES DE UI ---
  formatarStatus(status: string): string {
    return status ? status.replace('_', ' ') : '';
  }

  getProgressoVencimento(dataVencimento: string) {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 30) return 0;
    if (diffDays <= 0) return 100;
    return ((30 - diffDays) / 30) * 100;
  }

  getCorTimeline(dataVencimento: string, status: string) {
    if (status === 'PAGA') return 'prazo-pago';
    
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'prazo-vencido';
    if (diffDays <= 7) return 'prazo-alerta';
    return 'prazo-neutro';
  }
}