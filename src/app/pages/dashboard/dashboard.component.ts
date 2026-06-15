import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subscription, forkJoin } from 'rxjs';
import { DashboardService, MetricasDashboard, ProjecaoMensal, TopCategoria } from '../../services/dashboard.service';
import { FinanceiroService } from '../../services/financeiro.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('graficoBarras', { static: true }) elementoGraficoBarras!: ElementRef;
  @ViewChild('graficoLinhas', { static: true }) elementoGraficoLinhas!: ElementRef;
  @ViewChild('graficoTopReceitas', { static: true }) elementoTopReceitas!: ElementRef;
  @ViewChild('graficoTopDespesas', { static: true }) elementoTopDespesas!: ElementRef;
  
  private charts: Chart[] = [];
  private subscricao!: Subscription;
  
  // Filtros de Data (Inicia com o ano atual para uma boa visualização padrão)
  dataInicio: string = `${new Date().getFullYear()}-01-01`;
  dataFim: string = `${new Date().getFullYear()}-12-31`;

  metricas: MetricasDashboard = {
    receitasRecebidas: 0, receitasPendentes: 0, receitasVencidas: 0, saldoReceitas: 0,
    despesasPagas: 0, despesasPendentes: 0, despesasVencidas: 0, saldoDespesas: 0, saldoGeral: 0
  };

  constructor(
    private dashboardService: DashboardService,
    private financeiroService: FinanceiroService
  ) {}

  ngOnInit(): void {
    this.subscricao = this.financeiroService.financeiros$.subscribe(() => {
      this.carregarDadosDoBanco();
    });
  }

  ngOnDestroy(): void {
    if (this.subscricao) this.subscricao.unsubscribe();
    this.destruirGraficos();
  }

  aplicarFiltro(): void {
    this.carregarDadosDoBanco();
  }

  private destruirGraficos(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  private carregarDadosDoBanco(): void {
    console.log('Iniciando carregamento de dados do Dashboard...');
    
    forkJoin({
      metricas: this.dashboardService.obterMetricas(this.dataInicio, this.dataFim),
      projecao: this.dashboardService.obterProjecao(this.dataInicio, this.dataFim),
      topReceitas: this.dashboardService.obterTopReceitas(this.dataInicio, this.dataFim),
      topDespesas: this.dashboardService.obterTopDespesas(this.dataInicio, this.dataFim)
    }).subscribe({
      next: (res) => {
        console.log('Dados carregados com sucesso:', res);
        this.metricas = res.metricas;
        this.destruirGraficos();
        this.renderizarGraficos(res.projecao, res.topReceitas, res.topDespesas);
      },
      error: (err) => {
        console.error('ERRO CRÍTICO NO DASHBOARD:', err);
        // Opcional: Adicionar um Toast de erro aqui
        alert('Erro ao carregar dados do Dashboard. Verifique o console.');
      }
    });
  }

  private renderizarGraficos(projecao: ProjecaoMensal[], topReceitas: TopCategoria[], topDespesas: TopCategoria[]): void {
    
    // 1. Gráfico de Barras (Posição)
    const chartBarras = new Chart(this.elementoGraficoBarras.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Recebidas / Pagas', 'Pendentes', 'Vencidas'],
        datasets: [
          { label: 'Receitas', data: [this.metricas.receitasRecebidas, this.metricas.receitasPendentes, this.metricas.receitasVencidas], backgroundColor: '#10b981', borderRadius: 4 },
          { label: 'Despesas', data: [this.metricas.despesasPagas, this.metricas.despesasPendentes, this.metricas.despesasVencidas], backgroundColor: '#ef4444', borderRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Posição do Período' } } }
    });

    // 2. Gráfico de Linhas (Projeção)
    const chartLinhas = new Chart(this.elementoGraficoLinhas.nativeElement, {
      type: 'line',
      data: {
        labels: projecao.map(p => p.mes),
        datasets: [
          { label: 'Receitas', data: projecao.map(p => p.receitas), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, fill: true },
          { label: 'Despesas', data: projecao.map(p => p.despesas), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4, fill: true }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Evolução no Período' } } }
    });

    // 3. Gráfico Top Receitas (Doughnut)
    const chartTopReceitas = new Chart(this.elementoTopReceitas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: topReceitas.map(t => t.nome),
        datasets: [{
          data: topReceitas.map(t => t.total),
          backgroundColor: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Top Maiores Receitas' }, legend: { position: 'right' } } }
    });

    // 4. Gráfico Top Despesas (Doughnut)
    const chartTopDespesas = new Chart(this.elementoTopDespesas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: topDespesas.map(t => t.nome),
        datasets: [{
          data: topDespesas.map(t => t.total),
          backgroundColor: ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'],
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Top Maiores Despesas' }, legend: { position: 'right' } } }
    });

    this.charts.push(chartBarras, chartLinhas, chartTopReceitas, chartTopDespesas);
  }
}