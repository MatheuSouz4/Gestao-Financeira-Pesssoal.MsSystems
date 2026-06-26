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

  carregarDados(): void {
    this.fornecedorService.listar().subscribe({
      next: (dados) => this.itens = dados,
      error: (erro) => this.toastService.error('Falha de conexão com o servidor ao carregar dados.', 'Erro Crítico')
    });
  }

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
    const isEdicao = !!fornecedorRecebido.id;
    const request = isEdicao 
      ? this.fornecedorService.atualizar(fornecedorRecebido) 
      : this.fornecedorService.adicionar(fornecedorRecebido);

    request.subscribe({
      next: (res) => {
        isEdicao ? this.atualizarItemNaLista(res) : this.itens.push(res);
        
        // MENSAGEM: Cadastro ou Edição Realizada
        const mensagemSucesso = isEdicao ? 'Edição realizada com sucesso!' : 'Cadastro realizado com sucesso!';
        this.toastService.success(mensagemSucesso, 'Sucesso');
        
        this.fecharFormulario();
      },
      error: (erro) => {
        // MENSAGEM: Capturando erro formatado vindo do ResourceExceptionHandler (Ex: CPF já cadastrado)
        if (erro.error && erro.error.message) {
           this.toastService.error(erro.error.message, 'Erro de Validação');
        } else {
           this.toastService.error('Ocorreu um erro inesperado ao salvar o fornecedor.', 'Erro');
        }
      }
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
      cancelButtonText: 'Não',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fornecedorService.atualizar({ ...fornecedor, status: novoStatus }).subscribe({
          next: () => {
            fornecedor.status = novoStatus;
            this.toastService.success(`Status atualizado para ${novoStatus}!`, 'Sucesso');
          },
          error: (erro) => {
             const msg = erro.error?.message || 'Falha ao alterar o status do fornecedor.';
             this.toastService.error(msg, 'Erro');
          }
        });
      }
    });
  }
}