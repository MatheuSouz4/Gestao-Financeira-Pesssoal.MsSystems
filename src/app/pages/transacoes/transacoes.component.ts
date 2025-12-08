import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// Importa os serviços e interfaces necessárias
import { Conta, ContasService, TipoConta } from '../../services/contas.service';
import { Lancamento, TransacoesService } from '../../services/transacoes.service';
// Assumindo que você criou o módulo para o componente
// import { TransacoesFormComponent } from './transacoes-form/transacoes-form.component'; 

// Define uma interface combinada para exibir na listagem
interface LancamentoExibicao extends Lancamento {
  nomeContaBase: string;
  tipoContaBase: TipoConta;
  statusCalculado: 'Pendente' | 'Vencida' | 'Paga';
}


@Component({
  selector: 'app-transacoes',
  standalone: true,
  // Imports devem incluir o formulário e módulos de formulário
  // imports: [CommonModule, FormsModule, TransacoesFormComponent], 
  templateUrl: './transacoes.component.html',
  styleUrls: ['./transacoes.component.scss']
})
export class TransacoesComponent implements OnInit {

  // --- Estado do Componente ---
  activeTab: 'lancamentos' | 'pagamentos' = 'lancamentos';
  isModalPagamentoAberto: boolean = false;

  // Dados observáveis (para o pipe async no HTML)
  contasBase$!: Observable<Conta[]>;
  lancamentosExibicao$!: Observable<LancamentoExibicao[]>;

  // Dados do formulário de Lançamento
  novoLancamento: { contaId: string, dataEmissao: string, dataVencimento: string, valor: number } = {
    contaId: '',
    dataEmissao: new Date().toISOString().substring(0, 10),
    dataVencimento: new Date().toISOString().substring(0, 10),
    valor: 0
  };

  // Dados do Modal de Pagamento
  lancamentoSelecionado: LancamentoExibicao | null = null;
  pagamentoPayload = {
    dataPagamento: new Date().toISOString().substring(0, 10),
    valorPago: 0,
    comprovanteFile: null as File | null,
    comprovanteUrl: undefined as string | undefined // URL após upload
  };

  constructor(
    private contasService: ContasService,
    private transacoesService: TransacoesService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.contasBase$ = this.contasService.listar(); // Lista as Contas Base

    // Combina os Lançamentos específicos com as Contas Base
    this.lancamentosExibicao$ = combineLatest([
      this.transacoesService.lancamentos$, 
      this.contasBase$
    ]).pipe(
      map(([lancamentos, contas]) => {
        const contasMap = new Map(contas.map(c => [c.id, c]));
        
        return lancamentos.map(lancamento => {
          const contaBase = contasMap.get(lancamento.contaId);
          
          return {
            ...lancamento,
            nomeContaBase: contaBase?.nome || 'Conta Não Encontrada',
            tipoContaBase: contaBase?.tipo || 'DESPESA',
            statusCalculado: this.transacoesService.checkLancamentoStatus(lancamento)
          } as LancamentoExibicao;
        });
      })
    );
  }

  // --- Lógica de Lançamentos de Contas ---

  salvarLancamento(form: NgForm): void {
    if (form.invalid) return;

    const novoLancamentoPayload: Lancamento = {
      id: '', // Será definido pelo Service/Backend
      contaId: this.novoLancamento.contaId,
      dataEmissao: this.novoLancamento.dataEmissao,
      dataVencimento: this.novoLancamento.dataVencimento,
      valor: this.novoLancamento.valor,
      status: 'Pendente'
    };

    this.transacoesService.adicionarLancamento(novoLancamentoPayload).subscribe({
      next: () => {
        this.toastService.success('Lançamento registrado com sucesso!');
        form.resetForm({ 
            dataEmissao: new Date().toISOString().substring(0, 10),
            dataVencimento: new Date().toISOString().substring(0, 10),
            valor: 0
        }); // Limpa o formulário, mantendo datas atuais
      },
      error: (err) => {
        console.error('Erro ao adicionar lançamento:', err);
        this.toastService.error('Falha ao registrar lançamento.');
      }
    });
  }

  // --- Lógica de Pagamentos (Modal e Submissão) ---

  abrirModalPagamento(lancamento: LancamentoExibicao): void {
    this.lancamentoSelecionado = lancamento;
    this.pagamentoPayload.valorPago = lancamento.valor; // Sugere o valor total
    this.pagamentoPayload.dataPagamento = new Date().toISOString().substring(0, 10);
    this.pagamentoPayload.comprovanteFile = null;
    this.isModalPagamentoAberto = true;
  }

  fecharModalPagamento(): void {
    this.isModalPagamentoAberto = false;
    this.lancamentoSelecionado = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pagamentoPayload.comprovanteFile = input.files ? input.files[0] : null;
  }

  registrarPagamento(): void {
    if (!this.lancamentoSelecionado || !this.pagamentoPayload.comprovanteFile) {
      this.toastService.warning('Selecione um lançamento e anexe o comprovante.');
      return;
    }
    
    // * SIMULAÇÃO DE UPLOAD: Em uma aplicação real, você faria o upload do arquivo
    // * aqui e obteria a URL antes de chamar o `registrarPagamento`.
    // * Por simplicidade, faremos a chamada diretamente com uma URL simulada.
    
    const uploadSimuladoUrl = `comprovantes/${this.lancamentoSelecionado.id}-${Date.now()}.pdf`;
    
    this.transacoesService.registrarPagamento(this.lancamentoSelecionado.id, {
      dataPagamento: this.pagamentoPayload.dataPagamento,
      valorPago: this.pagamentoPayload.valorPago,
      comprovanteUrl: uploadSimuladoUrl
    }).subscribe({
      next: () => {
        this.toastService.success(`Pagamento de ${this.lancamentoSelecionado!.nomeContaBase} registrado com sucesso!`);
        this.fecharModalPagamento();
      },
      error: (err) => {
        console.error('Erro ao registrar pagamento:', err);
        this.toastService.error('Falha ao registrar pagamento.');
      }
    });
  }

  // --- Helpers de Exibição ---
  
  setActiveTab(tab: 'lancamentos' | 'pagamentos'): void {
    this.activeTab = tab;
  }
}