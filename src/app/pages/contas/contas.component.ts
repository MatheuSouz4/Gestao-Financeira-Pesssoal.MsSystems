import { CommonModule } from '@angular/common'; // Adicionar CommonModule
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Adicionar FormsModule para ngModel
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Conta, ContasService } from '../../services/contas.service'; // Usar Conta da Service
import { ContasFormComponent } from './contas-form/contas-form.component'; // Importar o Formulário

// Interfaces: Mover para contas.service.ts para serem usadas globalmente

@Component({
  selector: 'app-contas',
  // 🚨 Usar standalone ou Modules, mas o standalone é mais limpo:
  standalone: true,
  imports: [CommonModule, FormsModule, ContasFormComponent], 
  templateUrl: './contas.component.html',
  styleUrls: ['./contas.component.scss']
})
export class ContasComponent implements OnInit {
  contas: Conta[] = []; // Lista completa de contas
  contasFiltrados: Conta[] = []; // Lista para exibição (após filtro)
  termoPesquisa: string = '';
  
  isFormularioAberto: boolean = false;
  contaEmEdicao: Conta | null = null;
  
  constructor(
    private contasService: ContasService,
    private router: Router,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
  }

carregarContas(): void {
    this.contasService.listar().subscribe({ // 🚨 CORREÇÃO: Usar getAll() em vez de listar()
      next: (data: Conta[]) => {
        this.contas = data;
        this.aplicarFiltro();
      },
      error: (err: any) => {
        console.error('Erro ao carregar contas:', err);
        // Implementar alerta ou mensagem de erro
      }
    });
  }
  
  // 🚨 Nova função de filtro
  aplicarFiltro(): void {
    const termo = this.termoPesquisa.toLowerCase();
    this.contasFiltrados = this.contas.filter(conta => 
      conta.nome.toLowerCase().includes(termo) ||
      conta.tipo.toLowerCase().includes(termo)
      // Nota: No banco de dados, o campo é 'tipo', não 'tipoConta'
    );
  }

  // 🚨 Função acionada pela busca (ngModelChange)
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
    // Se estiver usando rotas: this.router.navigate(['/home/contas/editar', conta.id]);
  }
  
  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.contaEmEdicao = null;
  }

  salvarConta(conta: Conta): void {
    // Recarrega a lista após salvar/editar
    this.carregarContas();
    this.fecharFormulario();
  }
  
  alternarStatus(conta: Conta): void {
    const novoStatus: 'Ativo' | 'Inativo' = conta.status === 'Ativo' ? 'Inativo' : 'Ativo';
      
      
      Swal.fire({
          title: 'Confirmação de Status',
          html: `Você tem certeza que deseja alterar o status da conta ${conta.nome} para ${novoStatus}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6', // Cor azul padrão
          cancelButtonColor: '#d33',   // Cor vermelha padrão
          confirmButtonText: `Sim`,
          cancelButtonText: 'Não',
        }).then((result) => { // 2. Trata a resposta do usuário
          
          if (result.isConfirmed) {
            // O usuário clicou em SIM (Confirmar)
            
            const contaAtualizado: Conta = { ...conta, status: novoStatus };
      
            // 3. Chamada à API
            this.contasService.atualizar(contaAtualizado).subscribe({
              next: () => {
                // 4. Atualiza a lista local e mostra o Toastr de sucesso
                conta.status = novoStatus;
                
                // Opcional: Mostra um toastr elegante antes do ToastrService, se desejar
                // Swal.fire('Sucesso!', `Status alterado para ${novoStatus}!`, 'success');
                
                this.toastService.success(`Status de ${conta.nome} alterado para ${novoStatus}!`);
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
    