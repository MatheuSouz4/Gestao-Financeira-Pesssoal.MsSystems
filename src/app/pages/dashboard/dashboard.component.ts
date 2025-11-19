import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="page-card">
      <h1>Dashboard</h1>
      <p>Área de Dashboard da API.</p>
      </div>
  `,
  styles: `
    .page-card { padding: 30px; background-color: white; border-radius: 8px; }
    h1 { color: #5a7F78; }
  `
})
export class DashboardComponent {

}
