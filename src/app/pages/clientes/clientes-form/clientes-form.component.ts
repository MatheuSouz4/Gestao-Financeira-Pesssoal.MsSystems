import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { GenericValidator } from '../../../components/utilitarios/cpfCnpj.validator';
import { Cliente } from '../../../services/clientes.service';

@Component({
  selector: 'app-clientes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './clientes-form.component.html',
  styleUrl: './clientes-form.component.scss',
  providers: [provideNgxMask()],
})
export class ClientesFormComponent implements OnInit {
  @Input() clienteEdicao: Cliente | null = null;
  @Output() clienteSalvo = new EventEmitter<Cliente>();
  @Output() fechar = new EventEmitter<void>();

  clienteForm!: FormGroup;
  isEditMode: boolean = false;
  public cpfCnpjMask: string = "000.000.000-00||00.000.000/0000-00";

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.clienteEdicao;
    this.initForm();
  }

  private initForm(): void {
    this.clienteForm = this.fb.group({
      id: [this.clienteEdicao?.id || null],
      nome: [
        this.clienteEdicao?.nome || '', 
        [Validators.required, Validators.minLength(3)]
      ],
      email: [
        this.clienteEdicao?.email || '', 
        [Validators.required, Validators.email]
      ],
      telefone: [
        this.clienteEdicao?.telefone || '', 
        [Validators.required, Validators.minLength(10), Validators.maxLength(11)]
      ],
      cpfCnpj: [
        this.clienteEdicao?.cpfCnpj || '', 
        [Validators.required, GenericValidator.isValidCpfCnpj]
      ],
      endereco: [this.clienteEdicao?.endereco || ''],
      descricao: [this.clienteEdicao?.descricao || ''],
      // Alinhado com o Enum do Backend
      status: [this.clienteEdicao?.status || 'ATIVO']
    });
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
        const clientePayload: Cliente = this.clienteForm.value;
    
        console.log(this.isEditMode ? 'Atualizando cliente...' : 'Cadastrando novo cliente...', clientePayload);
    
        this.clienteSalvo.emit(clientePayload);
        this.fechar.emit();
    } else {
      this.clienteForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.fechar.emit();
  }
}

