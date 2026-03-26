import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BaseCrudComponent } from '../../components/core/base-crud.component';
import { Cliente, ClientesService } from '../../services/clientes.service';
import { Conta, ContasService, Status } from '../../services/contas.service';
import { Fornecedor, FornecedoresService } from '../../services/fornecedores.service';
import { ContasFormComponent } from './contas-form/contas-form.component';

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [CommonModule, FormsModule, ContasFormComponent],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.scss'
})
export class ContasComponent extends BaseCrudComponent<Conta> implements OnInit {
  
  // Listas auxiliares para o cruzamento de dados
  private clientes: Cliente[] = [];
  private fornecedores: Fornecedor[] = [];

  constructor(
    private contasService: ContasService,
    private clientesService: ClientesService,
    private fornecedoresService: FornecedoresService
  ) {
    super();
  }

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  /**
   * Carrega primeiro as dependências e depois as contas
   */
  carregarDadosIniciais(): void {
    // Carregamos clientes e fornecedores simultaneamente
    this.clientesService.listar().subscribe(c => {
      this.clientes = c;
      this.fornecedoresService.listar().subscribe(f => {
        this.fornecedores = f;
        this.carregarDados(); // Só carrega contas quando tiver as outras listas
      });
    });
  }

  carregarDados(): void {
    this.contasService.listar().subscribe({
      next: (dados) => {
        // Mapeia os IDs para objetos completos para exibição na tabela
        this.itens = dados.map(conta => this.vincularRelacionamentos(conta));
      },
      error: () => this.toastService.error('Erro ao carregar contas.')
    });
  }

  private vincularRelacionamentos(conta: Conta): Conta {
    // Se for RECEITA, busca o cliente pelo ID
    if (conta.tipo === 'RECEITA' && (conta as any).clienteId) {
      conta.cliente = this.clientes.find(c => Number(c.id) === Number((conta as any).clienteId));
    }
    // Se for DESPESA, busca o fornecedor pelo ID
    if (conta.tipo === 'DESPESA' && (conta as any).fornecedorId) {
      conta.fornecedor = this.fornecedores.find(f => Number(f.id) === Number((conta as any).fornecedorId));
    }
    return conta;
  }

  get contasFiltrados(): Conta[] {
    if (!this.termoPesquisa) return this.itens;
    const termo = this.termoPesquisa.toLowerCase();
    return this.itens.filter(c =>
      c.descricao?.toLowerCase().includes(termo) ||
      c.cliente?.nome.toLowerCase().includes(termo) ||
      c.fornecedor?.nomeFantasia.toLowerCase().includes(termo)
    );
  }

  salvarConta(contaRecebida: Conta): void {
    const operacao = contaRecebida.id
      ? this.contasService.atualizar(contaRecebida)
      : this.contasService.adicionar(contaRecebida);

    operacao.subscribe({
      next: (res) => {
        const contaVinculada = this.vincularRelacionamentos(res);
        contaRecebida.id ? this.atualizarItemNaLista(contaVinculada) : this.itens.push(contaVinculada);
        
        this.toastService.success('Conta salva com sucesso!');
        this.fecharFormulario();
      },
      error: () => this.toastService.error('Erro ao salvar conta.')
    });
  }

  alternarStatus(conta: Conta): void {
    const novoStatus = conta.status === Status.ATIVO ? Status.INATIVO : Status.ATIVO;
    
    Swal.fire({
      title: 'Confirmação',
      text: `Alterar o status de ${conta.nome} para ${novoStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result) => {
      if (result.isConfirmed) {
        const fornecedorAtualizado = { ...conta, status: novoStatus };
        this.contasService.atualizar(fornecedorAtualizado).subscribe({
          next: () => {
            conta.status = novoStatus;
            this.toastService.success(`Status alterado!`);
          }
        });
      }
    });
  }
}