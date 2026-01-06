import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UIChart } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService, MyDashboardStats } from '../../core/services/dashboard.service';

interface DashboardStats {
  totalEmployees: number;
  pendingLeaveRequests: number;
  pendingOvertimeRequests: number;
  approvedThisMonth: number;
}

interface RecentRequest {
  id: number;
  employeeName: string;
  type: 'leave' | 'overtime';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UIChart,
    TableModule,
    Tag
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  loading = signal<boolean>(true);

  // Admin/HR dashboard data
  stats = signal<DashboardStats>({
    totalEmployees: 0,
    pendingLeaveRequests: 0,
    pendingOvertimeRequests: 0,
    approvedThisMonth: 0
  });

  // Employee dashboard data
  myStats = signal<MyDashboardStats | null>(null);

  recentRequests = signal<RecentRequest[]>([]);

  // Chart data
  leaveChartData: any;
  leaveChartOptions: any;

  get currentUser() {
    return this.authService.currentUser;
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }

  get displayName(): string {
    const user = this.currentUser;
    if (!user) return 'Pengguna';
    if (user.employee) {
      return user.employee.nama.split(' ')[0];
    }
    return user.username;
  }

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  get currentKaryawanId(): string | null {
    return this.currentUser?.employee?.id || null;
  }

  ngOnInit(): void {
    this.initCharts();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);

    if (this.isAdminOrHR) {
      // Load admin/HR stats
      this.dashboardService.getStats().subscribe({
        next: (data) => {
          this.stats.set({
            totalEmployees: data.totalKaryawan || 0,
            pendingLeaveRequests: data.leaveSummary?.menunggu || 0,
            pendingOvertimeRequests: data.overtimeSummary?.menunggu || 0,
            approvedThisMonth: (data.leaveSummary?.disetujui || 0) + (data.overtimeSummary?.disetujui || 0)
          });
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading admin stats:', err);
          this.loading.set(false);
        }
      });
    } else if (this.currentKaryawanId) {
      // Load employee stats
      this.dashboardService.getMyStats(this.currentKaryawanId).subscribe({
        next: (data) => {
          this.myStats.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading my stats:', err);
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  private initCharts(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    
    this.leaveChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Cuti Disetujui',
          data: [12, 19, 15, 25, 22, 30],
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2
        },
        {
          label: 'Lembur Disetujui',
          data: [8, 15, 12, 18, 20, 25],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        }
      ]
    };

    this.leaveChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          labels: {
            color: documentStyle.getPropertyValue('--hris-gray-700')
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: documentStyle.getPropertyValue('--hris-gray-500')
          },
          grid: {
            color: documentStyle.getPropertyValue('--hris-gray-200')
          }
        },
        y: {
          ticks: {
            color: documentStyle.getPropertyValue('--hris-gray-500')
          },
          grid: {
            color: documentStyle.getPropertyValue('--hris-gray-200')
          }
        }
      }
    };
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warn';
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Disetujui';
      case 'PENDING': return 'Menunggu';
      case 'REJECTED': return 'Ditolak';
      default: return status;
    }
  }

  getTypeLabel(type: string): string {
    return type === 'leave' ? 'Cuti' : 'Lembur';
  }
}
