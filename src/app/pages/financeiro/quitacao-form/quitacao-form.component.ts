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
    const hoje = new Date().toISOString().split('T')[0];
    
    this.quitacaoForm = this.fb.group({
      dataPagamento: [hoje, Validators.required],
      valorPago: [this.lancamento?.valor || 0, [Validators.required, Validators.min(0.01)]],
      novaDataVencimento: [''] 
    });

    // Monitora o valor digitado para aplicar validação dinâmica na nova data de vencimento
    this.quitacaoForm.get('valorPago')?.valueChanges.subscribe(valor => {
      const novaDataCtrl = this.quitacaoForm.get('novaDataVencimento');
      if (this.isPagamentoParcial) {
        novaDataCtrl?.setValidators([Validators.required]);
      } else {
        novaDataCtrl?.clearValidators();
      }
      novaDataCtrl?.updateValueAndValidity();
    });
  }

  get isPagamentoParcial(): boolean {
    const valorPago = this.quitacaoForm.get('valorPago')?.value || 0;
    return this.lancamento && valorPago < this.lancamento.valor;
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.arquivoSelecionado = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.quitacaoForm.valid) {
      const formData = new FormData();
      const dataPagamento = this.quitacaoForm.get('dataPagamento')?.value;
      const valorPago = this.quitacaoForm.get('valorPago')?.value;
      const novaDataVencimento = this.quitacaoForm.get('novaDataVencimento')?.value;

      formData.append('dataPagamento', dataPagamento); 
      
      // CORREÇÃO SÊNIOR: Força o padrão americano com "." decimal (ex: 1000.50)
      // Evita falha de parse no BigDecimal do Spring Boot.
      const valorFormatado = Number(valorPago).toFixed(2);
      formData.append('valorPago', valorFormatado);
      
      if (this.isPagamentoParcial && novaDataVencimento) {
        formData.append('novaDataVencimento', novaDataVencimento);
      }
      
      if (this.arquivoSelecionado) {
        formData.append('comprovante', this.arquivoSelecionado);
      }

      this.confirmar.emit(formData);
    }
  }
}