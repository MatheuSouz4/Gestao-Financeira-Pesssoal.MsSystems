import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Componentes e Serviços
import { BaseCrudComponent } from '../../components/core/base-crud.component';
import { PessoaFormComponent } from '../../components/pessoa/pessoa-form/pessoa-form.component';
import { Cliente, Status } from '../../components/pessoa/pessoa.component';
import { ClientesService } from '../../services/clientes.service';

// Utilitários
import { CpfCnpjPipe } from '../../components/utilitarios/cpf-cnpj.pipe';
import { TelefonePipe } from '../../components/utilitarios/telefone.pipe';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, PessoaFormComponent, CpfCnpjPipe, TelefonePipe],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent extends BaseCrudComponent<Cliente> implements OnInit {

  constructor(private clienteService: ClientesService){ 
    super();
  }
  
  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.clienteService.listar().subscribe({
      next: (dados) => {
        this.itens = dados;
      },
      error: () => {
        this.toastService.error('Falha ao carregar lista de clientes.', 'Erro de Conexão');
      }
    });
  }

  // Filtro inteligente para a tela
  get clientesFiltrados(): Cliente[] {
    if (!this.termoPesquisa) return this.itens;
    const termo = this.termoPesquisa.toLowerCase();
    return this.itens.filter(c =>
      c.nomeOuNomeFantasia.toLowerCase().includes(termo) ||
      c.cpfCnpj.includes(termo) ||
      c.email.toLowerCase().includes(termo)
    );
  }

  /**
   * Método principal de salvamento (Create/Update)
   * Centraliza a chamada ao serviço e trata os retornos de sucesso/erro
   */
  salvarCliente(clienteRecebido: Cliente): void {
    const isEdicao = !!clienteRecebido.id;
    const request = isEdicao 
      ? this.clienteService.atualizar(clienteRecebido) 
      : this.clienteService.adicionar(clienteRecebido);

    request.subscribe({
      next: (res) => {
        if (isEdicao) {
          this.atualizarItemNaLista(res);
          this.toastService.success('Cliente atualizado com sucesso!', 'Sucesso');
        } else {
          this.itens.push(res);
          this.toastService.success('Cliente cadastrado com sucesso!', 'Cadastro');
        }
        this.fecharFormulario();
      },
      error: (erro) => {
        // Captura a mensagem vinda do Backend (via ResourceExceptionHandler)
        const mensagemErro = erro.error?.message || 'Ocorreu um erro inesperado.';
        this.toastService.error(mensagemErro, 'Erro ao Salvar');
      }
    });
  }

  /**
   * Alteração de status com confirmação visual (UX)
   */
  alternarStatus(cliente: Cliente): void {
    const novoStatus = cliente.status === Status.ATIVO ? Status.INATIVO : Status.ATIVO;
    
    Swal.fire({
      title: 'Alterar Status?',
      text: `Deseja alterar o status do cliente ${cliente.nomeOuNomeFantasia} para ${novoStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clonamos o objeto para não afetar a referência original até o retorno do back
        const clienteAtualizado = { ...cliente, status: novoStatus };
        
        this.clienteService.atualizar(clienteAtualizado).subscribe({
          next: () => {
            cliente.status = novoStatus; // Atualiza a UI após sucesso
            this.toastService.success(`Status alterado para ${novoStatus}!`, 'Sucesso');
          },
          error: (erro) => {
            const msg = erro.error?.message || 'Falha ao alterar status.';
            this.toastService.error(msg, 'Erro');
          }
        });
      }
    });
  }
}