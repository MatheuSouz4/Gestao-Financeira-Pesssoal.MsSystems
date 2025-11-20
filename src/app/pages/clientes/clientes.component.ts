import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  constructor(private clienteService: ClientesService) {}

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
        console.error('Erro ao buscar clientes:', erro);
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
      cliente.cpf_cnpj.includes(termo)
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
          alert('Cliente atualizado com sucesso!');
          this.fecharFormulario();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao atualizar no servidor.');
        }
      });

    } else {
      // --- ADICIONAR (POST) ---
      this.clienteService.adicionar(clienteRecebido).subscribe({
        next: (novoCliente) => {
          this.clientes.push(novoCliente);
          alert('Cliente cadastrado com sucesso!');
          this.fecharFormulario();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao cadastrar no servidor.');
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
  
  
  const clienteAtualizado: Cliente = { ...cliente, status: novoStatus };

  this.clienteService.atualizar(clienteAtualizado).subscribe({
    next: () => {
      cliente.status = novoStatus;
    },
    error: (err) => {
      console.error(err);
      alert('Erro ao alterar status.');
    }
  });
}
  }
