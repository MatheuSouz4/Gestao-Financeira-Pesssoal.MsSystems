import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface MetricasDashboard {
  receitasRecebidas: number;
  receitasPendentes: number;
  receitasVencidas: number;
  saldoReceitas: number;
  despesasPagas: number;
  despesasPendentes: number;
  despesasVencidas: number;
  saldoDespesas: number;
  saldoGeral: number;
}

export interface ProjecaoMensal {
  mes: string;
  receitas: number;
  despesas: number;
}

export interface TopCategoria {
  nome: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8080/dashboard';

  constructor(private http: HttpClient) {}

  private getParams(inicio?: string, fim?: string): HttpParams {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fim) params = params.set('fim', fim);
    return params;
  }

  obterMetricas(inicio?: string, fim?: string): Observable<MetricasDashboard> {
    return this.http.get<MetricasDashboard>(`${this.API_URL}/metricas`, { params: this.getParams(inicio, fim) });
  }

  obterProjecao(inicio?: string, fim?: string): Observable<ProjecaoMensal[]> {
    return this.http.get<ProjecaoMensal[]>(`${this.API_URL}/projecao`, { params: this.getParams(inicio, fim) });
  }

  obterTopReceitas(inicio?: string, fim?: string): Observable<TopCategoria[]> {
    return this.http.get<TopCategoria[]>(`${this.API_URL}/top-receitas`, { params: this.getParams(inicio, fim) });
  }

  obterTopDespesas(inicio?: string, fim?: string): Observable<TopCategoria[]> {
    return this.http.get<TopCategoria[]>(`${this.API_URL}/top-despesas`, { params: this.getParams(inicio, fim) });
  }
}