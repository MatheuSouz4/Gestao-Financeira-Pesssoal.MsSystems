import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { GenericValidator } from '../../../components/utilitarios/cpfCnpj.validator';
import { Fornecedor } from '../../../services/fornecedores.service';

@Component({
  selector: 'app-fornecedores-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgxMaskDirective],
  templateUrl: './fornecedores-form.component.html',
  styleUrl: './fornecedores-form.component.scss',
  providers: [provideNgxMask()],
})

export class FornecedoresFormComponent implements OnInit {
  @Input() fornecedorEdicao: Fornecedor | null = null;
  @Output() fornecedorSalvo = new EventEmitter<Fornecedor>();
  @Output() fechar = new EventEmitter<void>();

  fornecedorForm!: FormGroup;
  isEditMode: boolean = false;
  public cpfCnpjMask: string ="000.000.000-00||00.000.000/0000-00";

  constructor( private fb: FormBuilder,) {}

  ngOnInit(): void {
    this.isEditMode = !!this.fornecedorEdicao;
    this.initForm();
  }

  private initForm(): void {
    this.fornecedorForm = this.fb.group({

      id: [this.fornecedorEdicao?.id || null],
      
      nomeFantasia: [
        this.fornecedorEdicao?.nomeFantasia || '',
        [Validators.required, Validators.minLength(3)]
      ],

      razaoSocial: [
        this.fornecedorEdicao?.razaoSocial || '',
        [Validators.required, Validators.minLength(3)]
      ],
      
      email: [
        this.fornecedorEdicao?.email || '',
        [Validators.required, Validators.email]
      ],
      
      telefone: [
        this.fornecedorEdicao?.telefone || '',
        [Validators.required,Validators.minLength(11), Validators.maxLength(11)]
      ],

      cpfCnpj: [
        this.fornecedorEdicao?.cpfCnpj || '',
        [Validators.required, GenericValidator.isValidCpfCnpj]
      ],
      
      endereco: [
        this.fornecedorEdicao?.endereco || '',
        [Validators.required, Validators.maxLength(255)]
      ],

      descricao: [
        this.fornecedorEdicao?.descricao || ''
      ],
      
      status: [
        this.fornecedorEdicao?.status || 'ATIVO'
      ],
    });
  }

  onSubmit(): void {
    if (this.fornecedorForm.valid) {
        const fornecedorPayload: Fornecedor = this.fornecedorForm.value;
        console.log(this.isEditMode ? 'Atualizando fornecedor...' : 'Cadastrando novo fornecedor...', fornecedorPayload);
        this.fornecedorSalvo.emit(fornecedorPayload);
        this.fechar.emit();
    } else {
      this.fornecedorForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.fechar.emit();
  }
}