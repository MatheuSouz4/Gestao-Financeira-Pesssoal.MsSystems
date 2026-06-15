import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Cliente, Fornecedor } from '../../../components/pessoa/pessoa.component';
import { ClientesService } from '../../../services/clientes.service';
import { Conta, TipoConta } from '../../../services/contas.service';
import { FornecedoresService } from '../../../services/fornecedores.service';

export interface ContaRequestPayload {
  id?: Number;
  nome: string;
  tipo: TipoConta;
  descricao?: string;
  status: 'Ativo' | 'Inativo' | string;
  clienteId?: string | null; 
  fornecedorId?: string | null;
}

@Component({
  selector: 'app-contas-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './contas-form.component.html',
  styleUrls: ['./contas-form.component.scss'],
})
export class ContasFormComponent implements OnInit {
  
  @Input() contaEdicao: Conta | null = null;
  @Output() contaSalva = new EventEmitter<ContaRequestPayload>();
  @Output() fechar = new EventEmitter<void>();
  
  contaForm!: FormGroup;
  isEditMode: boolean = false;
  tiposConta: TipoConta[] = ['RECEITA', 'DESPESA'];
  
  clientes: Cliente[] = []; 
  fornecedores: Fornecedor[] = [];

  // Injeções Modernas
  private fb = inject(FormBuilder);
  private clienteService = inject(ClientesService);
  private fornecedorService = inject(FornecedoresService);
  private toastService = inject(ToastrService);

  ngOnInit(): void {
    this.isEditMode = !!this.contaEdicao;
    this.initForm();
    this.loadDependentData();

    // Escuta mudanças no tipo de conta para alternar a validação
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
      recorrencia: ['UNICA', [Validators.required]], // Assumindo que você usa no HTML
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
  
  /**
   * Remove a obrigatoriedade cruzada. Se é Receita, Fornecedor não pode ser obrigatório, e vice-versa.
   */
  updateValidations(tipo: TipoConta): void {
    const clienteCtrl = this.contaForm.get('clienteId');
    const fornecedorCtrl = this.contaForm.get('fornecedorId');

    if (tipo === 'RECEITA') {
      clienteCtrl?.setValidators([Validators.required]);
      fornecedorCtrl?.clearValidators();
      fornecedorCtrl?.setValue(null);
    } else {
      fornecedorCtrl?.setValidators([Validators.required]);
      clienteCtrl?.clearValidators();
      clienteCtrl?.setValue(null);
    }

    clienteCtrl?.updateValueAndValidity();
    fornecedorCtrl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.contaForm.invalid) {
      this.contaForm.markAllAsTouched();
      this.toastService.warning('Por favor, preencha todos os campos obrigatórios corretamente.', 'Formulário Inválido');
      return;
    }
    
    const formValue = this.contaForm.value;

    // INTERCEPTAÇÃO E VALIDAÇÃO DE STATUS (UX Frontend)
    if (formValue.tipo === 'RECEITA') {
      const clienteSelecionado = this.clientes.find(c => Number(c.id) === Number(formValue.clienteId));
      if (clienteSelecionado && clienteSelecionado.status === 'INATIVO') {
        this.toastService.error(`O cliente "${clienteSelecionado.nomeOuNomeFantasia}" está INATIVO. Escolha um cliente ativo.`, 'Ação Bloqueada');
        return;
      }
    } else {
      const fornecedorSelecionado = this.fornecedores.find(f => Number(f.id) === Number(formValue.fornecedorId));
      if (fornecedorSelecionado && fornecedorSelecionado.status === 'INATIVO') {
        this.toastService.error(`O fornecedor "${fornecedorSelecionado.nomeOuNomeFantasia}" está INATIVO. Escolha um fornecedor ativo.`, 'Ação Bloqueada');
        return;
      }
    }

    const payload: ContaRequestPayload = {
        ...this.contaEdicao, 
        nome: formValue.nome,
        tipo: formValue.tipo,
        descricao: formValue.descricao,
        status: this.contaEdicao?.status || 'ATIVO', // Preserva o status ou assume Ativo na criação
        clienteId: formValue.tipo === 'RECEITA' ? formValue.clienteId : null,
        fornecedorId: formValue.tipo === 'DESPESA' ? formValue.fornecedorId : null,
    };

    this.contaSalva.emit(payload);
  }

  onCancel(): void {
    this.fechar.emit();
  }
}