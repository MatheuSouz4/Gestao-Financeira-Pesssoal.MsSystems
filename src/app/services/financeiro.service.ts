import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Financeiro {
  id?: number;
  conta?: any; 
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  status: 'PENDENTE' | 'VENCIDA' | 'PAGA' | 'PAGAMENTO_PARCIAL' | 'ESTORNADA';
  dataPagamento?: string;
  valorPago?: number;
  comprovanteUrl?: string;
  descricao?: string;
  tipo?: string;
  idReferencia?: number; // Para identificar a origem de pagamentos parciais
  motivoAlteracao?: string;
}

export interface FinanceiroRequest {
  id?: number;
  contaId: number;
  vencimento: string;
  valor: number;
  descricao?: string;
  tipoRecorrencia?: 'NENHUMA' | 'MENSAL' | 'SEMESTRAL' | 'ANUAL';
  quantidadeParcelas?: number;
  motivoAlteracao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private readonly API_URL = 'http://localhost:8080/financeiro';

  private _financeiros = new BehaviorSubject<Financeiro[]>([]);
  public financeiros$ = this._financeiros.asObservable();

  constructor(private http: HttpClient) {
    this.listar();
  }

  listar(status?: string, tipo?: string, contaId?: string, inicio?: string, fim?: string): Observable<any[]> {
    let params = new HttpParams();

    if (status) params = params.set('status', status);
    if (tipo) params = params.set('tipo', tipo); 
    if (contaId) params = params.set('contaId', contaId);
    if (inicio) params = params.set('inicio', inicio);
    if (fim) params = params.set('fim', fim);

    return this.http.get<any[]>(`${this.API_URL}/filtro`, { params }).pipe(
      tap(dados => this._financeiros.next(dados))
    );
}

  adicionar(dados: FinanceiroRequest): Observable<Financeiro[]> {
    return this.http.post<Financeiro[]>(this.API_URL, dados).pipe(
      tap(() => this.listar().subscribe()) // Atualiza a lista após inserir
    );
  }

  atualizar(id: number, dados: FinanceiroRequest): Observable<Financeiro[]> {
    return this.http.put<Financeiro[]>(`${this.API_URL}/${id}`, dados).pipe(
      tap(() => this.listar().subscribe()) // Atualiza a lista após editar
    );
  }

  // No seu financeiro.service.ts
quitar(id: number, dados: FormData): Observable<any> {
  // O backend usa @PatchMapping("/{id}/quitar")
  return this.http.patch(`${this.API_URL}/${id}/quitar`, dados);
}

  calcularStatus(financeiro: Financeiro): string {
    // O backend já está mapeando os novos status corretamente, 
    // mas mantemos um fallback caso venha vazio.
    if (financeiro.status) return financeiro.status;
    return 'PENDENTE';
  }
}