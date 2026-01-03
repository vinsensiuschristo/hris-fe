import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Popover } from 'primeng/popover';
import { SharedModule, MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

interface NotificationItem {
  id: number;
  type: 'leave' | 'overtime';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
  
  notifications: NotificationItem[] = [
    { id: 1, type: 'leave', title: 'Pengajuan Cuti Baru', description: 'Ahmad Fauzi mengajukan cuti tahunan 3 hari', time: '5 menit lalu', isRead: false },
    { id: 2, type: 'overtime', title: 'Pengajuan Lembur Baru', description: 'Siti Rahayu mengajukan lembur 3 jam', time: '15 menit lalu', isRead: false },
    { id: 3, type: 'leave', title: 'Pengajuan Cuti Baru', description: 'Budi Santoso mengajukan cuti sakit', time: '1 jam lalu', isRead: true },
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
  
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }
  
  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onToggleMobileMenu(): void {
    this.toggleMobileMenu.emit();
  }
  
  navigateToNotification(notif: NotificationItem): void {
    notif.isRead = true;
    if (notif.type === 'leave') {
      this.router.navigate(['/approvals/leave']);
    } else {
      this.router.navigate(['/approvals/overtime']);
    }
  }
  
  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
  }

  logout(): void {
    this.authService.logout();
  }
}
