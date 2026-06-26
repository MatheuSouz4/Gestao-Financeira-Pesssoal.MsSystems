import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('auth-token');

  // REMOVEMOS O && req.url.includes('/api/')
  if (authToken && !req.url.includes('/login') && !req.url.includes('/register')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }
  
  return next(req);
};