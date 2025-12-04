import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
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

  constructor(
      private fb: FormBuilder,
      ) {}

  ngOnInit(): void {

    this.isEditMode = !!this.fornecedorEdicao;
    
    this.fornecedorForm = this.fb.group({

      id: [this.fornecedorEdicao ? this.fornecedorEdicao.id : null],
      
      nomeFantasia: [
        this.fornecedorEdicao ? this.fornecedorEdicao.nomeFantasia : '',
        [Validators.required, Validators.minLength(3)]
      ],

      razaoSocial: [
        this.fornecedorEdicao ? this.fornecedorEdicao.razaoSocial: '',
        [Validators.required, Validators.minLength(3)]
      ],
      
      email: [
        this.fornecedorEdicao ? this.fornecedorEdicao.email : '',
        [Validators.required, Validators.email]
      ],
      
      telefone: [
        this.fornecedorEdicao ? this.fornecedorEdicao.telefone : '',
        [Validators.required,Validators.minLength(11), Validators.maxLength(11)]
      ],

      cpf_Cnpj: [
        this.fornecedorEdicao ? this.fornecedorEdicao.cpf_Cnpj : '',

        [Validators.required, Validators.minLength(11), Validators.maxLength(14)]
      ],
      
      endereco: [
        this.fornecedorEdicao ? this.fornecedorEdicao.endereco : '',
        [Validators.required, Validators.maxLength(255)]
      ],

      descricao: [
        this.fornecedorEdicao ? this.fornecedorEdicao.descricao : ''
      ],
      
      status: [
        this.fornecedorEdicao ? this.fornecedorEdicao.status : 'Ativo'
      ],
    });
  }

  onSubmit(): void {
    if (this.fornecedorForm.invalid) {

      this.fornecedorForm.markAllAsTouched();
      return;
    }

    const fornecedorPayload: Fornecedor = this.fornecedorForm.value;
    
    console.log(this.isEditMode ? 'Atualizando fornecedor...' : 'Cadastrando novo fornecedor...', fornecedorPayload);
    

    this.fornecedorSalvo.emit(fornecedorPayload);
    
    this.fechar.emit();
  }

  onCancel(): void {
    this.fechar.emit();
  }
  
}