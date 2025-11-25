import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// 1. Definimos a interface AQUI mesmo (sem arquivo de model separado)
export interface Cliente {
  id?: number; // Opcional pois na criação não temos ID
  nome: string;
  email: string;
  telefone: string;
  cpf_Cnpj: string;
  endereco: string;
  descricao: string;
  status: 'Ativo' | 'Inativo';
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  // Ajuste a URL conforme seu Backend (Java costuma ser 8080)
  private readonly API_URL = 'http://localhost:8080/clientes'; 

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DA API ---

  // GET: Listar todos
  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.API_URL);
  }

  // POST: Criar novo
  adicionar(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.API_URL, cliente);
  }

  // PUT: Atualizar existente
  atualizar(cliente: Cliente): Observable<Cliente> {
    // Assume rota: /clientes/{id}
    const url = `${this.API_URL}/${cliente.id}`;
    return this.http.put<Cliente>(url, cliente);
  }

  // DELETE: Remover (Opcional, mas recomendado ter)
  excluir(id: number): Observable<void> {
    const url = `${this.API_URL}/${id}`;
    return this.http.delete<void>(url);
  }
}