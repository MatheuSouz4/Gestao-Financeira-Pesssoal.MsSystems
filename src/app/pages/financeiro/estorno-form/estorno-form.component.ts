import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-estorno-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estorno-form.component.html',
  styleUrls: ['./estorno-form.component.scss']
})
export class EstornoFormComponent implements OnInit {
  @Input() lancamento: any;
  // Assinatura atualizada
  @Output() confirmar = new EventEmitter<{ id: number, justificativa: string, retornarPendente: boolean }>();
  @Output() fechar = new EventEmitter<void>();

  estornoForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.estornoForm = this.fb.group({
      tipoAcao: ['PENDENTE', Validators.required],
      justificativa: [''] // Inicia sem validação, pois PENDENTE é o padrão
    });

    // Escuta mudanças de opção do usuário
    this.estornoForm.get('tipoAcao')?.valueChanges.subscribe(() => {
      this.atualizarValidacoes();
    });
  }

  // Adiciona ou remove a obrigatoriedade dinamicamente
  atualizarValidacoes(): void {
    const tipoAcao = this.estornoForm.get('tipoAcao')?.value;
    const justificativaControl = this.estornoForm.get('justificativa');

    if (tipoAcao === 'ESTORNADA') {
      justificativaControl?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      justificativaControl?.clearValidators();
    }
    justificativaControl?.updateValueAndValidity(); // Força a atualização do formulário
  }

  onSubmit(): void {
    if (this.estornoForm.valid && this.lancamento) {
      const isRetornarPendente = this.estornoForm.value.tipoAcao === 'PENDENTE';
      
      this.confirmar.emit({
        id: this.lancamento.id,
        justificativa: this.estornoForm.value.justificativa,
        retornarPendente: isRetornarPendente
      });
    } else {
      this.estornoForm.markAllAsTouched();
    }
  }
}