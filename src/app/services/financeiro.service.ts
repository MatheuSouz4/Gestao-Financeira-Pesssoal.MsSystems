import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

// Interface espelhando a Entidade Financeiro do Java
export interface Financeiro {
  id?: number;
  conta?: any; 
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

// Interface atualizada para suportar Recorrência
export interface FinanceiroRequest {
  id?: number;
  contaId: number;
  vencimento: string;
  valor: number;
  descricao?: string;
  tipoRecorrencia?: 'NENHUMA' | 'MENSAL' | 'SEMESTRAL' | 'ANUAL';
  quantidadeParcelas?: number;
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

  // Refatorado: O backend agora retorna uma lista (List<Financeiro>) devido à recorrência
  adicionar(dados: FinanceiroRequest): Observable<Financeiro[]> {
    return this.http.post<Financeiro[]>(this.API_URL, dados).pipe(
      tap((novosRegistros) => {
        const listaAtual = [...this._financeiros.value, ...novosRegistros];
        this._financeiros.next(listaAtual);
      })
    );
  }

  // Refatorado: Mantém o retorno como lista para consistência com o DTO do Controller
  atualizar(id: number, dados: FinanceiroRequest): Observable<Financeiro[]> {
    return this.http.put<Financeiro[]>(`${this.API_URL}/${id}`, dados).pipe(
      tap((atualizados) => {
        // Atualiza os registros na lista local comparando IDs
        const idsAtualizados = atualizados.map(a => a.id);
        const listaAtual = this._financeiros.value.map(f => {
          const correspondente = atualizados.find(a => a.id === f.id);
          return correspondente ? correspondente : f;
        });
        this._financeiros.next(listaAtual);
      })
    );
  }

  /**
   * Refatorado para resolver o erro TS2345:
   * Agora aceita FormData para suportar o upload de comprovante (multipart/form-data)
   */
  quitar(id: number, dados: FormData): Observable<Financeiro> {
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
    
    // Ajuste para evitar problemas de fuso horário na conversão da string de data
    const [ano, mes, dia] = financeiro.dataVencimento.split('-').map(Number);
    const vencimento = new Date(ano, mes - 1, dia);
    
    return vencimento < hoje ? 'VENCIDA' : 'PENDENTE';
  }
}