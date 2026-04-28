import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

// Interface espelhando a Entidade Financeiro do Java
export interface Financeiro {
  id?: number;
  conta?: any; // O Backend devolve o objeto Conta completo
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  status: 'PENDENTE' | 'VENCIDA' | 'PAGA';
  dataPagamento?: string;
  valorPago?: number;
  comprovanteUrl?: string;
  descricao?: string;
  tipo?: string;
}

// Interface espelhando o FinanceiroRequestDTO do Java
export interface FinanceiroRequest {
  id?: number;
  contaId: number;
  vencimento: string;
  valor: number;
  descricao?: string;
}

// Interface espelhando o QuitacaoRequestDTO do Java
export interface QuitacaoRequest {
  dataPagamento: string;
  valorPago: number;
  comprovanteUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private readonly API_URL = 'http://localhost:8080/financeiro';

  private _financeiros = new BehaviorSubject<Financeiro[]>([]);
  public financeiros$ = this._financeiros.asObservable();

  constructor(private http: HttpClient) {
    this.carregarDados();
  }

  carregarDados(): void {
    this.http.get<Financeiro[]>(this.API_URL).subscribe({
      next: (dados) => this._financeiros.next(dados),
      error: (err) => console.error('Erro ao carregar financeiro:', err)
    });
  }

  adicionar(dados: FinanceiroRequest): Observable<Financeiro> {
    return this.http.post<Financeiro>(this.API_URL, dados).pipe(
      tap((novo) => {
        const listaAtual = [...this._financeiros.value, novo];
        this._financeiros.next(listaAtual);
      })
    );
  }

  atualizar(id: number, dados: FinanceiroRequest): Observable<Financeiro> {
    return this.http.put<Financeiro>(`${this.API_URL}/${id}`, dados).pipe(
      tap((atualizado) => {
        const listaAtual = this._financeiros.value.map(f =>
          f.id === atualizado.id ? atualizado : f
        );
        this._financeiros.next(listaAtual);
      })
    );
  }

  quitar(id: number, dados: QuitacaoRequest): Observable<Financeiro> {
    return this.http.patch<Financeiro>(`${this.API_URL}/${id}/quitar`, dados).pipe(
      tap((pago) => {
        const listaAtual = this._financeiros.value.map(f =>
          f.id === id ? pago : f
        );
        this._financeiros.next(listaAtual);
      })
    );
  }

  calcularStatus(financeiro: Financeiro): 'PENDENTE' | 'VENCIDA' | 'PAGA' {
    if (financeiro.status === 'PAGA') return 'PAGA';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (!financeiro.dataVencimento) return 'PENDENTE';
    
    const vencimento = new Date(financeiro.dataVencimento + 'T00:00:00');
    return vencimento < hoje ? 'VENCIDA' : 'PENDENTE';
  }
}