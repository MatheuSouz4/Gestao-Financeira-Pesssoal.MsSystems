import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// 🚨 Interfaces de relacionamento (Assumindo que estão aqui ou em outro local importável)
export interface ClienteBase { 
  id: number; 
  nome: string; }

export interface FornecedorBase { 
  id: number; 
  nome: string; }

// 🚨 Enums movidos para cá para serem centrais
export type TipoConta = 'RECEITA' | 'DESPESA';
export type Recorrencia = 'UNICA' | 'SEMANAL' | 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

// 🚨 Interface principal renomeada para evitar conflito de nomenclatura
export interface Conta { 
  id?: number;
  nome: string;
  descricao?: string;
  tipo: TipoConta; // 🚨 Campo tipo, não tipoConta
  recorrencia: Recorrencia;
  
  // Relacionamentos:
  cliente?: ClienteBase;
  fornecedor?: FornecedorBase;
}

@Injectable({
  providedIn: 'root'
})
export class ContasService {
  // 🚨 Correção: A URL do Controller é /api/contas (assumindo o padrão REST)
  private API_URL = 'http://localhost:8080/contas'; 

  constructor(private http: HttpClient) { }

  // 🚨 Renomeado de listar para getAll (padrão Angular Service)
  getAll(): Observable<Conta[]> {
    return this.http.get<Conta[]>(this.API_URL);
  }

  // Se você precisa do adicionar(), corrija a implementação também, se necessário:
  // getById(id: number): Observable<Conta> {
  //   return this.http.get<Conta>(`${this.API_URL}/${id}`);
  // }
  
  // O seu método adicionar estava implementado como getById:
  adicionar(conta: Conta): Observable<Conta> {
      // 🚨 Este método deve ser para CRIAR, mas a implementação estava errada (usando GET)
      // Se você quer um método de criação separado (POST):
      return this.http.post<Conta>(this.API_URL, conta);
  }

  // O método salvar já trata POST/PUT:
  save(conta: Conta): Observable<Conta> {
    if (conta.id) {
      // PUT para atualizar
      return this.http.put<Conta>(`${this.API_URL}/${conta.id}`, conta);
    } else {
      // POST para criar
      return this.http.post<Conta>(this.API_URL, conta);
    }
  }

  // 🚨 Renomeado de excluir (DELETE)
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}