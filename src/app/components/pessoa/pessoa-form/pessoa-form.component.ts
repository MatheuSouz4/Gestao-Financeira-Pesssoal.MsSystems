import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { GenericValidator } from '../../../components/utilitarios/cpfCnpj.validator';
import { Pessoa, TipoPessoa } from '../../pessoa/pessoa.component'; // Ajuste o caminho

@Component({
  selector: 'app-pessoa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './pessoa-form.component.html',
  styleUrl: './pessoa-form.component.scss', // Pode reaproveitar o SCSS anterior renomeando o arquivo
  providers: [provideNgxMask()],
})
export class PessoaFormComponent implements OnInit {
  @Input() titulo: string = 'Cadastro'; // Para exibir "Novo Cliente" ou "Novo Fornecedor"
  @Input() itemEdicao: any | null = null;
  
  @Output() salvar = new EventEmitter<Pessoa>();
  @Output() fechar = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode: boolean = false;
  mascaraCpfCnpj: string = '000.000.000-00'; // Default para PF

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.itemEdicao;
    this.initForm();
    this.setupListeners();
  }

private initForm(): void {
  // 1. Pegamos o tipo inicial (padrão FISICA)
  const tipoInicial = this.itemEdicao?.tipoPessoa || TipoPessoa.FISICA;

  this.form = this.fb.group({
    id: [this.itemEdicao?.id || null],
    tipoPessoa: [tipoInicial, Validators.required], // MUDADO: de 'tipo' para 'tipoPessoa'
    
    nomeOuNomeFantasia: [
      this.itemEdicao?.nomeOuNomeFantasia || '', 
      [Validators.required, Validators.minLength(3)]
    ],
    cpfCnpj: [
      this.itemEdicao?.cpfCnpj || '', 
      [Validators.required, GenericValidator.isValidCpfCnpj]
    ],
    
    rg: [this.itemEdicao?.rg || ''],
    razaoSocial: [this.itemEdicao?.razaoSocial || ''], // Manteremos razaoSocial para bater com o DTO
    inscricaoEstadual: [this.itemEdicao?.inscricaoEstadual || ''],
    
    email: [this.itemEdicao?.email || '', [Validators.required, Validators.email]],
    telefone: [this.itemEdicao?.telefone || '', [Validators.required, Validators.minLength(10)]],
    endereco: [this.itemEdicao?.endereco || ''],
    descricao: [this.itemEdicao?.descricao || ''],
    status: [this.itemEdicao?.status || 'ATIVO']
  });

  this.atualizarValidacoesDinamicas(tipoInicial);
}

private atualizarValidacoesDinamicas(tipo: TipoPessoa): void {
  const rgControl = this.form.get('rg');
  const razaoSocialControl = this.form.get('razaoSocial'); // Corrigido o nome aqui
  const inscricaoEstadualControl = this.form.get('inscricaoEstadual');

  if (tipo === TipoPessoa.FISICA) {
    this.mascaraCpfCnpj = '000.000.000-00';
    razaoSocialControl?.setValue(null);
    razaoSocialControl?.clearValidators(); 
  } else {
    this.mascaraCpfCnpj = '00.000.000/0000-00';
    rgControl?.setValue(null);
    razaoSocialControl?.setValidators([Validators.required]); // Razão Social obrigatória para PJ
  }

  razaoSocialControl?.updateValueAndValidity();
  rgControl?.updateValueAndValidity();
}

  private setupListeners(): void {
    // Escuta as mudanças no radio button de Tipo de Pessoa
    this.form.get('tipoPessoa')?.valueChanges.subscribe((tipo: TipoPessoa) => {
      this.atualizarValidacoesDinamicas(tipo);
    });
  }


  get isPessoaFisica(): boolean {
    return this.form.get('tipoPessoa')?.value === TipoPessoa.FISICA;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const payload: Pessoa = this.form.value;
      this.salvar.emit(payload);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.fechar.emit();
  }
}