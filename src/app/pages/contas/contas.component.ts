import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  // Altere a assinatura da função para receber os parâmetros
onFiltrar(tipoSelecionado: string, statusSelecionado: string): void {
  // Atualizamos as variáveis de classe manualmente para garantir
  this.filtroTipo = tipoSelecionado;
  this.filtroStatus = statusSelecionado;

  console.log('VALORES REAIS CAPTURADOS:', { 
    tipo: tipoSelecionado, 
    status: statusSelecionado 
  });

  this.carregarDados();
}

// Ajuste o carregarDados para usar as variáveis que acabamos de atualizar
carregarDados(): void {
  this.contasService.listar(this.filtroStatus, this.filtroTipo).subscribe({
    next: (dados) => {
      this.itens = dados.map(conta => this.vincularRelacionamentos(conta));
    },
    error: () => this.toastService.error('Erro ao carregar contas.')
  });
}

  private vincularRelacionamentos(conta: Conta): Conta {
  // Cria uma cópia para garantir imutabilidade
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

  get contasFiltrados(): Conta[] {
    if (!this.termoPesquisa) return this.itens;
    const termo = this.termoPesquisa.toLowerCase();
    return this.itens.filter(c =>
      c.nome?.toLowerCase().includes(termo) ||
      c.descricao?.toLowerCase().includes(termo) ||
      c.cliente?.nomeOuNomeFantasia.toLowerCase().includes(termo) ||
      c.fornecedor?.nomeOuNomeFantasia.toLowerCase().includes(termo)
    );
  }

  salvarConta(dadosDoForm: any): void {
  const operacao = dadosDoForm.id
    ? this.contasService.atualizar(dadosDoForm)
    : this.contasService.adicionar(dadosDoForm);

  operacao.subscribe({
    next: (res) => {
      // res é o objeto que veio do backend
      // Injetamos os IDs de volta para o vincularRelacionamentos funcionar
      const objetoCompleto = {
        ...res,
        clienteId: dadosDoForm.clienteId,
        fornecedorId: dadosDoForm.fornecedorId
      };

      const contaVinculada = this.vincularRelacionamentos(objetoCompleto);

      if (dadosDoForm.id) {
        this.atualizarItemNaLista(contaVinculada);
      } else {
        // Agora sim a reatividade acontece: novo array!
        this.itens = [...this.itens, contaVinculada];
      }

      this.toastService.success('Operação realizada com sucesso!');
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