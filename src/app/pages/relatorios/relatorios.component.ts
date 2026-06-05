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
  
  // Opções espelhadas do Back-end
  tiposRelatorio = [
    { valor: 'EXTRATO_GERAL', label: 'Extrato Geral (Todos os Lançamentos)' },
    { valor: 'RECEITAS_RECEBIDAS', label: 'Receitas Recebidas' },
    { valor: 'RECEITAS_PENDENTES', label: 'Receitas Pendentes' },
    { valor: 'DESPESAS_PAGAS', label: 'Despesas Pagas' },
    { valor: 'DESPESAS_PENDENTES', label: 'Despesas Pendentes' },
    { valor: 'LANCAMENTOS_VENCIDOS', label: 'Inadimplência (Lançamentos Vencidos)' }
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
      this.toast.warning('Por favor, informe a data de início e fim.');
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
          
          // NOVA VALIDAÇÃO: Captura o 404 do Back-end e exibe a mensagem amigável
          if (err.status === 404) {
            this.toast.info('Não há lançamentos para o tipo e período selecionados.', 'Relatório Vazio');
          } else {
            // Mantém o erro genérico para falhas de servidor (500) ou conexão
            this.toast.error('Erro ao gerar relatório. Verifique os dados e tente novamente.');
          }
        }
      });
  }

  // --- Auxiliares para inicializar as datas no mês atual ---
  private getPrimeiroDiaMes(): string {
    const data = new Date();
    return new Date(data.getFullYear(), data.getMonth(), 1).toISOString().split('T')[0];
  }

  private getUltimoDiaMes(): string {
    const data = new Date();
    return new Date(data.getFullYear(), data.getMonth() + 1, 0).toISOString().split('T')[0];
  }
}