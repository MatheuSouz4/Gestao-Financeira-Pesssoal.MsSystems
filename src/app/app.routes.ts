import { Routes } from '@angular/router';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ContasComponent } from './pages/contas/contas.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FornecedoresComponent } from './pages/fornecedores/fornecedores.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
import { SignUpComponent } from './pages/signup/signup.component';
import { TransacoesComponent } from './pages/transacoes/transacoes.component';

import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    { path: 'login', component: LoginComponent },

        {
        path: "signup",
        component: SignUpComponent
        },

    {
    path: 'home',
    component: HomeComponent,// O componente com o menu e <router-outlet>
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
      
      // Funcionalidades
      { path: 'dashboard', component: DashboardComponent }, 
      { path: 'clientes', component: ClientesComponent },
      { path: 'fornecedores', component: FornecedoresComponent },
      { path: 'contas', component: ContasComponent },
      { path: 'transacoes', component: TransacoesComponent },
      { path: 'relatorios', component: RelatoriosComponent },
    ],
  },

  // 3. Rota de Wildcard (página 404/redirecionamento)
  { path: '**', redirectTo: 'login' },




];
