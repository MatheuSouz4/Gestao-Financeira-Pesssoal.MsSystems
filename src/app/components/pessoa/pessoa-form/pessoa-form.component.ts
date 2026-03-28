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
    const tipo = this.itemEdicao?.tipoPessoa || TipoPessoa.FISICA;
    this.mascaraCpfCnpj = tipo === TipoPessoa.FISICA ? '000.000.000-00' : '00.000.000/0000-00';

    this.form = this.fb.group({
      id: [this.itemEdicao?.id || null],
      tipoPessoa: [tipo, Validators.required],
      
      nomeOuNomeFantasia: [
        this.itemEdicao?.nomeOuNomeFantasia || '', 
        [Validators.required, Validators.minLength(3)]
      ],
      cpfCnpj: [
        this.itemEdicao?.cpfCnpj || '', 
        [Validators.required, GenericValidator.isValidCpfCnpj]
      ],
      
      // Campos dinâmicos
      rg: [this.itemEdicao?.rg || ''],
      razaoSocial: [this.itemEdicao?.razaoSocial || ''],
      inscricaoEstadual: [this.itemEdicao?.inscricaoEstadual || ''],
      
      // Campos Comuns
      email: [this.itemEdicao?.email || '', [Validators.required, Validators.email]],
      telefone: [this.itemEdicao?.telefone || '', [Validators.required, Validators.minLength(10)]],
      endereco: [this.itemEdicao?.endereco || ''],
      descricao: [this.itemEdicao?.descricao || ''],
      status: [this.itemEdicao?.status || 'ATIVO']
    });

    // Aplica as validações corretas logo na inicialização
    this.atualizarValidacoesDinamicas(tipo);
  }

  private setupListeners(): void {
    // Escuta as mudanças no radio button de Tipo de Pessoa
    this.form.get('tipoPessoa')?.valueChanges.subscribe((tipo: TipoPessoa) => {
      this.atualizarValidacoesDinamicas(tipo);
    });
  }

  private atualizarValidacoesDinamicas(tipo: TipoPessoa): void {
    const rgControl = this.form.get('rg');
    const nomeFantasiaControl = this.form.get('nomeFantasia');
    const inscricaoEstadualControl = this.form.get('inscricaoEstadual');
    const cpfCnpjControl = this.form.get('cpfCnpj');

    if (tipo === TipoPessoa.FISICA) {
      this.mascaraCpfCnpj = '000.000.000-00';
      
      // Limpa dados de PJ caso o usuário tenha digitado e depois trocado
      nomeFantasiaControl?.setValue(null);
      inscricaoEstadualControl?.setValue(null);
      
      // Opcional: Adicionar validação de RG se for obrigatório para o seu negócio
      // rgControl?.setValidators([Validators.required]);
      
    } else {
      this.mascaraCpfCnpj = '00.000.000/0000-00';
      
      // Limpa dados de PF
      rgControl?.setValue(null);
      
      // Se Nome Fantasia for obrigatório para PJ, adicione aqui:
      // nomeFantasiaControl?.setValidators([Validators.required]);
    }

    // Recalcula a validade dos campos
    rgControl?.updateValueAndValidity();
    nomeFantasiaControl?.updateValueAndValidity();
    inscricaoEstadualControl?.updateValueAndValidity();
    
    // Força a revalidação do documento atual limpando a máscara temporariamente
    const documentoAtual = cpfCnpjControl?.value;
    cpfCnpjControl?.setValue('');
    cpfCnpjControl?.setValue(documentoAtual);
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