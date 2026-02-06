import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Conta, ContasService } from '../../services/contas.service';
import { Lancamento, TransacoesService } from '../../services/transacoes.service';

interface LancamentoVM extends Lancamento {
  nomeConta: string;
  statusReal: string;
}

@Component({
  selector: 'app-transacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transacoes.component.html',
  styleUrls: ['./transacoes.component.scss']
})
export class TransacoesComponent implements OnInit {
  activeTab: 'lancamentos' | 'pagamentos' = 'lancamentos';
  
  // Observables para os dados
  contas$!: Observable<Conta[]>;
  transacoesExibicao$!: Observable<LancamentoVM[]>;

  // Estado do Modal de Pagamento
  isModalAberto = false;
  itemParaPagar: LancamentoVM | null = null;
  formPagamento = { data: '', valor: 0, arquivo: null as File | null };

  constructor(
    private contasService: ContasService,
    private transacoesService: TransacoesService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.contas$ = this.contasService.listar();

    // Combina Contas e Lançamentos para criar a ViewModel (VM)
    this.transacoesExibicao$ = combineLatest([
      this.transacoesService.lancamentos$,
      this.contas$
    ]).pipe(
      map(([lancamentos, contas]) => {
        return lancamentos.map(l => {
          const contaBase = contas.find(c => c.id === l.contaId);
          return {
            ...l,
            nomeConta: contaBase ? contaBase.nome : 'Conta desconhecida',
            statusReal: this.transacoesService.calcularStatus(l)
          };
        });
      })
    );
  }

  // --- Ações de Lançamento ---
  salvarLancamento(form: NgForm): void {
    if (form.invalid) return;

    this.transacoesService.adicionar(form.value).subscribe({
      next: () => {
        this.toast.success('Lançamento realizado! Verifique a aba de pagamentos.');
        form.resetForm({ status: 'Pendente' });
      }
    });
  }

  // --- Ações de Pagamento ---
  abrirModal(item: LancamentoVM): void {
    this.itemParaPagar = item;
    this.formPagamento.valor = item.valor;
    this.formPagamento.data = new Date().toISOString().split('T')[0];
    this.isModalAberto = true;
  }

  confirmarPagamento(): void {
    if (!this.itemParaPagar) return;

    this.transacoesService.registrarPagamento(this.itemParaPagar.id!, {
      dataPagamento: this.formPagamento.data,
      valorPago: this.formPagamento.valor
    }).subscribe({
      next: () => {
        this.toast.success('Pagamento registrado com sucesso!');
        this.isModalAberto = false;
      }
    });
  }
}