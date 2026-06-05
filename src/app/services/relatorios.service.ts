import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelatoriosService {
  private readonly API_URL = 'http://localhost:8080/relatorios';

  constructor(private http: HttpClient) {}

  baixarRelatorio(formato: 'csv' | 'pdf', tipo: string, inicio: string, fim: string): Observable<Blob> {
    let params = new HttpParams()
      .set('tipo', tipo)
      .set('inicio', inicio)
      .set('fim', fim);

    // Recupera o token de onde você o salva no login (ajuste a chave 'token' se o seu projeto usar outro nome, ex: 'jwt_token')
    const token = localStorage.getItem('token'); 
    
    // Cria o cabeçalho de Autorização
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get(`${this.API_URL}/${formato}`, {
      headers: headers, // <-- Injeta o token aqui
      params: params,
      responseType: 'blob' // Mantém o formato binário para o PDF/CSV
    });
  }
}