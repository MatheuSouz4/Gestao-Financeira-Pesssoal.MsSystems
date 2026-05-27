import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Conta, ContasService } from '../../services/contas.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  hoje: Date = new Date();

  saldoConsolidado: number = 0;
  contasDisponiveis: Conta[] = [];

  filtroInicio: string = '';
  filtroFim: string = '';
  filtroContaId: string = '';

  // Estrutura expandida para cobrir todos os saldos analíticos
  resumo = {
    receitasPagas: 0,
    receitasPendentes: 0,
    despesasPagas: 0,
    despesasPendentes: 0,
    totalPago: 0,       // Balanço atual (Receitas Pagas - Despesas Pagas)
    totalPendente: 0,   // Balanço pendente (Receitas Pendentes - Despesas Pendentes)
    qtdPendentes: 0
  };

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Pagamentos (R$)',
        backgroundColor: 'rgba(67, 97, 238, 0.2)',
        borderColor: '#4361ee',
        pointBackgroundColor: '#2b3674',
        fill: 'origin',
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  constructor(
    private http: HttpClient,
    private contasService: ContasService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
    this.carregarSaldoConsolidado();
    this.carregarResumo();
    this.carregarDadosGrafico();
  }

  carregarContas(): void {
    this.contasService.listar().subscribe({
      next: (contas) => this.contasDisponiveis = contas,
      error: (err) => console.error('Erro ao listar contas no dashboard:', err)
    });
  }

  carregarSaldoConsolidado(): void {
    this.contasService.obterSaldoConsolidado(
      this.filtroInicio,
      this.filtroFim,
      this.filtroContaId
    ).subscribe({
      next: (total) => this.saldoConsolidado = total,
      error: (err) => console.error('Erro ao buscar saldo consolidado:', err)
    });
  }

  aplicarFiltrosSaldo(): void {
    this.carregarSaldoConsolidado();
  }

  carregarResumo() {
    this.http.get<any>('http://localhost:8080/financeiro/resumo')
      .subscribe({
        next: (dados) => {
          // Mapeia os dados do backend garantindo que valores nulos não quebrem o layout
          this.resumo = {
            receitasPagas: dados.ReceitasRecebidas || 0,
            receitasPendentes: dados.ReceitasPendentes || 0,
            despesasPagas: dados.DespesasPagas || 0,
            despesasPendentes: dados.DespesasPendentes || 0,
            totalPago: dados.SaldoPago || 0,
            totalPendente: dados.SaldoPendente || 0,
            qtdPendentes: dados.QtdPendentes || 0
          };
        },
        error: (err) => console.error('Erro ao buscar resumo:', err)
      });
  }

  carregarDadosGrafico() {
    this.http.get<any[]>('http://localhost:8080/financeiro/grafico')
      .subscribe({
        next: (res) => {
          this.lineChartData.labels = res.map(item => new Date(item.data).toLocaleDateString('pt-BR'));
          this.lineChartData.datasets[0].data = res.map(item => item.total);
          this.chart?.update();
        },
        error: (err) => console.error('Erro ao buscar dados do gráfico:', err)
      });
  }
}