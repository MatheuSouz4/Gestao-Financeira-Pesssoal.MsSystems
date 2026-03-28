import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BaseCrudComponent } from '../../components/core/base-crud.component';
import { PessoaFormComponent } from '../../components/pessoa/pessoa-form/pessoa-form.component';
import { Fornecedor, Status } from '../../components/pessoa/pessoa.component';
import { CpfCnpjPipe } from '../../components/utilitarios/cpf-cnpj.pipe';
import { TelefonePipe } from '../../components/utilitarios/telefone.pipe';
import { FornecedoresService } from '../../services/fornecedores.service';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [CommonModule, FormsModule, PessoaFormComponent, CpfCnpjPipe, TelefonePipe],
  templateUrl: './fornecedores.component.html',
  styleUrl: './fornecedores.component.scss',
})
export class FornecedoresComponent extends BaseCrudComponent<Fornecedor> implements OnInit {
  
  constructor(private fornecedorService: FornecedoresService) {
    super(); 
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  // Implementação da busca de dados específica de Fornecedores
  carregarDados(): void {
    this.fornecedorService.listar().subscribe({
      next: (dados) => this.itens = dados, // 'itens' herdado da Base
      error: (erro) => this.toastService.error('Erro ao buscar fornecedores.')
    });
  }

  // Filtro específico para as colunas de Fornecedor
  get fornecedoresFiltrados(): Fornecedor[] {
    if (!this.termoPesquisa) return this.itens;
    
    const termo = this.termoPesquisa.toLowerCase();
    return this.itens.filter(f =>
      f.nomeOuNomeFantasia.toLowerCase().includes(termo) ||
      f.cpfCnpj.includes(termo) ||
      f.email.toLowerCase().includes(termo)
    );
  }

  salvarFornecedor(fornecedorRecebido: Fornecedor): void {
    const request = fornecedorRecebido.id 
      ? this.fornecedorService.atualizar(fornecedorRecebido) 
      : this.fornecedorService.adicionar(fornecedorRecebido);

    request.subscribe({
      next: (res) => {
        fornecedorRecebido.id ? this.atualizarItemNaLista(res) : this.itens.push(res);
        this.toastService.success('Operação realizada com sucesso!');
        this.fecharFormulario();
      },
      error: () => this.toastService.error('Erro ao salvar fornecedor.')
    });
  }

  alternarStatus(fornecedor: Fornecedor): void {
    const novoStatus = fornecedor.status === Status.ATIVO ? Status.INATIVO : Status.ATIVO;
    
    Swal.fire({
      title: 'Alterar Status?',
      text: `Deseja mudar o status de ${fornecedor.nomeOuNomeFantasia} para ${novoStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fornecedorService.atualizar({ ...fornecedor, status: novoStatus }).subscribe({
          next: () => {
            fornecedor.status = novoStatus;
            this.toastService.success('Status atualizado!');
          }
        });
      }
    });
  }
}