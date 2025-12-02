import { CommonModule } from '@angular/common'; // Adicionado CommonModule
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'; // Adicionado Input/Output/EventEmitter
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Adicionado ReactiveFormsModule
import { Cliente, ClientesService } from '../../../services/clientes.service'; // 🚨 Serviço para Clientes
import { ClienteBase, Conta, ContasService, FornecedorBase, Recorrencia, TipoConta } from '../../../services/contas.service'; // 🚨 Importa o modelo e enums CIENTRAIS
import { Fornecedor, FornecedoresService } from '../../../services/fornecedores.service'; // 🚨 Serviço para Fornecedores

@Component({
  selector: 'app-contas-form',
  standalone:true,
  // 🚨 Adicionado Imports
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './contas-form.component.html',
  styleUrls: ['./contas-form.component.scss'],
})
export class ContasFormComponent implements OnInit {
  
  @Input() contaEdicao: Conta | null = null; // Para receber a conta a ser editada
  @Output() contaSalva = new EventEmitter<Conta>();
  @Output() fechar = new EventEmitter<void>();
  
  contaForm!: FormGroup;
  
  tiposConta: TipoConta[] = ['RECEITA', 'DESPESA'];
  recorrencias: Recorrencia[] = ['UNICA', 'SEMANAL', 'MENSAL', 'TRIMESTRAL', 'ANUAL'];
  
  // 🚨 Tipagem correta para as listas
  clientes: Cliente[] = []; 
  fornecedores: Fornecedor[] = [];

  constructor(
    private fb: FormBuilder,
    private contasService: ContasService, // 🚨 Injetar serviço de Contas
    private clienteService: ClientesService, // 🚨 Injetar serviço de Clientes
    private fornecedorService: FornecedoresService, // 🚨 Injetar serviço de Fornecedores
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDependentData();

    this.contaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.updateValidations(tipo);
    });
    
    // 🚨 Lógica para Edição
    if (this.contaEdicao) {
        this.popularFormulario(this.contaEdicao);
    }
  }
  
  popularFormulario(conta: Conta): void {
      this.contaForm.patchValue({
          nome: conta.nome,
          tipo: conta.tipo,
          recorrencia: conta.recorrencia,
          descricao: conta.descricao,
          // Preenche o ID correto no campo do formulário
          clienteId: conta.cliente?.id || null, 
          fornecedorId: conta.fornecedor?.id || null, 
      });
      this.updateValidations(conta.tipo);
  }

  initForm(): void {
    this.contaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['DESPESA', [Validators.required]], 
      // Campos de ID de relacionamento
      clienteId: [null], 
      fornecedorId: [null], 
      
      recorrencia: ['UNICA', [Validators.required]],
      descricao: [''],
    });
    this.updateValidations('DESPESA'); 
  }
  
loadDependentData(): void {
    // 🚨 CORREÇÃO: Usar o método getAll() e forçar a tipagem do 'data'
    this.clienteService.listar().subscribe((data: Cliente[]) => {
        this.clientes = data;
    });

    // 🚨 CORREÇÃO: Usar o método getAll() e forçar a tipagem do 'data'
    this.fornecedorService.listar().subscribe((data: Fornecedor[]) => {
        this.fornecedores = data;
    });
  }
  
  updateValidations(tipo: TipoConta): void {
    // ... (Lógica de validação do clienteId/fornecedorId conforme implementado)
    // ...
  }

  onSubmit(): void {
    if (this.contaForm.invalid) {
      this.contaForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.contaForm.value;
    
    const contaPayload: Conta = {
        // 🚨 Adiciona o ID para PUT, se for edição
        id: this.contaEdicao?.id, 
        nome: formValue.nome,
        tipo: formValue.tipo,
        recorrencia: formValue.recorrencia,
        descricao: formValue.descricao,
        // Constrói o DTO de relacionamento com apenas o ID
        cliente: formValue.tipo === 'RECEITA' && formValue.clienteId 
            ? { id: formValue.clienteId } as ClienteBase : undefined,
        fornecedor: formValue.tipo === 'DESPESA' && formValue.fornecedorId
            ? { id: formValue.fornecedorId } as FornecedorBase : undefined,
    };

    this.contasService.save(contaPayload).subscribe({
      next: (response) => {
        alert(`Conta ${response.id ? 'atualizada' : 'cadastrada'} com sucesso!`);
        this.contaSalva.emit(response); // Emite para o componente pai recarregar
      },
      error: (err) => {
        console.error('Erro ao salvar conta:', err);
        alert('Erro ao salvar conta. Verifique o console.');
      }
    });
  }
}