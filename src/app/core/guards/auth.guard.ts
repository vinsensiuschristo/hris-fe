import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn) {
    return true;
  }
  
  // Simpan URL yang dituju untuk redirect setelah login
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  
  return false;
};

// Guard untuk halaman yang tidak boleh diakses setelah login (seperti halaman login)
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn) {
    return true;
  }
  
  // Sudah login, redirect ke dashboard
  router.navigate(['/dashboard']);
  return false;
};
