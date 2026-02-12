import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit{

  public funcionalidades = [
    { nome: 'Dashboard', rota: './dashboard'},
    { nome: 'Clientes', rota: './clientes'},
    { nome: 'Fornecedores', rota: './fornecedores'},
    { nome: 'Contas', rota: './contas'},
    { nome: 'Lançamentos', rota: './lancamentos'},
    { nome: 'Quitações', rota: './quitacoes'},
    { nome: 'Transações', rota: './transacoes'},
    { nome: 'Projeções', rota: './projecoes'},
    { nome: 'Relatórios', rota: './relatorios'},
  ];


  constructor(
    private router: Router,
    private loginService: LoginService // Injeção do serviço de login/autenticação
  ) { }

  ngOnInit(): void {
    // Lógica para carregar o nome do usuário (opcional)
  }

  logout(): void {
    // 1. Chama a função de limpeza de sessão no serviço
    this.loginService.logout();

    // 2. Redireciona o usuário para a rota de login
    this.router.navigate(['/login']);
  }
}
