import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  financeiroEmEdicao: Financeiro | null = null;
  lancamentoParaQuitar: FinanceiroVM | null = null;

  constructor(
    private financeiroService: FinanceiroService,
    private contasService: ContasService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
    this.carregarFinanceiro();
    
    // Inscreve-se nas mudanças da lista
    this.financeiroService.financeiros$.subscribe(dados => {
      this.financeiros = dados.map(f => ({
        ...f,
        nomeConta: f.conta ? f.conta.nome : 'Conta desconhecida',
        statusReal: this.financeiroService.calcularStatus(f)
      }));
      this.aplicarFiltroLocal();
    });
  }

  carregarContas(): void {
    this.contasService.listar().subscribe(contas => {
      this.contasDisponiveis = contas;
    });
  }

  carregarFinanceiro(): void {
    this.financeiroService.listar().subscribe(financeiros =>{})
  }

  onFiltrar(status: string, tipo: string, contaId: string, inicio: string, fim: string): void {
    this.filtroStatus = status;
    this.filtroTipo = tipo;
    this.filtroContaId = contaId;
    this.filtroDataInicio = inicio;
    this.filtroDataFim = fim;

    // Dispara a requisição ao backend
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
          this.toast.success('Baixa registrada com sucesso!');
          this.isModalQuitacaoAberto = false;
          this.lancamentoParaQuitar = null;
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

  getCorTimeline(dataVencimento: string, status: string) {
    if (status === 'PAGA') return 'prazo-neutro'; // Se pago, remove alerta
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'prazo-vencido';
    if (diffDays <= 7) return 'prazo-alerta';
    return 'prazo-neutro';
  }
}