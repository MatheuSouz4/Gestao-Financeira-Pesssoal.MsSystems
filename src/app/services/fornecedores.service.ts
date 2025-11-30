import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// 1. Definimos a interface AQUI mesmo (sem arquivo de model separado)
export interface Fornecedor {
  id?: number; // Opcional pois na criação não temos ID
  nomeFantasia: string;
  razaoSocial: string;
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
export class FornecedoresService {

  // Ajuste a URL conforme seu Backend (Java costuma ser 8080)
  private readonly API_URL = 'http://localhost:8080/fornecedores';

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DA API ---

  // GET: Listar todos
  listar(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(this.API_URL);
  }

  // POST: Criar novo
  adicionar(fornecedor: Fornecedor): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.API_URL, fornecedor);
  }

  // PUT: Atualizar existente
  atualizar(fornecedor: Fornecedor): Observable<Fornecedor> {
    // Assume rota: /clientes/{id}
    const url = `${this.API_URL}/${fornecedor.id}`;
    return this.http.put<Fornecedor>(url, fornecedor);
  }

  // DELETE: Remover (Opcional, mas recomendado ter)
  excluir(id: number): Observable<void> {
    const url = `${this.API_URL}/${id}`;
    return this.http.delete<void>(url);
  }
}