import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Fornecedor, FornecedoresService } from '../../services/fornecedores.service';
import { FornecedoresFormComponent } from './fornecedores-form/fornecedores-form.component';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [CommonModule, FormsModule, FornecedoresFormComponent],
  templateUrl: './fornecedores.component.html',
  styleUrl: './fornecedores.component.scss',
})
export class FornecedoresComponent implements OnInit {
  

  isFormularioAberto: boolean = false;
  termoPesquisa: string = '';
  fornecedorEmEdicao: Fornecedor | null = null;

  // Lista de dados
  fornecedores: Fornecedor[] = [];

  constructor(
    private fornecedorService: FornecedoresService,
    private toastService: ToastrService) {}

  // Ao iniciar, carrega os dados do banco
  ngOnInit(): void {
    this.carregarFornecedores();
  }

  carregarFornecedores(): void {
    this.fornecedorService.listar().subscribe({
      next: (dados) => {
        this.fornecedores = dados;
      },
      error: (erro) => {
        this.toastService.error('Erro ao buscar fornecedores:');
      }
    });
  }

  
  get fornecedoresFiltrados(): Fornecedor[] {
    if (!this.termoPesquisa) {
      return this.fornecedores;
    }
    const termo = this.termoPesquisa.toLowerCase();
    return this.fornecedores.filter(fornecedor =>
      fornecedor.nomeFantasia.toLowerCase().includes(termo) ||
      fornecedor.razaoSocial.toLowerCase().includes(termo) ||
      fornecedor.email.toLowerCase().includes(termo) ||
      fornecedor.cpf_Cnpj.includes(termo)
    );
  }


  abrirFormularioCadastro(): void {
    this.fornecedorEmEdicao = null;
    this.isFormularioAberto = true;
  }


  editarFornecedor(fornecedor: Fornecedor): void {
    this.fornecedorEmEdicao = fornecedor;
    this.isFormularioAberto = true;
  }


  salvarFornecedor(fornecedorRecebido: Fornecedor): void {
    if (fornecedorRecebido.id) {
      // --- ATUALIZAR (PUT) ---
      this.fornecedorService.atualizar(fornecedorRecebido).subscribe({
        next: (fornecedorAtualizado) => {
          
          const index = this.fornecedores.findIndex(c => c.id === fornecedorAtualizado.id);
          if (index !== -1) {
            this.fornecedores[index] = fornecedorAtualizado;
          }
          this.toastService.success('Fornecedor atualizado com sucesso!');
          this.fecharFormulario();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Erro ao atualizar no servidor.');
        }
      });

    } else {
      // --- ADICIONAR (POST) ---
      this.fornecedorService.adicionar(fornecedorRecebido).subscribe({
        next: (novoFornecedor) => {
          this.fornecedores.push(novoFornecedor);
          this.toastService.success('Fornecedor cadastrado com sucesso!');
          this.fecharFormulario();
        },
        error: (err) => {
          this.toastService.error('Erro ao cadastrar no servidor.');
        }
      });
    }
  }

  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.fornecedorEmEdicao = null;
  }

alternarStatus(fornecedor: Fornecedor): void {

  const novoStatus: 'Ativo' | 'Inativo' = fornecedor.status === 'Ativo' ? 'Inativo' : 'Ativo';
  
  
  const fornecedorAtualizado: Fornecedor = { ...fornecedor, status: novoStatus };

  this.fornecedorService.atualizar(fornecedorAtualizado).subscribe({
    next: () => {
      fornecedor.status = novoStatus;
    },
    error: (err) => {
      this.toastService.error('Erro ao alterar status.');
    }
  });
}
  }
