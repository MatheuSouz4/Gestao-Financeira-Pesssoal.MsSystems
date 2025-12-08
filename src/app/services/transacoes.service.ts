import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// Importação das interfaces base para encapsulamento e consistência
// OBS: Em um projeto real, essas interfaces seriam movidas para um arquivo 'models.ts' compartilhado.


// --- Interfaces Específicas para Transações ---

/**
 * Representa um Lançamento (Conta a Pagar/Receber) no sistema.
 * Contém o ID da Conta Base e os dados financeiros específicos.
 */
export interface Lancamento {
  id: string;
  contaId: string; // Referência à Conta Base (e.g., Aluguel, Salário)
  
  // Dados financeiros do lançamento específico:
  dataEmissao: string; // Ex: '2025-12-01'
  dataVencimento: string; // Ex: '2025-12-10'
  valor: number;
  
  // Dados de pagamento:
  status: 'Pendente' | 'Vencida' | 'Paga';
  dataPagamento?: string;
  valorPago?: number;
  comprovanteUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransacoesService {
  
  // URL específica para as operações de Lançamento e Pagamento
  private API_URL = 'http://localhost:8080/lancamentos'; 

  // Estado centralizado dos lançamentos para uso em múltiplos componentes
  private _lancamentos = new BehaviorSubject<Lancamento[]>([]);
  public lancamentos$ = this._lancamentos.asObservable();
  
  constructor(private http: HttpClient) {
    this.carregarLancamentosIniciais();
  }

  // --- Lógica de Carregamento/Inicialização ---

  // Simula o carregamento inicial (Em produção, seria uma chamada GET)
  private carregarLancamentosIniciais(): void {
    // Simulação de dados com status pré-calculado (status real seria calculado no componente)
    const initialData: Lancamento[] = [
      { id: 'L001', contaId: 'A1', dataEmissao: '2025-11-01', dataVencimento: '2025-12-10', valor: 1500.00, status: 'Pendente' },
      { id: 'L002', contaId: 'B2', dataEmissao: '2025-12-01', dataVencimento: '2025-12-05', valor: 95.80, status: 'Pendente' }, // Vencida hoje ou antes
    ];
    this._lancamentos.next(initialData);
  }


  // --- Lógica de Lançamentos de Contas (POST) ---

  adicionarLancamento(lancamento: Lancamento): Observable<Lancamento> {
    // A API real provavelmente espera o ID da Conta Base (contaId)
    return this.http.post<Lancamento>(this.API_URL, lancamento).pipe(
      tap(novoLancamento => {
        // Atualiza o BehaviorSubject após o sucesso do POST
        this._lancamentos.next([...this._lancamentos.value, novoLancamento]);
      })
    );
  }

  // --- Lógica de Pagamentos (PUT/PATCH) ---

  registrarPagamento(lancamentoId: string, payload: { 
    dataPagamento: string, 
    valorPago: number, 
    comprovanteUrl?: string 
  }): Observable<Lancamento> {
    
    const url = `${this.API_URL}/pagamento/${lancamentoId}`;
    
    // A API recebe os dados de pagamento e muda o status
    return this.http.patch<Lancamento>(url, payload).pipe(
      tap(lancamentoPago => {
        // Atualiza o estado local para refletir o pagamento
        const listaAtualizada = this._lancamentos.value.map(l => 
          l.id === lancamentoPago.id ? lancamentoPago : l
        );
        this._lancamentos.next(listaAtualizada);
      })
    );
  }

  // --- Lógica de Status (Útil para o componente) ---

  /**
   * Determina se o lançamento é 'Pendente', 'Vencida' ou 'Paga'.
   */
  checkLancamentoStatus(lancamento: Lancamento): 'Pendente' | 'Vencida' | 'Paga' {
    if (lancamento.status === 'Paga') {
      return 'Paga';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Garantir que a data seja interpretada corretamente (YYYY-MM-DD)
    const vencimentoDate = new Date(lancamento.dataVencimento + 'T00:00:00'); 

    if (vencimentoDate < today) {
      return 'Vencida';
    }
    
    return 'Pendente';
  }
}