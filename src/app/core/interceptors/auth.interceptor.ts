import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Daftar URL yang tidak perlu token
  const excludedUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh'
  ];
  
  // Cek apakah URL termasuk yang dikecualikan
  const isExcluded = excludedUrls.some(url => req.url.includes(url));
  
  if (token && !isExcluded) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }
  
  return next(req);
};
