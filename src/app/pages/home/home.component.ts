import { CommonModule } from '@angular/common'; // Para usar o *ngFor
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  // Adicionar o RouterLink/Active e o CommonModule (para *ngFor)
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  // Dados para construir o menu de navegação
  public funcionalidades = [
    { nome: 'Dashboard', rota: './dashboard'}, // Visão Geral
    { nome: 'Clientes', rota: './clientes'},
    { nome: 'Fornecedores', rota: './fornecedores'},
    { nome: 'Contas', rota: './contas'},
    { nome: 'Transações', rota: './transacoes'},
    { nome: 'Relatórios', rota: './relatorios'},
  ];
}
