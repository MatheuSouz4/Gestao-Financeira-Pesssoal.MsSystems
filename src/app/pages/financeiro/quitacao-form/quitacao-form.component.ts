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
  @Input() lancamento: any; // Recebe o lançamento do backend
  @Output() confirmar = new EventEmitter<FormData>();
  @Output() fechar = new EventEmitter<void>();

  quitacaoForm!: FormGroup;
  arquivoSelecionado: File | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Pega a data de hoje no formato YYYY-MM-DD
    const hoje = new Date().toISOString().split('T')[0];
    
    this.quitacaoForm = this.fb.group({
      dataPagamento: [hoje, Validators.required],
      // Inicia com o valor previsto do lançamento
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
    
    // 1. Pegamos os valores do formulário
    const dataPagamento = this.quitacaoForm.get('dataPagamento')?.value;
    const valorPago = this.quitacaoForm.get('valorPago')?.value;

    // 2. Preparamos o FormData exatamente como no Postman
    formData.append('dataPagamento', dataPagamento); 
    formData.append('valorPago', valorPago.toString()); // O Java recebe como BigDecimal
    
    if (this.arquivoSelecionado) {
      formData.append('comprovante', this.arquivoSelecionado);
    }

    // 3. Emitimos o FormData para o componente pai
    // Certifique-se de que o componente pai saiba QUAL ID quitar
    this.confirmar.emit(formData);
  }
}
}