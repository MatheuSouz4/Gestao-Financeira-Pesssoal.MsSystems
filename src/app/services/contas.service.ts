import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ClienteBase {
  id: string;
  nome: string; }

export interface FornecedorBase {
  id: string;
  nomeFantasia: string; }

export type TipoConta = 'RECEITA' | 'DESPESA';
export type Recorrencia = 'UNICA' | 'SEMANAL' | 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';


export interface Conta {
  id: string;
  nome: string;
  descricao?: string;
  tipo: TipoConta;
  recorrencia: Recorrencia;
  status: 'Ativo' | 'Inativo';
  

  cliente?: ClienteBase;
  fornecedor?: FornecedorBase;
}

@Injectable({
  providedIn: 'root'
})
export class ContasService {

  private API_URL = 'http://localhost:8080/contas';

  constructor(private http: HttpClient) { }

  listar(): Observable<Conta[]> {
    return this.http.get<Conta[]>(this.API_URL);
  }

  adicionar(conta: Conta): Observable<Conta> {
      return this.http.post<Conta>(this.API_URL, conta);
  }

  atualizar(conta: Conta): Observable<Conta> {
    const url = `${this.API_URL}/${conta.id}`;
      return this.http.put<Conta>(`${this.API_URL}/${conta.id}`, conta);
  
}

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}