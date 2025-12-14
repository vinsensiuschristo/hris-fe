import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  
  // Ambil roles yang diizinkan dari route data
  const allowedRoles = route.data['roles'] as string[];
  
  if (!allowedRoles || allowedRoles.length === 0) {
    // Tidak ada role requirement, izinkan akses
    return true;
  }
  
  // Cek apakah user memiliki salah satu role yang diizinkan
  if (authService.hasAnyRole(allowedRoles)) {
    return true;
  }
  
  // User tidak memiliki role yang diperlukan
  notificationService.unauthorizedError();
  router.navigate(['/dashboard']);
  
  return false;
};

// Helper function untuk route configuration
export function requireRoles(...roles: string[]) {
  return {
    canActivate: [roleGuard],
    data: { roles }
  };
}
