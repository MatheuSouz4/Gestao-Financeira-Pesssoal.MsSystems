import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Recupera o token salvo no login.service.ts
  const authToken = localStorage.getItem('auth-token');

  // Se tiver token, clona a requisição e adiciona o cabeçalho
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }

  // Se não tiver token, manda a requisição original
  return next(req);
};