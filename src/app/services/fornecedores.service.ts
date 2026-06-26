import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Fornecedor } from '../components/pessoa/pessoa.component';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class FornecedoresService extends BaseService<Fornecedor> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:8080/fornecedores');
  }
}