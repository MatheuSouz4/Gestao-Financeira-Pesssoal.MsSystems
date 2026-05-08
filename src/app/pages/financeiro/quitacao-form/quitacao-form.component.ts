import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-quitacao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quitacao-form.component.html',
  styleUrls: ['./quitacao-form.component.scss']
})
export class QuitacaoFormComponent implements OnInit {
  @Input() lancamento: any; // Recebe o lançamento que será quitado
  @Output() confirmar = new EventEmitter<FormData>();
  @Output() fechar = new EventEmitter<void>();

  quitacaoForm!: FormGroup;
  arquivoSelecionado: File | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];
    
    this.quitacaoForm = this.fb.group({
      dataPagamento: [hoje, Validators.required],
      valorPago: [this.lancamento?.valor || 0, [Validators.required, Validators.min(0.01)]]
    });
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.arquivoSelecionado = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.quitacaoForm.valid) {
      const formData = new FormData();
      formData.append('dataPagamento', this.quitacaoForm.get('dataPagamento')?.value);
      formData.append('valorPago', this.quitacaoForm.get('valorPago')?.value);
      
      if (this.arquivoSelecionado) {
        formData.append('comprovante', this.arquivoSelecionado);
      }

      this.confirmar.emit(formData);
    }
  }
}