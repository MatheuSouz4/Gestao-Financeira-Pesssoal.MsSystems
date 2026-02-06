import { Component } from '@angular/core';

@Component({
  selector: 'app-projecoes',
  standalone: true,
  template: `
    <div class="page-card">
      <h1>Projeções</h1>
      <p>Área de gerenciamento de Projeções Financeiras.</p>
      </div>
  `,
  styles:`
    .page-card { padding: 30px; background-color: white; border-radius: 8px; }
    h1 { color: #5a7F78; }
  `
})
export class ProjecoesComponent{

}
