import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { UIChart } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AuthService } from '../../core/services/auth.service';

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
    Card,
    Button,
    UIChart,
    TableModule,
    Tag
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);

  // Dashboard data (will be fetched from API in production)
  stats = signal<DashboardStats>({
    totalEmployees: 150,
    pendingLeaveRequests: 12,
    pendingOvertimeRequests: 8,
    approvedThisMonth: 45
  });

  recentRequests = signal<RecentRequest[]>([
    { id: 1, employeeName: 'Ahmad Fauzi', type: 'leave', status: 'PENDING', date: '2024-01-15' },
    { id: 2, employeeName: 'Siti Rahayu', type: 'overtime', status: 'APPROVED', date: '2024-01-14' },
    { id: 3, employeeName: 'Budi Santoso', type: 'leave', status: 'REJECTED', date: '2024-01-13' },
    { id: 4, employeeName: 'Dewi Lestari', type: 'overtime', status: 'PENDING', date: '2024-01-12' },
    { id: 5, employeeName: 'Eko Prasetyo', type: 'leave', status: 'APPROVED', date: '2024-01-11' },
  ]);

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
      return user.employee.firstName;
    }
    return user.username;
  }

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  ngOnInit(): void {
    this.initCharts();
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
