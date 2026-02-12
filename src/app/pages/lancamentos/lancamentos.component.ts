import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Conta, ContasService } from '../../services/contas.service';
import { Lancamento, LancamentosService } from '../../services/lancamentos.service';

interface LancamentoVM extends Lancamento {
  nomeConta: string;
  statusReal: string;
}

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.scss']
})
export class LancamentosComponent {
    // Observables para os dados
    contas$!: Observable<Conta[]>;
    transacoesExibicao$!: Observable<LancamentoVM[]>;
  
    constructor(
      private contasService: ContasService,
      private lancamentosService: LancamentosService,
      private toast: ToastrService
    ) {}
  
    ngOnInit(): void {
      this.contas$ = this.contasService.listar();
  
      // Combina Contas e Lançamentos para criar a ViewModel (VM)
      this.transacoesExibicao$ = combineLatest([
        this.lancamentosService.lancamentos$,
        this.contas$
      ]).pipe(
        map(([lancamentos, contas]) => {
          return lancamentos.map(l => {
            const contaBase = contas.find(c => c.id === l.contaId);
            return {
              ...l,
              nomeConta: contaBase ? contaBase.nome : 'Conta desconhecida',
              statusReal: this.lancamentosService.calcularStatus(l)
            };
          });
        })
      );
    }
  
    // --- Ações de Lançamento ---
    salvarLancamento(form: NgForm): void {
      if (form.invalid) return;
  
      this.lancamentosService.adicionar(form.value).subscribe({
        next: () => {
          this.toast.success('Lançamento realizado! Verifique a aba de pagamentos.');
          form.resetForm({ status: 'Pendente' });
        }
      });
    }
    
}
