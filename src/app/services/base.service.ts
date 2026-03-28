import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class BaseService<T extends { id?: any }> {
  
  constructor(
    protected http: HttpClient,
    protected readonly API_URL: string
  ) {}

  listar(): Observable<T[]> {
    return this.http.get<T[]>(this.API_URL);
  }

  buscarPorId(id: number): Observable<T> {
    return this.http.get<T>(`${this.API_URL}/${id}`);
  }

  adicionar(item: T): Observable<T> {
    return this.http.post<T>(this.API_URL, item);
  }

  atualizar(item: T): Observable<T> {
    return this.http.put<T>(`${this.API_URL}/${item.id}`, item);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
