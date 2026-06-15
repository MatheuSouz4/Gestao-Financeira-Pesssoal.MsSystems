import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { BaseCrudComponent } from '../../components/core/base-crud.component';
import { Cliente, Fornecedor } from '../../components/pessoa/pessoa.component';
import { ClientesService } from '../../services/clientes.service';
import { Conta, ContasService, Status } from '../../services/contas.service';
import { FornecedoresService } from '../../services/fornecedores.service';
import { ContasFormComponent } from './contas-form/contas-form.component';

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [CommonModule, FormsModule, ContasFormComponent],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.scss'
})
export class ContasComponent extends BaseCrudComponent<Conta> implements OnInit {
  
  public filtroStatus: string = '';
  public filtroTipo: string = '';

  private clientes: Cliente[] = [];
  private fornecedores: Fornecedor[] = [];

  // Injeções Modernas
  private contasService = inject(ContasService);
  private clientesService = inject(ClientesService);
  private fornecedoresService = inject(FornecedoresService);
  private toastr = inject(ToastrService); // Renomeado localmente para evitar conflito com o BaseCrud

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais(): void {
    // Busca dados paralelos antes de carregar as contas
    this.clientesService.listar().subscribe(c => {
      this.clientes = c;
      this.fornecedoresService.listar().subscribe(f => {
        this.fornecedores = f;
        this.carregarDados(); 
      });
    });
  }

  onFiltrar(tipoSelecionado: string, statusSelecionado: string): void {
    this.filtroTipo = tipoSelecionado;
    this.filtroStatus = statusSelecionado;
    this.carregarDados();
  }

  carregarDados(): void {
    this.contasService.listar(this.filtroStatus, this.filtroTipo).subscribe({
      next: (dados) => {
        this.itens = dados.map(conta => this.vincularRelacionamentos(conta));
      },
      error: () => this.toastr.error('Erro ao carregar lista de contas.', 'Erro de Conexão')
    });
  }

  private vincularRelacionamentos(conta: Conta): Conta {
    const novaConta = { ...conta };
    const contaAux = novaConta as any;

    if (novaConta.tipo === 'RECEITA' && contaAux.clienteId) {
      novaConta.cliente = this.clientes.find(c => Number(c.id) === Number(contaAux.clienteId));
    }

    if (novaConta.tipo === 'DESPESA' && contaAux.fornecedorId) {
      novaConta.fornecedor = this.fornecedores.find(f => Number(f.id) === Number(contaAux.fornecedorId));
    }

    return novaConta;
  }

  get contasFiltradas(): Conta[] {
    if (!this.termoPesquisa) return this.itens;
    const termo = this.termoPesquisa.toLowerCase();
    
    return this.itens.filter(c => {
      const nomeMatch = c.nome?.toLowerCase().includes(termo);
      const descMatch = c.descricao?.toLowerCase().includes(termo);
      // Optional chaining para evitar quebra caso cliente/fornecedor venha nulo
      const clienteMatch = c.cliente?.nomeOuNomeFantasia?.toLowerCase().includes(termo);
      const fornecedorMatch = c.fornecedor?.nomeOuNomeFantasia?.toLowerCase().includes(termo);
      
      return nomeMatch || descMatch || clienteMatch || fornecedorMatch;
    });
  }

  salvarConta(dadosDoForm: any): void {
    const isEdicao = !!dadosDoForm.id;
    const operacao = isEdicao
      ? this.contasService.atualizar(dadosDoForm)
      : this.contasService.adicionar(dadosDoForm);

    operacao.subscribe({
      next: (res) => {
        const objetoCompleto = {
          ...res,
          clienteId: dadosDoForm.clienteId,
          fornecedorId: dadosDoForm.fornecedorId
        };

        const contaVinculada = this.vincularRelacionamentos(objetoCompleto);

        if (isEdicao) {
          this.atualizarItemNaLista(contaVinculada);
          this.toastr.success('Conta atualizada com sucesso!', 'Edição');
        } else {
          this.itens = [...this.itens, contaVinculada];
          this.toastr.success('Conta cadastrada com sucesso!', 'Cadastro');
        }

        this.fecharFormulario();
      },
      error: (erro) => {
        const msg = erro.error?.message || 'Ocorreu um erro inesperado ao salvar a conta.';
        this.toastr.error(msg, 'Erro na Operação');
      }
    });
  }

  alternarStatus(conta: Conta): void {
    const novoStatus = conta.status === Status.ATIVO ? Status.INATIVO : Status.ATIVO;
    
    Swal.fire({
      title: 'Confirmação',
      text: `Deseja alterar o status da conta "${conta.nome}" para ${novoStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        const contaAtualizada = { ...conta, status: novoStatus };
        
        this.contasService.atualizar(contaAtualizada).subscribe({
          next: () => {
            conta.status = novoStatus;
            this.toastr.success(`Status alterado para ${novoStatus}!`, 'Sucesso');
          },
          error: (erro) => {
            const msg = erro.error?.message || 'Falha ao alterar o status da conta.';
            this.toastr.error(msg, 'Erro');
          }
        });
      }
    });
  }
}