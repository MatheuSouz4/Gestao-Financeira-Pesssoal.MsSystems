import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Cliente, ClientesService } from '../../services/clientes.service';
import { ClientesFormComponent } from './clientes-form/clientes-form.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientesFormComponent],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent implements OnInit {
  

  isFormularioAberto: boolean = false;
  termoPesquisa: string = '';
  clienteEmEdicao: Cliente | null = null;

  // Lista de dados
  clientes: Cliente[] = [];

  constructor(
    private clienteService: ClientesService,
    private toastService: ToastrService) {}


  // Ao iniciar, carrega os dados do banco
  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (dados) => {
        this.clientes = dados;
      },
      error: (erro) => {
        this.toastService.error('Erro ao buscar clientes:', erro);
      }
    });
  }

  
  get clientesFiltrados(): Cliente[] {
    if (!this.termoPesquisa) {
      return this.clientes;
    }
    const termo = this.termoPesquisa.toLowerCase(); 
    return this.clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.email.toLowerCase().includes(termo) ||
      cliente.cpf_Cnpj.includes(termo)
    );
  }


  abrirFormularioCadastro(): void {
    this.clienteEmEdicao = null;
    this.isFormularioAberto = true;
  }


  editarCliente(cliente: Cliente): void {
    this.clienteEmEdicao = cliente;
    this.isFormularioAberto = true;
  }


  salvarCliente(clienteRecebido: Cliente): void {
    if (clienteRecebido.id) {
      // --- ATUALIZAR (PUT) ---
      this.clienteService.atualizar(clienteRecebido).subscribe({
        next: (clienteAtualizado) => {
          
          const index = this.clientes.findIndex(c => c.id === clienteAtualizado.id);
          if (index !== -1) {
            this.clientes[index] = clienteAtualizado;
          }
          this.toastService.success('Cliente atualizado com sucesso!');
          this.fecharFormulario();
        },
        error: (err) => {
          this.toastService.error('Erro ao atualizar no servidor.');
        }
      });

    } else {
      // --- ADICIONAR (POST) ---
      this.clienteService.adicionar(clienteRecebido).subscribe({
        next: (novoCliente) => {
          this.clientes.push(novoCliente);
          this.toastService.success('Cliente cadastrado com sucesso!');
          this.fecharFormulario();
        },
        error: (err) => {
          this.toastService.error('Cliente já existe no sistema.');
        }
      });
    }
  }

  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.clienteEmEdicao = null;
  }

alternarStatus(cliente: Cliente): void {

  const novoStatus: 'Ativo' | 'Inativo' = cliente.status === 'Ativo' ? 'Inativo' : 'Ativo';
  
  Swal.fire({
    title: 'Confirmação de Status',
    html: `Você tem certeza que deseja alterar o status do cliente ${cliente.nome} para ${novoStatus}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6', // Cor azul padrão
    cancelButtonColor: '#d33',   // Cor vermelha padrão
    confirmButtonText: `Sim`,
    cancelButtonText: 'Não',
  }).then((result) => { // 2. Trata a resposta do usuário
    
    if (result.isConfirmed) {
      // O usuário clicou em SIM (Confirmar)
      
      const clienteAtualizado: Cliente = { ...cliente, status: novoStatus };

      // 3. Chamada à API
      this.clienteService.atualizar(clienteAtualizado).subscribe({
        next: () => {
          // 4. Atualiza a lista local e mostra o Toastr de sucesso
          cliente.status = novoStatus;
          
          // Opcional: Mostra um toastr elegante antes do ToastrService, se desejar
          // Swal.fire('Sucesso!', `Status alterado para ${novoStatus}!`, 'success');
          
          this.toastService.success(`Status de ${cliente.nome} alterado para ${novoStatus}!`);
        },
        error: (err) => {
          this.toastService.error('Erro ao alterar status. Verifique o console.');
          console.error(err);
        }
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // O usuário clicou em CANCELAR
      this.toastService.info('Alteração de status cancelada.', 'Ação Cancelada');
    }
  });
}}