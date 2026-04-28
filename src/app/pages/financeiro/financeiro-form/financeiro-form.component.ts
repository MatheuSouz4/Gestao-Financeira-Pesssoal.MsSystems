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
  contas: any[] = []; // Lista de contas para o Select

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
      valor: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  preencherFormulario(): void {
    // Quando editamos, precisamos mapear os dados que vêm da tabela para o formato do DTO
    this.financeiroForm.patchValue({
      id: this.financeiroEdicao.id,
      contaId: this.financeiroEdicao.conta?.id, // Extrai o ID do objeto Conta
      descricao: this.financeiroEdicao.descricao,
      vencimento: this.financeiroEdicao.dataVencimento, // Backend manda dataVencimento, DTO espera vencimento
      valor: this.financeiroEdicao.valor
    });
  }

  onSubmit(): void {
    if (this.financeiroForm.valid) {
      this.salvar.emit(this.financeiroForm.value);
    } else {
      this.financeiroForm.markAllAsTouched(); // Destaca os campos com erro em vermelho
    }
  }

  onCancelar(): void {
    this.fechar.emit();
  }
}