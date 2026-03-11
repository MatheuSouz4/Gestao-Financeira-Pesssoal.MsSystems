import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Conta, ContasService } from '../../../services/contas.service';

@Component({
  selector: 'app-lancamentos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lancamentos-form.component.html',
  styleUrls: ['./lancamentos-form.component.scss'] // Pode copiar o SCSS do contas-form
})
export class LancamentosFormComponent implements OnInit {
  @Input() lancamentoEdicao: any | null = null;
  @Output() salvar = new EventEmitter<any>();
  @Output() fechar = new EventEmitter<void>();

  form!: FormGroup;
  contas: Conta[] = [];

  constructor(
    private fb: FormBuilder,
    private contasService: ContasService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarContas();
    if (this.lancamentoEdicao) {
      this.form.patchValue(this.lancamentoEdicao);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      contaId: ['', Validators.required],
      vencimento: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      descricao: ['']
    });
  }

  carregarContas(): void {
    this.contasService.listar().subscribe(res => this.contas = res);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.salvar.emit(this.form.value);
    }
  }
}