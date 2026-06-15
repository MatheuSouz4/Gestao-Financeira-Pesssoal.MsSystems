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
  dataVencimentoDate?: Date;
  dataPagamentoDate?: Date;
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
      this.financeiros = dados.map(f => {
        // CORREÇÃO SÊNIOR: Extração de datas blindada contra timezone (GMT)
        let dataVencReal = new Date();
        if (f.dataVencimento) {
          const [ano, mes, dia] = f.dataVencimento.split('-');
          dataVencReal = new Date(Number(ano), Number(mes) - 1, Number(dia));
        }

        let dataPagReal: Date | undefined = undefined;
        if (f.dataPagamento) {
          const [ano, mes, dia] = f.dataPagamento.split('-');
          dataPagReal = new Date(Number(ano), Number(mes) - 1, Number(dia));
        }

        return {
          ...f,
          nomeConta: f.conta ? f.conta.nome : 'Conta desconhecida',
          // Backend é a única fonte da verdade para o status agora
          statusReal: f.status || 'PENDENTE',
          dataVencimentoDate: dataVencReal,
          dataPagamentoDate: dataPagReal
        };
      });

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
    
    // Padroniza o termo de pesquisa
    const termo = this.termoPesquisa.toLowerCase().trim();
    
    // Remove o caractere '#' caso o usuário tente pesquisar o ID exatamente como vê na tela
    const termoId = termo.replace('#', ''); 

    this.financeirosFiltrados = this.financeiros.filter(f => {
      // 1. Busca por ID (converte o ID numérico para string para usar o includes)
      const matchId = f.id ? f.id.toString().includes(termoId) : false;
      
      // 2. Busca nos campos de texto padrão
      const matchConta = f.nomeConta.toLowerCase().includes(termo);
      const matchStatus = f.statusReal.toLowerCase().includes(termo);
      const matchDescricao = f.descricao ? f.descricao.toLowerCase().includes(termo) : false;

      // Retorna verdadeiro se bater com qualquer uma das condições
      return matchId || matchConta || matchStatus || matchDescricao;
    });
  }

  // --- MODAIS DE CADASTRO E OPERAÇÕES ---
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
        this.toast.success(dados.id ? 'Lançamento atualizado com sucesso!' : 'Lançamento cadastrado com sucesso!', 'Sucesso');
        this.fecharFormulario();
        this.carregarFinanceiro();
      },
      error: (erro) => {
        // Captura a mensagem mapeada no ResourceExceptionHandler do backend (Ex: Conta Inativa)
        const msg = erro.error?.message || 'Erro ao processar a solicitação no servidor.';
        this.toast.error(msg, 'Erro');
      }
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
          this.toast.success('Baixa de pagamento registrada com sucesso!', 'Quitação');
          this.isModalQuitacaoAberto = false;
          this.lancamentoParaQuitar = null;
          this.carregarFinanceiro(); 
        },
        error: (erro) => {
          const msg = erro.error?.message || 'Erro ao registrar quitação do lançamento.';
          this.toast.error(msg, 'Erro');
        }
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
        const msg = dados.retornarPendente ? 'Pagamento desfeito e retornado para Pendente!' : 'Pagamento estornado com sucesso!';
        this.toast.success(msg, 'Estorno');
        this.isModalEstornoAberto = false;
        this.lancamentoParaEstornar = null;
        this.carregarFinanceiro();
      },
      error: (erro) => {
        const msg = erro.error?.message || 'Erro ao estornar o lançamento.';
        this.toast.error(msg, 'Erro');
      }
    });
  }

  // --- AUXILIARES DE UI CORRIGIDOS ---
  formatarStatus(status: string): string {
    return status ? status.replace('_', ' ') : '';
  }

  getProgressoVencimento(vencimento: Date | undefined): number {
    if (!vencimento) return 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera horas para precisão diária
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) return 0;
    if (diffDays <= 0) return 100;
    return ((30 - diffDays) / 30) * 100;
  }

  getCorTimeline(vencimento: Date | undefined, status: string): string {
    if (status === 'PAGA') return 'prazo-pago';
    if (!vencimento) return 'prazo-neutro';
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera horas para precisão diária
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'prazo-vencido';
    if (diffDays <= 7) return 'prazo-alerta';
    return 'prazo-neutro';
  }
}