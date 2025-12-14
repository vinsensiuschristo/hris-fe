import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Terjadi kesalahan yang tidak diketahui';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
        notificationService.networkError();
      } else {
        // Server-side error
        switch (error.status) {
          case 0:
            // Network error
            notificationService.networkError();
            break;
            
          case 400:
            // Bad Request
            errorMessage = error.error?.message || 'Permintaan tidak valid';
            notificationService.validationError(errorMessage);
            break;
            
          case 401:
            // Unauthorized
            if (req.url.includes('/auth/login')) {
              errorMessage = 'Username atau password salah';
              notificationService.error('Login Gagal', errorMessage);
            } else {
              notificationService.sessionExpired();
              authService.logout();
            }
            break;
            
          case 403:
            // Forbidden
            notificationService.unauthorizedError();
            break;
            
          case 404:
            // Not Found
            errorMessage = 'Data tidak ditemukan';
            notificationService.error('Tidak Ditemukan', errorMessage);
            break;
            
          case 409:
            // Conflict
            errorMessage = error.error?.message || 'Terjadi konflik data';
            notificationService.error('Konflik', errorMessage);
            break;
            
          case 422:
            // Unprocessable Entity (Validation Error)
            errorMessage = error.error?.message || 'Data tidak valid';
            notificationService.validationError(errorMessage);
            break;
            
          case 500:
          case 502:
          case 503:
          case 504:
            // Server Error
            notificationService.serverError();
            break;
            
          default:
            notificationService.error('Error', `Error ${error.status}: ${error.message}`);
        }
      }
      
      return throwError(() => error);
    })
  );
};
