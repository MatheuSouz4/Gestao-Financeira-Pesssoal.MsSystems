import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map } from 'rxjs';
import { ContasService } from '../../services/contas.service';
import { Lancamento, LancamentosService } from '../../services/lancamentos.service';
import { QuitacoesFormComponent } from './quitacoes-form/quitacoes-form.component';

@Component({
  selector: 'app-quitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, QuitacoesFormComponent],
  templateUrl: './quitacoes.component.html',
  styleUrls: ['./quitacoes.component.scss'] // Use o mesmo SCSS de lançamentos
})
export class QuitacoesComponent implements OnInit {
  lancamentosPendentes: any[] = [];
  filtroPendentes: any[] = [];
  termoPesquisa: string = '';
  
  isFormularioAberto: boolean = false;
  lancamentoParaQuitar: Lancamento | null = null;

  constructor(
    private lancamentosService: LancamentosService,
    private contasService: ContasService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    combineLatest([
      this.lancamentosService.lancamentos$,
      this.contasService.listar()
    ]).pipe(
      map(([lancamentos, contas]) => {
        // Filtra apenas Pendentes e Vencidas
        return lancamentos
          .filter(l => l.status !== 'Paga')
          .map(l => {
            const conta = contas.find(c => c.id === l.contaId);
            return {
              ...l,
              nomeConta: conta ? conta.nome : 'N/A',
              statusReal: this.lancamentosService.calcularStatus(l)
            };
          });
      })
    ).subscribe(res => {
      this.lancamentosPendentes = res;
      this.aplicarFiltro();
    });
  }

  aplicarFiltro(): void {
    const termo = this.termoPesquisa.toLowerCase();
    this.filtroPendentes = this.lancamentosPendentes.filter(l =>
      l.nomeConta.toLowerCase().includes(termo)
    );
  }

  abrirModalPagamento(lancamento: Lancamento): void {
    this.lancamentoParaQuitar = lancamento;
    this.isFormularioAberto = true;
  }

  confirmarPagamento(dadosPagamento: any): void {
    if (this.lancamentoParaQuitar?.id) {
      this.lancamentosService.registrarPagamento(this.lancamentoParaQuitar.id, dadosPagamento)
        .subscribe({
          next: () => {
            this.toast.success('Pagamento registrado com sucesso!');
            this.fecharFormulario();
          },
          error: () => this.toast.error('Erro ao registrar pagamento.')
        });
    }
  }

  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.lancamentoParaQuitar = null;
  }
}