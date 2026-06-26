import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cliente } from '../components/pessoa/pessoa.component'; // Ajuste o caminho conforme sua pasta
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ClientesService extends BaseService<Cliente> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:8080/clientes');
  }
  
  // Aqui você pode adicionar métodos EXCLUSIVOS de clientes, se surgirem
}