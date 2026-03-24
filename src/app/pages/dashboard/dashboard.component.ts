import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  // 1. Declare a variável 'hoje' para o cabeçalho
  hoje: Date = new Date();

  // 2. Inicialize o objeto 'resumo' para evitar erros de undefined no template
  resumo = {
    totalPago: 0,
    totalPendente: 0,
    qtdPendentes: 0
  };

  // Configuração do Gráfico
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Pagamentos (R$)',
        backgroundColor: 'rgba(67, 97, 238, 0.2)', // Azul suave
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarResumo();
    this.carregarDadosGrafico();
  }

  carregarResumo() {
    this.http.get<any>('http://localhost:8080/lancamentos/resumo')
      .subscribe({
        next: (dados) => this.resumo = dados,
        error: (err) => console.error('Erro ao buscar resumo:', err)
      });
  }

  carregarDadosGrafico() {
    this.http.get<any[]>('http://localhost:8080/lancamentos/grafico')
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