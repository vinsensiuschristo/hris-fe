import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Profil Saya</h1>
    </div>
    
    <div class="hris-card">
      <div class="profile-header">
        <div class="avatar">
          {{ userInitials }}
        </div>
        <div class="profile-info">
          <h2>{{ displayName }}</h2>
          <p class="text-muted">{{ userEmail }}</p>
        </div>
      </div>
      
      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--hris-gray-200);">
      
      <div class="profile-details">
        <div class="detail-item">
          <label>Username</label>
          <span>{{ currentUser?.username }}</span>
        </div>
        <div class="detail-item">
          <label>Email</label>
          <span>{{ userEmail }}</span>
        </div>
        <div class="detail-item">
          <label>Role</label>
          <span>{{ userRole }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--hris-primary) 0%, var(--hris-accent) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 700;
    }
    
    .profile-info h2 {
      margin: 0 0 0.25rem;
    }
    
    .profile-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .detail-item label {
      font-size: 0.75rem;
      color: var(--hris-gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .detail-item span {
      font-size: 1rem;
      color: var(--hris-gray-900);
    }
  `]
})
export class ProfileComponent {
  private authService = inject(AuthService);

  get currentUser() {
    return this.authService.currentUser;
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';
    
    if (user.employee) {
      const parts = user.employee.nama.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return user.employee.nama.substring(0, 2).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }

  get displayName(): string {
    const user = this.currentUser;
    if (!user) return 'Pengguna';
    
    if (user.employee) {
      return user.employee.nama;
    }
    return user.username;
  }

  get userEmail(): string {
    return this.currentUser?.email || '-';
  }

  get userRole(): string {
    const user = this.currentUser;
    if (!user || !user.roles || user.roles.length === 0) return '-';
    return user.roles.map(r => r.namaRole).join(', ');
  }
}
