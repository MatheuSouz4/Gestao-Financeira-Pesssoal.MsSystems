import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContasService } from '../../../services/contas.service';

@Component({
  selector: 'app-financeiro-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './financeiro-form.component.html',
  styleUrls: ['./financeiro-form.component.scss']
})
export class FinanceiroFormComponent implements OnInit {
  @Input() financeiroEdicao: any = null;
  @Output() salvar = new EventEmitter<any>();
  @Output() fechar = new EventEmitter<void>();

  isEditMode: boolean = false;
  
  financeiroForm!: FormGroup;
  todasContas: any[] = [];
  contasFiltradas: any[] = [];
  tipoSelecionado: string = ''; 

  constructor(
    private fb: FormBuilder,
    private contasService: ContasService
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.carregarContas();
  }

  iniciarFormulario(): void {
    this.financeiroForm = this.fb.group({
      id: [null],
      descricao: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      vencimento: ['', Validators.required],
      contaId: [null, Validators.required],
      tipoRecorrencia: ['NENHUMA'],
      quantidadeParcelas: [1],
      motivoAlteracao: ['']
    });

    this.financeiroForm.get('tipoRecorrencia')?.valueChanges.subscribe(tipo => {
      const parcelasCtrl = this.financeiroForm.get('quantidadeParcelas');
      if (tipo === 'NENHUMA') {
        parcelasCtrl?.setValue(1);
        parcelasCtrl?.clearValidators();
      } else {
        parcelasCtrl?.setValidators([Validators.required, Validators.min(2)]);
      }
      parcelasCtrl?.updateValueAndValidity();
    });
  }

  carregarContas(): void {
    this.contasService.listar().subscribe({
      next: (dados) => {
        this.todasContas = dados;
        
        // Se estivermos editando, precisamos preencher o form ANTES de filtrar as contas por tipo
        if (this.financeiroEdicao) {
          this.preencherFormulario();
        }
      },
      error: (err) => console.error('Erro ao carregar contas', err)
    });
  }

  preencherFormulario(): void {
    if (this.financeiroEdicao.conta) {
      this.selecionarTipo(this.financeiroEdicao.conta.tipo);
    }

    this.financeiroForm.patchValue({
      id: this.financeiroEdicao.id,
      descricao: this.financeiroEdicao.descricao,
      valor: this.financeiroEdicao.valor,
      vencimento: this.financeiroEdicao.dataVencimento,
      contaId: this.financeiroEdicao.conta?.id,
      tipoRecorrencia: 'NENHUMA',
      quantidadeParcelas: 1,
      motivoAlteracao: this.financeiroEdicao.motivoAlteracao || ''
    });

    if (this.financeiroEdicao) {
      this.financeiroForm.get('contaId')?.disable();
      this.financeiroForm.get('descricao')?.disable();
      this.financeiroForm.get('motivoAlteracao')?.setValidators([Validators.required, Validators.minLength(5)]);
      this.financeiroForm.get('motivoAlteracao')?.updateValueAndValidity();
    }
  }

  selecionarTipo(tipo: string): void {
    this.tipoSelecionado = tipo;

    // AQUI A MUDANÇA: Filtramos por tipo E status.
    // Se for edição, mantemos a conta atual na lista mesmo se ela estiver INATIVA.
    this.contasFiltradas = this.todasContas.filter(c => {
      const pertenceAoTipo = c.tipo === tipo;
      const estaAtiva = c.status === 'ATIVO';
      const ehAContaJaSelecionada = this.financeiroEdicao && c.id === this.financeiroEdicao.conta?.id;

      return pertenceAoTipo && (estaAtiva || ehAContaJaSelecionada);
    });
    
    const contaAtualId = this.financeiroForm.get('contaId')?.value;
    if (contaAtualId) {
       const contaAtualObj = this.todasContas.find(c => c.id === contaAtualId);
       if (contaAtualObj && contaAtualObj.tipo !== tipo) {
         this.financeiroForm.get('contaId')?.setValue(null);
       }
    }
  }

  onSubmit(): void {
    if (this.financeiroForm.valid) {
      const payload = this.financeiroForm.getRawValue();
      this.salvar.emit(payload);
    } else {
      this.financeiroForm.markAllAsTouched();
    }
  }
}