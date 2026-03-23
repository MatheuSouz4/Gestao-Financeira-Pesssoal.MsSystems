import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Lancamento {
  id?: string;
  contaId: Number;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  status: 'Pendente' | 'Vencida' | 'Paga';
  dataPagamento?: string;
  valorPago?: number;
  comprovanteUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LancamentosService {
  private readonly API_URL = 'http://localhost:8080/lancamentos';

  // BehaviorSubject que mantém o estado da lista em tempo real
  private _lancamentos = new BehaviorSubject<Lancamento[]>([]);
  public lancamentos$ = this._lancamentos.asObservable();

  constructor(private http: HttpClient) {
    this.carregarDados();
  }

  /**
   * Busca a lista do backend e atualiza o BehaviorSubject
   */
  carregarDados(): void {
    this.http.get<Lancamento[]>(this.API_URL).subscribe({
      next: (dados) => this._lancamentos.next(dados),
      error: (err) => console.error('Erro ao carregar lançamentos:', err)
    });
  }

  /**
   * Adiciona um novo lançamento e atualiza a lista local
   */
  adicionar(lancamento: Lancamento): Observable<Lancamento> {
    return this.http.post<Lancamento>(this.API_URL, lancamento).pipe(
      tap((novoLancamento) => {
        const listaAtual = [...this._lancamentos.value, novoLancamento];
        this._lancamentos.next(listaAtual);
      })
    );
  }

  /**
   * Atualiza um lançamento existente
   */
  atualizar(lancamento: Lancamento): Observable<Lancamento> {
    return this.http.put<Lancamento>(`${this.API_URL}/${lancamento.id}`, lancamento).pipe(
      tap((atualizado) => {
        const listaAtual = this._lancamentos.value.map(l => 
          l.id === atualizado.id ? atualizado : l
        );
        this._lancamentos.next(listaAtual);
      })
    );
  }

  /**
   * Lógica específica para registro de pagamento
   */
  registrarPagamento(id: string, dados: Partial<Lancamento>): Observable<Lancamento> {
    // Aqui enviamos apenas o que mudou (Patch) ou o objeto completo conforme seu backend
    return this.http.patch<Lancamento>(`${this.API_URL}/${id}/pagar`, dados).pipe(
      tap((pago) => {
        const listaAtual = this._lancamentos.value.map(l => 
          l.id === id ? { ...l, ...pago, status: 'Paga' as const } : l
        );
        this._lancamentos.next(listaAtual);
      })
    );
  }

  /**
   * Remove um lançamento
   */
  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        const listaAtual = this._lancamentos.value.filter(l => l.id !== id);
        this._lancamentos.next(listaAtual);
      })
    );
  }

  /**
   * Utilitário para calcular o status visual (front-end)
   */
  calcularStatus(lancamento: Lancamento): 'Pendente' | 'Vencida' | 'Paga' {
    if (lancamento.status === 'Paga') return 'Paga';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Garantindo que a string de data seja tratada corretamente
    const vencimento = new Date(lancamento.dataVencimento + 'T00:00:00');

    return vencimento < hoje ? 'Vencida' : 'Pendente';
  }
}