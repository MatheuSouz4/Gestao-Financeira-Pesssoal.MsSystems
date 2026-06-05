import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// O Angular SÓ acha a interface se tiver a palavra "export" aqui
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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8080/dashboard';

  constructor(private http: HttpClient) {}

  // O Angular SÓ acha o método se ele estiver escrito exatamente assim
  obterMetricas(): Observable<MetricasDashboard> {
    return this.http.get<MetricasDashboard>(`${this.API_URL}/metricas`);
  }

  obterProjecao(): Observable<ProjecaoMensal[]> {
  return this.http.get<ProjecaoMensal[]>(`${this.API_URL}/projecao`);
  }
  
}