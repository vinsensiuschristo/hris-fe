import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { UIChart } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { 
  DashboardStats, 
  LateEmployee, 
  OvertimeEmployeeRanking, 
  LeaveEmployee 
} from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
  private dashboardService = inject(DashboardService);

  // Loading state
  loading = signal<boolean>(true);

  // Dashboard data from API
  stats = signal<DashboardStats | null>(null);
  topLateEmployees = signal<LateEmployee[]>([]);
  topOvertimeEmployees = signal<OvertimeEmployeeRanking[]>([]);
  topLeaveEmployees = signal<LeaveEmployee[]>([]);

  // Filter options
  selectedMonth: Date = new Date();
  departments = signal<{ label: string; value: string }[]>([
    { label: 'Semua Departemen', value: '' }
  ]);
  selectedDepartment = '';

  // Chart data
  attendanceChartData: any;
  attendanceChartOptions: any;
  lateRankingChartData: any;
  overtimeRankingChartData: any;
  barChartOptions: any;

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
    return user.username;
  }

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.initChartOptions();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth() + 1;

    this.dashboardService.getMonthlyStats(year, month, this.selectedDepartment || undefined)
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.topLateEmployees.set(data.topLateEmployees || []);
          this.topOvertimeEmployees.set(data.topOvertimeEmployees || []);
          this.topLeaveEmployees.set(data.topLeaveEmployees || []);
          this.updateCharts(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading dashboard:', err);
          this.loading.set(false);
          // Use mock data as fallback
          this.loadMockData();
        }
      });
  }

  private loadMockData(): void {
    const mockStats: DashboardStats = {
      totalKaryawan: 150,
      attendanceSummary: {
        totalHadir: 120,
        totalTerlambat: 15,
        totalIzin: 8,
        totalSakit: 5,
        totalAlpha: 2,
        totalKeterlambatanMenit: 450
      },
      leaveSummary: {
        totalPengajuan: 25,
        disetujui: 18,
        ditolak: 3,
        menunggu: 4
      },
      overtimeSummary: {
        totalPengajuan: 30,
        disetujui: 22,
        ditolak: 2,
        menunggu: 6,
        totalBiaya: 5500000,
        totalJamLembur: 110
      },
      topLateEmployees: [],
      topOvertimeEmployees: [],
      topLeaveEmployees: []
    };
    this.stats.set(mockStats);
    this.updateCharts(mockStats);
  }

  onFilterChange(): void {
    this.loadDashboardData();
  }

  onMonthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const [year, month] = input.value.split('-').map(Number);
      this.selectedMonth = new Date(year, month - 1, 1);
      this.loadDashboardData();
    }
  }

  private initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    
    this.attendanceChartOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: documentStyle.getPropertyValue('--hris-gray-700')
          }
        }
      }
    };

    this.barChartOptions = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 1.2,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: { color: documentStyle.getPropertyValue('--hris-gray-500') },
          grid: { color: documentStyle.getPropertyValue('--hris-gray-200') }
        },
        y: {
          ticks: { color: documentStyle.getPropertyValue('--hris-gray-500') },
          grid: { display: false }
        }
      }
    };
  }

  private updateCharts(data: DashboardStats): void {
    // Attendance Pie Chart
    const attendance = data.attendanceSummary;
    this.attendanceChartData = {
      labels: ['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'],
      datasets: [{
        data: [
          attendance.totalHadir - attendance.totalTerlambat, // Hadir tepat waktu
          attendance.totalTerlambat,
          attendance.totalIzin,
          attendance.totalSakit,
          attendance.totalAlpha
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green - Hadir
          'rgba(234, 179, 8, 0.8)',   // Yellow - Terlambat
          'rgba(59, 130, 246, 0.8)',  // Blue - Izin
          'rgba(168, 85, 247, 0.8)',  // Purple - Sakit
          'rgba(239, 68, 68, 0.8)'    // Red - Alpha
        ],
        borderWidth: 0
      }]
    };

    // Late Ranking Bar Chart
    const lateData = data.topLateEmployees?.slice(0, 5) || [];
    this.lateRankingChartData = {
      labels: lateData.map(e => e.nama),
      datasets: [{
        label: 'Total Menit Terlambat',
        data: lateData.map(e => e.totalMenitTerlambat),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        borderRadius: 4
      }]
    };

    // Overtime Ranking Bar Chart
    const overtimeData = data.topOvertimeEmployees?.slice(0, 5) || [];
    this.overtimeRankingChartData = {
      labels: overtimeData.map(e => e.nama),
      datasets: [{
        label: 'Total Jam Lembur',
        data: overtimeData.map(e => e.totalJamLembur),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4
      }]
    };
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'DISETUJUI':
      case 'APPROVED': return 'success';
      case 'MENUNGGU_PERSETUJUAN':
      case 'PENDING': return 'warn';
      case 'DITOLAK':
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }
}
