import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription, forkJoin } from 'rxjs'; // <-- Importe forkJoin
import { DashboardService, MetricasDashboard, ProjecaoMensal } from '../../services/dashboard.service';
import { FinanceiroService } from '../../services/financeiro.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('graficoBarras', { static: true }) elementoGraficoBarras!: ElementRef;
  @ViewChild('graficoLinhas', { static: true }) elementoGraficoLinhas!: ElementRef;
  
  private chartBarras!: Chart;
  private chartLinhas!: Chart;
  private subscricao!: Subscription;

  metricas: MetricasDashboard = {
    receitasRecebidas: 0, receitasPendentes: 0, receitasVencidas: 0, saldoReceitas: 0,
    despesasPagas: 0, despesasPendentes: 0, despesasVencidas: 0, saldoDespesas: 0, saldoGeral: 0
  };

  constructor(
    private dashboardService: DashboardService,
    private financeiroService: FinanceiroService
  ) {}

  ngOnInit(): void {
    this.inicializarGraficos();
    
    this.subscricao = this.financeiroService.financeiros$.subscribe(() => {
      this.carregarDadosDoBanco();
    });
  }

  ngOnDestroy(): void {
    if (this.subscricao) this.subscricao.unsubscribe();
    if (this.chartBarras) this.chartBarras.destroy();
    if (this.chartLinhas) this.chartLinhas.destroy();
  }

  private carregarDadosDoBanco(): void {
    // Busca métricas gerais e projeção ao mesmo tempo
    forkJoin({
      metricas: this.dashboardService.obterMetricas(),
      projecao: this.dashboardService.obterProjecao()
    }).subscribe({
      next: (res) => {
        this.metricas = res.metricas;
        this.atualizarGraficoBarras();
        this.atualizarGraficoLinhas(res.projecao);
      },
      error: (err: any) => console.error('Erro ao carregar dados do dashboard:', err)
    });
  }

  private inicializarGraficos(): void {
    // Gráfico de Barras (Status)
    const configBarras: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Recebidas / Pagas', 'Pendentes', 'Vencidas'],
        datasets: [
          { label: 'Receitas', data: [0, 0, 0], backgroundColor: '#10b981', borderRadius: 4 },
          { label: 'Despesas', data: [0, 0, 0], backgroundColor: '#ef4444', borderRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Posição Atual' } } }
    };
    this.chartBarras = new Chart(this.elementoGraficoBarras.nativeElement, configBarras);

    // Gráfico de Linhas (Projeção Anual)
    const configLinhas: ChartConfiguration = {
      type: 'line',
      data: {
        labels: [], // Será preenchido com os meses
        datasets: [
          { label: 'Receitas', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, fill: true },
          { label: 'Despesas', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4, fill: true }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Projeção Anual (' + new Date().getFullYear() + ')' } } }
    };
    this.chartLinhas = new Chart(this.elementoGraficoLinhas.nativeElement, configLinhas);
  }

  private atualizarGraficoBarras(): void {
    if (this.chartBarras) {
      this.chartBarras.data.datasets[0].data = [this.metricas.receitasRecebidas, this.metricas.receitasPendentes, this.metricas.receitasVencidas];
      this.chartBarras.data.datasets[1].data = [this.metricas.despesasPagas, this.metricas.despesasPendentes, this.metricas.despesasVencidas];
      this.chartBarras.update();
    }
  }

  private atualizarGraficoLinhas(projecao: ProjecaoMensal[]): void {
    if (this.chartLinhas && projecao.length > 0) {
      this.chartLinhas.data.labels = projecao.map(p => p.mes);
      this.chartLinhas.data.datasets[0].data = projecao.map(p => p.receitas);
      this.chartLinhas.data.datasets[1].data = projecao.map(p => p.despesas);
      this.chartLinhas.update();
    }
  }
}