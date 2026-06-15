import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RelatoriosService } from '../../services/relatorios.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class RelatoriosComponent {
  
  tiposRelatorio = [
    { valor: 'EXTRATO_GERAL', label: 'Extrato Geral (Todos os Lançamentos)' },
    { valor: 'TODAS_RECEITAS', label: 'Todas as Receitas' },
    { valor: 'RECEITAS_RECEBIDAS', label: 'Apenas Receitas Recebidas' },
    { valor: 'RECEITAS_PENDENTES', label: 'Apenas Receitas Pendentes' },
    { valor: 'RECEITAS_VENCIDAS', label: 'Apenas Receitas Vencidas' },
    { valor: 'TODAS_DESPESAS', label: 'Todas as Despesas' },
    { valor: 'DESPESAS_PAGAS', label: 'Apenas Despesas Pagas' },
    { valor: 'DESPESAS_PENDENTES', label: 'Apenas Despesas Pendentes' },
    { valor: 'DESPESAS_VENCIDAS', label: 'Apenas Despesas Vencidas' },
    { valor: 'LANCAMENTOS_VENCIDOS', label: 'Inadimplência Geral (Tudo Vencido)' }
  ];

  filtro = {
    tipo: 'EXTRATO_GERAL',
    dataInicio: this.getPrimeiroDiaMes(),
    dataFim: this.getUltimoDiaMes()
  };

  isProcessando = false;

  constructor(
    private relatoriosService: RelatoriosService,
    private toast: ToastrService
  ) {}

  gerarRelatorio(formato: 'csv' | 'pdf'): void {
    if (!this.filtro.dataInicio || !this.filtro.dataFim) {
      this.toast.warning('Por favor, informe a data de início e fim.', 'Atenção');
      return;
    }

    this.isProcessando = true;

    this.relatoriosService.baixarRelatorio(formato, this.filtro.tipo, this.filtro.dataInicio, this.filtro.dataFim)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Relatorio_MsSystems_${this.filtro.tipo}_${this.filtro.dataInicio}.${formato}`;
          link.click();
          window.URL.revokeObjectURL(url);
          
          this.toast.success(`Relatório em ${formato.toUpperCase()} gerado com sucesso!`);
          this.isProcessando = false;
        },
        error: (err: any) => {
          this.isProcessando = false;
          if (err.status === 404) {
            this.toast.info('Não há lançamentos para o tipo e período selecionados.', 'Relatório Vazio');
          } else {
            this.toast.error('Erro ao gerar relatório. Verifique os dados e tente novamente.');
          }
        }
      });
  }

  private getPrimeiroDiaMes(): string {
    const data = new Date();
    return new Date(data.getFullYear(), data.getMonth(), 1).toISOString().split('T')[0];
  }

  private getUltimoDiaMes(): string {
    const data = new Date();
    return new Date(data.getFullYear(), data.getMonth() + 1, 0).toISOString().split('T')[0];
  }
}