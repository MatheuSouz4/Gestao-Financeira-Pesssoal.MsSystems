import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../../services/clientes.service';


@Component({
  selector: 'app-clientes-form',
  standalone: true,
  // Importamos o ReactiveFormsModule para usar FormGroups/FormControls
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './clientes-form.component.html',
  styleUrl: './clientes-form.component.scss',
})
export class ClientesFormComponent implements OnInit {
  // Recebe o cliente a ser editado. Se for null/undefined, é modo Cadastro.
  @Input() clienteEdicao: Cliente | null = null; 
  
  // Evento disparado ao salvar ou atualizar
  @Output() clienteSalvo = new EventEmitter<Cliente>();
  
  // Evento para fechar o modal/overlay
  @Output() fechar = new EventEmitter<void>();

  // O nosso FormGroup principal
  clienteForm!: FormGroup;
  
  // Variável para determinar o título do formulário
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Verifica se estamos em modo edição
    this.isEditMode = !!this.clienteEdicao; 
    
    this.clienteForm = this.fb.group({
      // Definimos o ID apenas para edição/atualização, não para cadastro
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
        [Validators.required, Validators.pattern('^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$')] // Padrão (99) 99999-9999
      ],

      // NOVO CAMPO: CPF/CNPJ
      cpf_cnpj: [
        this.clienteEdicao ? this.clienteEdicao.cpf_cnpj : '',
        // Adicionando validação simples de obrigatoriedade por enquanto
        [Validators.required, Validators.minLength(11)] 
      ], 
      
      // NOVO CAMPO: Endereço
      endereco: [
        this.clienteEdicao ? this.clienteEdicao.endereco : '',
        [Validators.required, Validators.maxLength(255)]
      ],

      // NOVO CAMPO: Descrição (Opcional)
      descricao: [
        this.clienteEdicao ? this.clienteEdicao.descricao : ''
      ],
      
      // Status só é relevante na edição, pode ser um campo oculto ou opcional
      status: [
        this.clienteEdicao ? this.clienteEdicao.status : 'Ativo' 
      ],
    });
  }

  // Método chamado ao submeter o formulário
  onSubmit(): void {
    if (this.clienteForm.invalid) {
      // Marca todos os campos como 'touched' para exibir mensagens de erro
      this.clienteForm.markAllAsTouched();
      return;
    }

    const clientePayload: Cliente = this.clienteForm.value;
    
    // Simulação de chamada de API:
    console.log(this.isEditMode ? 'Atualizando cliente...' : 'Cadastrando novo cliente...', clientePayload);
    
    // Emite o evento com os dados salvos
    this.clienteSalvo.emit(clientePayload); 
    
    // Fecha o formulário após a operação (simulação)
    this.fechar.emit(); 
  }

  onCancel(): void {
    this.fechar.emit();
  }
}