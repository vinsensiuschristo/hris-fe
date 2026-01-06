import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Popover } from 'primeng/popover';
import { SharedModule, MenuItem } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LeaveRequestService } from '../../core/services/leave-request.service';
import { OvertimeRequestService } from '../../core/services/overtime-request.service';

interface NotificationItem {
  id: string;
  type: 'leave' | 'overtime';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  targetUrl: string;
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
export class HeaderComponent implements OnInit {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private leaveRequestService = inject(LeaveRequestService);
  private overtimeRequestService = inject(OvertimeRequestService);

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
  
  notifications: NotificationItem[] = [];
  loadingNotifications = false;
  private readNotificationIds = new Set<string>();

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
    return user.username.charAt(0).toUpperCase();
  }

  get displayName(): string {
    const user = this.currentUser;
    if (!user) return 'Pengguna';
    
    if (user.employee) {
      return user.employee.nama;
    }
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

  get currentKaryawanId(): string | null {
    return this.currentUser?.employee?.id || null;
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.loadingNotifications = true;
    
    if (this.isAdminOrHR) {
      // Admin/HR: Get pending leave and overtime requests using getPending()
      forkJoin({
        leaveRequests: this.leaveRequestService.getPending(),
        overtimeRequests: this.overtimeRequestService.getPending()
      }).subscribe({
        next: (results) => {
          const notifications: NotificationItem[] = [];
          
          // Add leave request notifications (limit to 5)
          results.leaveRequests.slice(0, 5).forEach(req => {
            notifications.push({
              id: req.id,
              type: 'leave',
              title: 'Pengajuan Cuti Baru',
              description: `${req.karyawan?.nama || 'Karyawan'} mengajukan ${req.jenisCuti?.namaJenis || 'cuti'}`,
              time: this.formatTimeAgo(req.createdAt),
              isRead: this.readNotificationIds.has(req.id),
              targetUrl: `/approvals/leave/${req.id}`
            });
          });
          
          // Add overtime request notifications (limit to 5)
          results.overtimeRequests.slice(0, 5).forEach(req => {
            notifications.push({
              id: req.id,
              type: 'overtime',
              title: 'Pengajuan Lembur Baru',
              description: `${req.karyawan?.nama || 'Karyawan'} mengajukan lembur ${req.durasi || 0} jam`,
              time: this.formatTimeAgo(req.createdAt),
              isRead: this.readNotificationIds.has(req.id),
              targetUrl: `/approvals/overtime/${req.id}`
            });
          });
          
          // Sort by newest first and limit total
          this.notifications = notifications.slice(0, 10);
          this.loadingNotifications = false;
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
          this.notifications = [];
          this.loadingNotifications = false;
        }
      });
    } else if (this.currentKaryawanId) {
      // Employee: Get their recent requests using getByKaryawanId()
      forkJoin({
        leaveRequests: this.leaveRequestService.getByKaryawanId(this.currentKaryawanId),
        overtimeRequests: this.overtimeRequestService.getByKaryawanId(this.currentKaryawanId)
      }).subscribe({
        next: (results) => {
          const notifications: NotificationItem[] = [];
          
          // Add leave request notifications (show status updates)
          results.leaveRequests.slice(0, 5).forEach(req => {
            const statusLabel = this.getStatusLabel(req.status?.namaStatus);
            notifications.push({
              id: req.id,
              type: 'leave',
              title: `Cuti ${statusLabel}`,
              description: `Pengajuan ${req.jenisCuti?.namaJenis || 'cuti'} - ${statusLabel}`,
              time: this.formatTimeAgo(req.createdAt),
              isRead: this.readNotificationIds.has(req.id),
              targetUrl: `/leave-requests/${req.id}`
            });
          });
          
          // Add overtime request notifications
          results.overtimeRequests.slice(0, 5).forEach(req => {
            const statusLabel = this.getStatusLabel(req.status?.namaStatus);
            notifications.push({
              id: req.id,
              type: 'overtime',
              title: `Lembur ${statusLabel}`,
              description: `Pengajuan lembur ${req.durasi || 0} jam - ${statusLabel}`,
              time: this.formatTimeAgo(req.createdAt),
              isRead: this.readNotificationIds.has(req.id),
              targetUrl: `/overtime-requests/${req.id}`
            });
          });
          
          this.notifications = notifications.slice(0, 10);
          this.loadingNotifications = false;
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
          this.notifications = [];
          this.loadingNotifications = false;
        }
      });
    } else {
      this.loadingNotifications = false;
    }
  }

  private getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'DISETUJUI': return 'Disetujui';
      case 'DITOLAK': return 'Ditolak';
      case 'MENUNGGU_PERSETUJUAN': return 'Menunggu';
      case 'MENUNGGU_REIMBURSE': return 'Menunggu Reimburse';
      case 'SELESAI': return 'Selesai';
      default: return 'Menunggu';
    }
  }

  private formatTimeAgo(dateStr: string | undefined): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID');
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onToggleMobileMenu(): void {
    this.toggleMobileMenu.emit();
  }
  
  navigateToNotification(notif: NotificationItem): void {
    this.readNotificationIds.add(notif.id);
    notif.isRead = true;
    this.router.navigateByUrl(notif.targetUrl);
  }
  
  markAllAsRead(): void {
    this.notifications.forEach(n => {
      n.isRead = true;
      this.readNotificationIds.add(n.id);
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
