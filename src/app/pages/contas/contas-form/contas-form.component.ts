import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Cliente, ClientesService } from '../../../services/clientes.service';
import { Conta, ContasService, Recorrencia, TipoConta } from '../../../services/contas.service';
import { Fornecedor, FornecedoresService } from '../../../services/fornecedores.service';

export interface ContaRequestPayload {
  id?: Number;
  nome: string;
  tipo: TipoConta;
  recorrencia: Recorrencia;
  descricao?: string;
  status: 'Ativo' | 'Inativo' | string;
  
  clienteId?: string | null; 
  fornecedorId?: string | null;
}


@Component({
  selector: 'app-contas-form',
  standalone:true,
  
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './contas-form.component.html',
  styleUrls: ['./contas-form.component.scss'],
})

export class ContasFormComponent implements OnInit {
  
  @Input() contaEdicao: Conta | null = null;
  @Output() contaSalva = new EventEmitter<Conta>();
  @Output() fechar = new EventEmitter<void>();
  
  contaForm!: FormGroup;

  isEditMode: boolean = false;
  
  tiposConta: TipoConta[] = ['RECEITA', 'DESPESA'];
  recorrencias: Recorrencia[] = ['UNICA', 'SEMANAL', 'MENSAL', 'TRIMESTRAL', 'ANUAL'];
  
  clientes: Cliente[] = []; 
  fornecedores: Fornecedor[] = [];

  constructor(
    private fb: FormBuilder,
    private contasService: ContasService,
    private clienteService: ClientesService,
    private fornecedorService: FornecedoresService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {

    this.isEditMode = !!this.contaEdicao;


    this.initForm();
    this.loadDependentData();

    this.contaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.updateValidations(tipo);
    });
    
    if (this.contaEdicao) {
        this.popularFormulario(this.contaEdicao);
    }
  }
  
  popularFormulario(conta: Conta): void {
    
    const clienteRelacionamento = (conta as any).clienteId || conta.cliente;
    const fornecedorRelacionamento = (conta as any).fornecedorId || conta.fornecedor;
    
    const clienteIdValor = typeof clienteRelacionamento === 'object' ? clienteRelacionamento?.id : clienteRelacionamento;
    const fornecedorIdValor = typeof fornecedorRelacionamento === 'object' ? fornecedorRelacionamento?.id : fornecedorRelacionamento;
    
    this.contaForm.patchValue({
        nome: conta.nome,
        tipo: conta.tipo,
        recorrencia: conta.recorrencia,
        descricao: conta.descricao,
      
        clienteId: clienteIdValor || null, 
        fornecedorId: fornecedorIdValor || null, 
    });
    this.updateValidations(conta.tipo);
}

  initForm(): void {
    this.contaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['DESPESA', [Validators.required]], 
     
      clienteId: [null], 
      fornecedorId: [null], 
      
      recorrencia: ['UNICA', [Validators.required]],
      descricao: [''],
    });
    this.updateValidations('DESPESA'); 
  }
  
loadDependentData(): void {
    
    this.clienteService.listar().subscribe((data: Cliente[]) => {
        this.clientes = data;
    });

    this.fornecedorService.listar().subscribe((data: Fornecedor[]) => {
        this.fornecedores = data;
    });
  }
  
  updateValidations(tipo: TipoConta): void {

  }

  onSubmit(): void {
    if (this.contaForm.invalid) {
      this.contaForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.contaForm.value;
    const payload: ContaRequestPayload = {
        id: this.contaEdicao?.id,
        nome: formValue.nome,
        tipo: formValue.tipo,
        recorrencia: formValue.recorrencia,
        descricao: formValue.descricao,
        status: this.contaEdicao?.status || 'ATIVO',
        clienteId: formValue.tipo === 'RECEITA' ? formValue.clienteId : null,
        fornecedorId: formValue.tipo === 'DESPESA' ? formValue.fornecedorId : null,
    };
    
    console.log(this.isEditMode ? 'Atualizando conta...' : 'Cadastrando um nova conta...', payload);

    let operacao$: Observable<Conta>;


    if (this.isEditMode) {
        operacao$ = this.contasService.atualizar(payload as unknown as Conta); 

    } else {
        operacao$ = this.contasService.adicionar(payload as unknown as Conta); 
    }

    operacao$.subscribe({
        next: (response) => {
            this.toastService.success(`Conta ${this.isEditMode ? 'Atualizada' : 'Cadastrada'} com sucesso!`);
            this.contaSalva.emit(response);
            this.fechar.emit();
        },
        error: (err) => {
            this.toastService.error('Erro ao salvar conta.');
        }
    });

  }

  onCancel(): void {
    this.fechar.emit();
  }
}