import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BaseCrudComponent } from '../../components/core/base-crud.component';
import { PessoaFormComponent } from '../../components/pessoa/pessoa-form/pessoa-form.component';
import { Cliente, Status } from '../../components/pessoa/pessoa.component';
import { CpfCnpjPipe } from '../../components/utilitarios/cpf-cnpj.pipe';
import { TelefonePipe } from '../../components/utilitarios/telefone.pipe';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, PessoaFormComponent, CpfCnpjPipe, TelefonePipe],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent extends BaseCrudComponent<Cliente> implements OnInit {

  constructor(private clientesService: ClientesService) {
    super(); // Inicializa a lógica da BaseCrudComponent
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  // Implementação obrigatória da busca de dados
  carregarDados(): void {
    this.clientesService.listar().subscribe({
      next: (dados) => this.itens = dados,
      error: (erro) => this.toastService.error('Erro ao buscar clientes.')
    });
  }

  // Lógica de filtro específica para Clientes
  get clientesFiltrados(): Cliente[] {
    if (!this.termoPesquisa) return this.itens;

    const termo = this.termoPesquisa.toLowerCase();
    return this.itens.filter(c =>
      c.nomeOuNomeFantasia.toLowerCase().includes(termo) ||
      c.cpfCnpj.includes(termo) ||
      c.email.toLowerCase().includes(termo)
    );
  }

  salvarCliente(clienteRecebido: Cliente): void {
    const operacao = clienteRecebido.id 
      ? this.clientesService.atualizar(clienteRecebido) 
      : this.clientesService.adicionar(clienteRecebido);

    operacao.subscribe({
      next: (res) => {
        // Se for edição, atualiza na lista. Se for novo, adiciona.
        clienteRecebido.id ? this.atualizarItemNaLista(res) : this.itens.push(res);
        
        this.toastService.success('Cliente salvo com sucesso!');
        this.fecharFormulario();
      },
      error: () => this.toastService.error('Erro ao processar cliente. Verifique os dados.')
    });
  }

  alternarStatus(cliente: Cliente): void {
    const novoStatus = cliente.status === Status.ATIVO ? Status.INATIVO : Status.ATIVO;

    Swal.fire({
      title: 'Alterar Status?',
      text: `Deseja mudar o status de ${cliente.nomeOuNomeFantasia} para ${novoStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, alterar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.atualizar({ ...cliente, status: novoStatus }).subscribe({
          next: () => {
            cliente.status = novoStatus;
            this.toastService.success('Status atualizado!');
          },
          error: () => this.toastService.error('Erro ao atualizar status.')
        });
      }
    });
  }
}