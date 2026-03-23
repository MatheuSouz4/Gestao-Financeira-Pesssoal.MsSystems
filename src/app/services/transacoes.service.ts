import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

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
export class TransacoesService {
  private API_URL = 'http://localhost:8080/lancamentos';

  // O BehaviorSubject é o "coração" da reatividade entre as abas
  private _lancamentos = new BehaviorSubject<Lancamento[]>([]);
  public lancamentos$ = this._lancamentos.asObservable();

  constructor(private http: HttpClient) {
    this.carregarDadosIniciais();
  }

  // Simula busca do banco de dados e alimenta o Subject
  private carregarDadosIniciais(): void {
    // Aqui você faria um this.http.get<Lancamento[]>(this.API_URL).subscribe(...)
    this._lancamentos.next([]); 
  }

  adicionar(lancamento: Lancamento): Observable<Lancamento> {
    // Em produção: return this.http.post<Lancamento>(this.API_URL, lancamento).pipe(...)
    
    // Simulação para funcionamento local:
    const novo = { ...lancamento, id: Math.random().toString(36).substr(2, 9) };
    const listaAtual = [...this._lancamentos.value, novo];
    this._lancamentos.next(listaAtual); // Notifica todos os interessados
    return of(novo);
  }

  registrarPagamento(id: string, dados: Partial<Lancamento>): Observable<Lancamento> {
    const listaAtual = this._lancamentos.value.map(l => {
      if (l.id === id) {
        return { ...l, ...dados, status: 'Paga' as const };
      }
      return l;
    });
    
    this._lancamentos.next(listaAtual); // Atualiza a lista globalmente
    return of(listaAtual.find(l => l.id === id)!);
  }

  // Lógica de cálculo de status baseada na data atual
  calcularStatus(lancamento: Lancamento): 'Pendente' | 'Vencida' | 'Paga' {
    if (lancamento.status === 'Paga') return 'Paga';
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(lancamento.dataVencimento + 'T00:00:00');

    return vencimento < hoje ? 'Vencida' : 'Pendente';
  }
}