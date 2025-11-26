import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { LoginResponse } from '../types/login-response.type';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
    apiUrl: string = "http://localhost:8080/auth"

  constructor(private httpClient: HttpClient) { }

  login(email: string, password: string){
    return this.httpClient.post<LoginResponse>(this.apiUrl + "/login", { email, password }).pipe(
      tap((value) => {
        localStorage.setItem("auth-token", value.token)
        localStorage.setItem("username", value.name)
        console.log(value.token)
      })
    )
  }

  signup(name: string, email: string, password: string){
    return this.httpClient.post<LoginResponse>(this.apiUrl + "/register", { name, email, password }).pipe(
      tap((value) => {
        localStorage.setItem("auth-token", value.token)
        localStorage.setItem("username", value.name)
      })
    )
  }

  logout(): void {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('usuario_logado');
}
}
