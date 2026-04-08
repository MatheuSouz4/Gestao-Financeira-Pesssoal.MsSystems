import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ClienteBase {
  id?: number;
  nomeOuNomeFantasia: string; }

export interface FornecedorBase {
  id?: number;
  nomeOuNomeFantasia: string; }

export type TipoConta = 'RECEITA' | 'DESPESA';

export enum Status{
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  BLOQUEADO = 'BLOQUEADO'
}

export interface Conta {
  id: number;
  nome: string;
  descricao?: string;
  tipo: TipoConta;
  status: Status
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
    if (!conta.id) throw new Error("ID da conta é obrigatório para atualização.");
    return this.http.put<Conta>(`${this.API_URL}/${conta.id}`, conta);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}