import { Component } from '@angular/core';

@Component({
  selector: 'app-quitacoes',
  standalone: true,
    template: `
   <div class="page-card">
      <h1>Quitações</h1>
      <p>Gerenciameneto das Quitações da API.</p>
      </div>
  `,
  styles: `
    .page-card { padding: 30px; background-color: white; border-radius: 8px; }
    h1 { color: #5a7F78; }
  `
})
export class QuitacoesComponent {

}
