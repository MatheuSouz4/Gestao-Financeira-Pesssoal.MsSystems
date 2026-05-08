import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContasService } from '../../../services/contas.service';

@Component({
  selector: 'app-financeiro-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './financeiro-form.component.html',
  styleUrls: ['./financeiro-form.component.scss']
})
export class FinanceiroFormComponent implements OnInit {
  @Input() financeiroEdicao: any = null;
  @Output() salvar = new EventEmitter<any>();
  @Output() fechar = new EventEmitter<void>();

  financeiroForm!: FormGroup;
  contas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private contasService: ContasService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
    this.iniciarFormulario();

    if (this.financeiroEdicao) {
      this.preencherFormulario();
    }
  }

  carregarContas(): void {
    this.contasService.listar().subscribe({
      next: (dados) => this.contas = dados,
      error: (err) => console.error('Erro ao buscar contas:', err)
    });
  }

  iniciarFormulario(): void {
    this.financeiroForm = this.fb.group({
      id: [null],
      contaId: ['', Validators.required],
      descricao: ['', Validators.required],
      vencimento: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      tipoRecorrencia: ['NENHUMA'], // Novo campo
      quantidadeParcelas: [1]       // Novo campo
    });

    // Monitora as mudanças do tipo de recorrência para exigir parcelas
    this.financeiroForm.get('tipoRecorrencia')?.valueChanges.subscribe(tipo => {
      const parcelasCtrl = this.financeiroForm.get('quantidadeParcelas');
      if (tipo === 'NENHUMA') {
        parcelasCtrl?.setValue(1);
        parcelasCtrl?.clearValidators();
      } else {
        parcelasCtrl?.setValidators([Validators.required, Validators.min(2)]);
      }
      parcelasCtrl?.updateValueAndValidity();
    });
  }

  preencherFormulario(): void {
    this.financeiroForm.patchValue({
      id: this.financeiroEdicao.id,
      contaId: this.financeiroEdicao.conta?.id,
      descricao: this.financeiroEdicao.descricao,
      vencimento: this.financeiroEdicao.dataVencimento,
      valor: this.financeiroEdicao.valor,
      tipoRecorrencia: 'NENHUMA', // Na edição de 1 item, a recorrência é padrão
      quantidadeParcelas: 1
    });
  }

  onSubmit(): void {
    if (this.financeiroForm.valid) {
      this.salvar.emit(this.financeiroForm.value);
    } else {
      this.financeiroForm.markAllAsTouched();
    }
  }

  onCancelar(): void {
    this.fechar.emit();
  }
}