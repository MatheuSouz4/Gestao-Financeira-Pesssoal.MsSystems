import { CommonModule } from '@angular/common'; // Adicionar CommonModule
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Adicionar FormsModule para ngModel
import { Router } from '@angular/router';
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
    private router: Router // Para navegação
  ) {}

  ngOnInit(): void {
    this.carregarContas();
  }

carregarContas(): void {
    this.contasService.getAll().subscribe({ // 🚨 CORREÇÃO: Usar getAll() em vez de listar()
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
    // 🚨 Nota: Como o status não faz parte do modelo do backend, 
    // esta lógica deve ser implementada no frontend ou adicionada ao modelo Conta.
    alert('Funcionalidade de Alternar Status (Ativo/Inativo) a ser implementada, pois o modelo de Conta não possui campo Status.');
  }

  excluirConta(id: number | undefined): void {
      if (!id || !confirm('Tem certeza que deseja excluir esta conta?')) return;
      
      this.contasService.excluir(id).subscribe({
          next: () => {
              alert('Conta excluída com sucesso!');
              this.carregarContas();
          },
          error: (err) => {
              console.error('Erro ao excluir:', err);
              alert('Erro ao excluir conta.');
          }
      });
  }
}
