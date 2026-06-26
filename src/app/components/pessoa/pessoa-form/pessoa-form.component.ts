import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { GenericValidator } from '../../../components/utilitarios/cpfCnpj.validator';
import { Pessoa, TipoPessoa } from '../../pessoa/pessoa.component';

@Component({
  selector: 'app-pessoa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './pessoa-form.component.html',
  styleUrl: './pessoa-form.component.scss',
  providers: [provideNgxMask()],
})
export class PessoaFormComponent implements OnInit {
  @Input() titulo: string = 'Cadastro';
  @Input() itemEdicao: any | null = null;
  @Output() salvar = new EventEmitter<Pessoa>();
  @Output() fechar = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode: boolean = false;
  mascaraCpfCnpj: string = '000.000.000-00';

  // Injeção moderna
  private fb = inject(FormBuilder);
  private toastService = inject(ToastrService); 

  ngOnInit(): void {
    this.isEditMode = !!this.itemEdicao;
    this.initForm();
    this.setupListeners();
  }

  private initForm(): void {
    const tipoInicial = this.itemEdicao?.tipoPessoa || TipoPessoa.FISICA;

    this.form = this.fb.group({
      id: [this.itemEdicao?.id || null],
      tipoPessoa: [tipoInicial, Validators.required],
      nomeOuNomeFantasia: [
        this.itemEdicao?.nomeOuNomeFantasia || '', 
        [Validators.required, Validators.minLength(3)]
      ],
      cpfCnpj: [
        this.itemEdicao?.cpfCnpj || '', 
        [Validators.required, GenericValidator.isValidCpfCnpj]
      ],
      rg: [this.itemEdicao?.rg || ''],
      razaoSocial: [this.itemEdicao?.razaoSocial || ''],
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
    const razaoSocialControl = this.form.get('razaoSocial');
    const inscricaoEstadualControl = this.form.get('inscricaoEstadual');

    if (tipo === TipoPessoa.FISICA) {
      this.mascaraCpfCnpj = '000.000.000-00';
      razaoSocialControl?.setValue(null);
      razaoSocialControl?.clearValidators();
    } else {
      this.mascaraCpfCnpj = '00.000.000/0000-00';
      rgControl?.setValue(null);
      razaoSocialControl?.setValidators([Validators.required]);
    }

    razaoSocialControl?.updateValueAndValidity();
    rgControl?.updateValueAndValidity();
  }

  private setupListeners(): void {
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
      // MENSAGEM: Campos Obrigatórios não preenchidos
      this.toastService.warning('Existem campos obrigatórios não preenchidos ou incorretos.', 'Atenção');
    }
  }

  onCancel(): void {
    this.fechar.emit();
  }
}