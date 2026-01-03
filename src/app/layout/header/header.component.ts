import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Popover } from 'primeng/popover';
import { SharedModule, MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    Popover,
    SharedModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  userMenuItems: MenuItem[] = [
    {
      label: 'Profil Saya',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    {
      label: 'Pengaturan',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings'])
    },
    { separator: true },
    {
      label: 'Keluar',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  get currentUser() {
    return this.authService.currentUser;
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';
    return user.username.substring(0, 2).toUpperCase();
  }

  get displayName(): string {
    const user = this.currentUser;
    if (!user) return 'Pengguna';
    return user.username;
  }

  get userRole(): string {
    const user = this.currentUser;
    if (!user || !user.roles || user.roles.length === 0) return '';
    return user.roles[0].namaRole;
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onToggleMobileMenu(): void {
    this.toggleMobileMenu.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
