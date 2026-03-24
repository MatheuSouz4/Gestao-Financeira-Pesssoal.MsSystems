import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Lancamento {
  id?: Number;
  contaId: Number;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  status: 'PENDENTE' | 'VENCIDA' | 'PAGA';
  dataPagamento?: string;
  valorPago?: number;
  comprovanteUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LancamentosService {
  private readonly API_URL = 'http://localhost:8080/lancamentos';

  private _lancamentos = new BehaviorSubject<Lancamento[]>([]);
  public lancamentos$ = this._lancamentos.asObservable();

  constructor(private http: HttpClient) {
    this.carregarDados();
  }

  carregarDados(): void {
    this.http.get<Lancamento[]>(this.API_URL).subscribe({
      next: (dados) => this._lancamentos.next(dados),
      error: (err) => console.error('Erro ao carregar lançamentos:', err)
    });
  }

  adicionar(lancamento: any): Observable<Lancamento> {
    // Mapeamos 'vencimento' do formulário para 'dataVencimento' do banco se necessário
    const payload = {
      ...lancamento,
      dataVencimento: lancamento.vencimento || lancamento.dataVencimento
    };

    return this.http.post<Lancamento>(this.API_URL, payload).pipe(
      tap((novo) => {
        const listaAtual = [...this._lancamentos.value, novo];
        this._lancamentos.next(listaAtual);
      })
    );
  }

  atualizar(lancamento: any): Observable<Lancamento> {
    const id = lancamento.id;
    return this.http.put<Lancamento>(`${this.API_URL}/${id}`, lancamento).pipe(
      tap((atualizado) => {
        const listaAtual = this._lancamentos.value.map(l =>
          l.id === atualizado.id ? atualizado : l
        );
        this._lancamentos.next(listaAtual);
      })
    );
  }

  /**
   * Registra o pagamento chamando o endpoint PATCH /id/pagar
   */
  registrarPagamento(id: any, dados: Partial<Lancamento>): Observable<Lancamento> {
    return this.http.patch<Lancamento>(`${this.API_URL}/${id}/pagar`, dados).pipe(
      tap((pago) => {
        // Atualiza a lista local com o objeto retornado do backend (já com status PAGA)
        const listaAtual = this._lancamentos.value.map(l =>
          l.id === id ? pago : l
        );
        this._lancamentos.next(listaAtual);
      })
    );
  }

  excluir(id: any): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        const listaAtual = this._lancamentos.value.filter(l => l.id !== id);
        this._lancamentos.next(listaAtual);
      })
    );
  }

  /**
   * Utilitário para cálculo de status visual
   * Agora retorna os valores em CAIXA ALTA para bater com o CSS e Enum
   */
  calcularStatus(lancamento: Lancamento): 'PENDENTE' | 'VENCIDA' | 'PAGA' {
    if (lancamento.status === 'PAGA') return 'PAGA';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Fallback para os dois nomes possíveis de campo de data
    const dataRef = lancamento.dataVencimento || (lancamento as any).vencimento;
    const vencimento = new Date(dataRef + 'T00:00:00');

    return vencimento < hoje ? 'VENCIDA' : 'PENDENTE';
  }
}