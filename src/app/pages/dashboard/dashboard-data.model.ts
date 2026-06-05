export interface DashboardResponseDTO {
  receitasRecebidas: number;
  receitasPendentes: number;
  despesasPagas: number;
  despesasPendentes: number;
  receitasVencidas: number;
  despesasVencidas: number;
  qtdPendentes: number;
  totalReceitas: number;
  totalDespesas: number;
  saldoPeriodo: number;
}