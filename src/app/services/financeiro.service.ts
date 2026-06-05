import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { NotificationService } from './notification.service';

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
  idReferencia?: number;
  motivoAlteracao?: string;
  justificativaEstorno?: string;
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
  justificativaEstorno?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  // NOVA URL SEPARADA
  private readonly API_URL = 'http://localhost:8080/financeiro';

  private _financeiros = new BehaviorSubject<Financeiro[]>([]);
  public financeiros$ = this._financeiros.asObservable();

  constructor(
    private http: HttpClient,
    private notify: NotificationService // Injeção do Notificador
  ) {
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
      tap(() => {
        this.listar().subscribe();
        this.notify.notify(); // Notifica o Dashboard
      })
    );
  }

  atualizar(id: number, dados: FinanceiroRequest): Observable<Financeiro[]> {
    return this.http.put<Financeiro[]>(`${this.API_URL}/${id}`, dados).pipe(
      tap(() => {
        this.listar().subscribe();
        this.notify.notify(); // Notifica o Dashboard
      })
    );
  }

  quitar(id: number, dados: FormData): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}/quitar`, dados).pipe(
      tap(() => {
        this.notify.notify(); // Notifica o Dashboard
      })
    );
  }

  estornar(id: number, justificativa: string, retornarPendente: boolean): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}/estornar`, {
      justificativaEstorno: justificativa,
      retornarPendente: retornarPendente
    }).pipe(
      tap(() => {
        this.listar().subscribe();
        this.notify.notify(); // Notifica o Dashboard
      })
    );
  }

  calcularStatus(financeiro: Financeiro): string {
    if (financeiro.status) return financeiro.status;
    return 'PENDENTE';
  }
}