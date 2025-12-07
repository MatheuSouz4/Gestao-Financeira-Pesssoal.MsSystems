import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { Cliente, ClientesService } from '../../services/clientes.service';
import { Conta, ContasService } from '../../services/contas.service';
import { Fornecedor, FornecedoresService } from '../../services/fornecedores.service';
import { ContasFormComponent } from './contas-form/contas-form.component';


@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [CommonModule, FormsModule, ContasFormComponent], 
  templateUrl: './contas.component.html',
  styleUrls: ['./contas.component.scss']
})
export class ContasComponent implements OnInit {
  contas: Conta[] = [];
  contasFiltrados: Conta[] = [];
  termoPesquisa: string = '';
  clientes: Cliente[] = []; 
  fornecedores: Fornecedor[] = [];
  
  isFormularioAberto: boolean = false;
  contaEmEdicao: Conta | null = null;
  
  constructor(
    private contasService: ContasService,
    private router: Router,
    private toastService: ToastrService,
    private clientesService: ClientesService, 
    private fornecedoresService: FornecedoresService
  ) {}

  ngOnInit(): void {
    this.carregarDependencias();
  }

carregarDependencias(): void {

    forkJoin({
        clientesData: this.clientesService.listar(),
        fornecedoresData: this.fornecedoresService.listar()
    }).subscribe({
        next: ({ clientesData, fornecedoresData }) => {
            this.clientes = clientesData;
            this.fornecedores = fornecedoresData;
            
            this.carregarContas();
        },
        error: (err) => {
            console.error('Erro ao carregar dependências:', err);
        }
    });
}

carregarContas(): void {
    this.contasService.listar().subscribe({ 
      next: (data: Conta[]) => {

        this.contas = data.map(conta => {

            const relacionamentoCliente = (conta as any).clienteId || conta.cliente; 
            
            if (conta.tipo === 'RECEITA' && relacionamentoCliente) {
                
                let clienteIdParaBusca: string | undefined = undefined;

                if (typeof relacionamentoCliente === 'string') {
                    clienteIdParaBusca = relacionamentoCliente;
                } else if (typeof relacionamentoCliente === 'object' && relacionamentoCliente.id) {
                    clienteIdParaBusca = relacionamentoCliente.id;
                    if (!conta.cliente) {
                        conta.cliente = relacionamentoCliente;
                    }
                }
                
                if (clienteIdParaBusca) {
                    const clienteCompleto = this.clientes.find(c => c.id === clienteIdParaBusca); 
                    if (clienteCompleto) {
                        conta.cliente = clienteCompleto;
                    }
                }
            } 
            
            const relacionamentoFornecedor = (conta as any).fornecedorId || conta.fornecedor;

            if (conta.tipo === 'DESPESA' && relacionamentoFornecedor) {
                
                let fornecedorIdParaBusca: string | undefined = undefined;

                if (typeof relacionamentoFornecedor === 'string') {
                    fornecedorIdParaBusca = relacionamentoFornecedor;
                } else if (typeof relacionamentoFornecedor === 'object' && relacionamentoFornecedor.id) {
                    fornecedorIdParaBusca = relacionamentoFornecedor.id;

                    if (!conta.fornecedor) {
                        conta.fornecedor = relacionamentoFornecedor;
                    }
                }

                if (fornecedorIdParaBusca) {
                    const fornecedorCompleto = this.fornecedores.find(f => f.id === fornecedorIdParaBusca); 
                    if (fornecedorCompleto) {
                        conta.fornecedor = fornecedorCompleto;
                    }
                }
            }
            return conta;
        });

        this.aplicarFiltro();
      },
      error: (err: any) => {
        console.error('Erro ao carregar contas:', err);
      }
    });
  }
  
  aplicarFiltro(): void {
    const termo = this.termoPesquisa.toLowerCase();
    this.contasFiltrados = this.contas.filter(conta => 
      conta.nome.toLowerCase().includes(termo) ||
      conta.tipo.toLowerCase().includes(termo)
    );
  }

  onPesquisaChange(): void {
    this.aplicarFiltro();
  }

  abrirFormularioCadastro(): void {
    this.contaEmEdicao = null;
    this.isFormularioAberto = true;
  }
  
  editarContas(conta: Conta): void {
    this.contaEmEdicao = conta;
    this.isFormularioAberto = true;
  }


  salvarConta(contaRecebida: Conta): void {
      if (contaRecebida.id) {
        // --- ATUALIZAR (PUT) ---
        this.contasService.atualizar(contaRecebida).subscribe({
          next: (contaAtualizado) => {
            
            this.carregarContas();
            this.fecharFormulario();
          },
        });
  
      } else {
        // --- ADICIONAR (POST) ---
        this.contasService.adicionar(contaRecebida).subscribe({
          next: (novaConta) => {
            this.carregarContas();
            this.fecharFormulario();
          },
        });
      }
    }
  
  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.contaEmEdicao = null;
  }


  
  alternarStatus(conta: Conta): void {
    const novoStatus: 'Ativo' | 'Inativo' = conta.status === 'Ativo' ? 'Inativo' : 'Ativo';
      
      
      Swal.fire({
          title: 'Confirmação de Status',
          html: `Você tem certeza que deseja alterar o status da conta ${conta.nome} para ${novoStatus}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: `Sim`,
          cancelButtonText: 'Não',
        }).then((result) => {
          
          if (result.isConfirmed) {
            
            const contaAtualizado: Conta = { ...conta, status: novoStatus };
      
            this.contasService.atualizar(contaAtualizado).subscribe({
              next: () => {
                conta.status = novoStatus;

                
                this.toastService.success(`Status de ${conta.nome} alterado para ${novoStatus}!`);
              },
              error: (err) => {
                this.toastService.error('Erro ao alterar status. Verifique o console.');
                console.error(err);
              }
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {

            this.toastService.info('Alteração de status cancelada.', 'Ação Cancelada');
          }
        });
      }}
    