import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
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


  public cpfCnpjMask: string ="000.000.000-00||00.000.000/0000-00";

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {

    this.isEditMode = !!this.clienteEdicao;
    
    this.clienteForm = this.fb.group({

      id: [this.clienteEdicao ? this.clienteEdicao.id : null],
      
      nome: [
        this.clienteEdicao ? this.clienteEdicao.nome : '',
        [Validators.required, Validators.minLength(3)]
      ],
      
      email: [
        this.clienteEdicao ? this.clienteEdicao.email : '',
        [Validators.required, Validators.email]
      ],
      
      telefone: [
        this.clienteEdicao ? this.clienteEdicao.telefone : '',
        [Validators.required, Validators.minLength(11), Validators.maxLength(11)]
      ],

      cpf_Cnpj: [
        this.clienteEdicao ? this.clienteEdicao.cpf_Cnpj : '',
        [Validators.required, Validators.minLength(11), Validators.maxLength(14)]
      ],
      
      endereco: [
        this.clienteEdicao ? this.clienteEdicao.endereco : '',
        [Validators.required, Validators.maxLength(255)]
      ],

      descricao: [
        this.clienteEdicao ? this.clienteEdicao.descricao : ''
      ],
      
      status: [
        this.clienteEdicao ? this.clienteEdicao.status : 'Ativo'
      ],
    });

  }
  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    // Não precisa mais de this.limparFormatacao! O valor já é puro.
    const clientePayload: Cliente = this.clienteForm.value;
    
    console.log(this.isEditMode ? 'Atualizando cliente...' : 'Cadastrando novo cliente...', clientePayload);
    
    this.clienteSalvo.emit(clientePayload);
    this.fechar.emit();
}

  onCancel(): void {
    this.fechar.emit();
  }
  
}