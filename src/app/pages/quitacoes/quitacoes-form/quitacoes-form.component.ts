import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Lancamento } from '../../../services/lancamentos.service';

@Component({
  selector: 'app-quitacoes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quitacoes-form.component.html',
  styleUrls: ['./quitacoes-form.component.scss']
})
export class QuitacoesFormComponent implements OnInit {
  @Input() lancamento: Lancamento | null = null;
  @Output() confirmar = new EventEmitter<any>();
  @Output() fechar = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      dataPagamento: [new Date().toISOString().split('T')[0], Validators.required],
      valorPago: [this.lancamento?.valor, [Validators.required, Validators.min(0.01)]],
      comprovanteUrl: ['']
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.confirmar.emit(this.form.value);
    }
  }
}