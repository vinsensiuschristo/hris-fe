import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Tooltip } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-employee-report-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    ButtonDirective, 
    Select, 
    DatePicker, 
    Tag,
    Card,
    Tooltip,
    ChartModule,
    TableModule
  ],
  template: `
    <!-- Back Button & Header -->
    <div class="page-header">
      <div class="header-left">
        <button pButton icon="pi pi-arrow-left" [rounded]="true" [text]="true" (click)="goBack()" pTooltip="Kembali"></button>
        <div>
          <h1 class="page-title">Detail Laporan Karyawan</h1>
          <p class="page-subtitle">{{ employee.employeeName }} - {{ employee.nik }}</p>
        </div>
      </div>
      <div class="export-buttons">
        <button pButton class="export-btn pdf" pTooltip="Unduh PDF" tooltipPosition="bottom">
          <i class="pi pi-file-pdf"></i>
          <span>Export PDF</span>
        </button>
      </div>
    </div>
    
    <!-- Employee Info Card -->
    <div class="employee-profile">
      <div class="profile-avatar">
        <span>{{ employee.initials }}</span>
      </div>
      <div class="profile-info">
        <h2>{{ employee.employeeName }}</h2>
        <div class="info-row">
          <span class="info-item"><i class="pi pi-id-card"></i> {{ employee.nik }}</span>
          <span class="info-item"><i class="pi pi-briefcase"></i> {{ employee.department }}</span>
          <p-tag [value]="employee.status" [severity]="employee.status === 'Aktif' ? 'success' : 'secondary'" />
        </div>
      </div>
    </div>
    
    <!-- Filter Section -->
    <div class="hris-card filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label>Tipe Laporan</label>
          <p-select 
            [options]="reportTypes" 
            [(ngModel)]="selectedReportType"
            optionLabel="name"
            optionValue="value"
            [style]="{'width': '100%'}"
          />
        </div>
        <div class="filter-item">
          <label>Periode</label>
          <p-select 
            [options]="periods" 
            [(ngModel)]="selectedPeriod"
            optionLabel="name"
            optionValue="value"
            [style]="{'width': '100%'}"
          />
        </div>
        <div class="filter-item">
          <label>Dari</label>
          <p-datepicker 
            [(ngModel)]="startDate"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            [style]="{'width': '100%'}"
            appendTo="body"
          />
        </div>
        <div class="filter-item">
          <label>Sampai</label>
          <p-datepicker 
            [(ngModel)]="endDate"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            [style]="{'width': '100%'}"
            appendTo="body"
          />
        </div>
        <div class="filter-item actions">
          <button pButton label="Terapkan" icon="pi pi-check" size="small"></button>
        </div>
      </div>
    </div>
    
    <!-- Stats Summary -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon attendance"><i class="pi pi-check-circle"></i></div>
        <div class="stat-content">
          <span class="stat-value">{{ employee.attendanceRate }}%</span>
          <span class="stat-label">Kehadiran</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon leave"><i class="pi pi-calendar"></i></div>
        <div class="stat-content">
          <span class="stat-value">{{ employee.leaveCount }}</span>
          <span class="stat-label">Cuti Diambil</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon lateness"><i class="pi pi-clock"></i></div>
        <div class="stat-content">
          <span class="stat-value">{{ employee.latenessCount }}</span>
          <span class="stat-label">Keterlambatan</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon overtime"><i class="pi pi-hourglass"></i></div>
        <div class="stat-content">
          <span class="stat-value">12</span>
          <span class="stat-label">Jam Lembur</span>
        </div>
      </div>
    </div>
    
    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3><i class="pi pi-chart-line"></i> Tren Kehadiran 6 Bulan Terakhir</h3>
        <p-chart type="line" [data]="attendanceLineData" [options]="lineChartOptions" height="300px"></p-chart>
      </div>
      <div class="chart-card">
        <h3><i class="pi pi-chart-pie"></i> Distribusi Cuti</h3>
        <p-chart type="pie" [data]="leaveDistributionData" [options]="pieChartOptions" height="300px"></p-chart>
      </div>
    </div>
    
    <!-- History Table -->
    <div class="hris-card">
      <h3 class="section-title"><i class="pi pi-history"></i> Riwayat Kehadiran</h3>
      <p-table 
        [value]="attendanceHistory" 
        [paginator]="true" 
        [rows]="5"
        styleClass="p-datatable-sm p-datatable-gridlines"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Tanggal</th>
            <th>Jam Masuk</th>
            <th>Jam Keluar</th>
            <th>Status</th>
            <th>Keterangan</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.date }}</td>
            <td>{{ row.checkIn }}</td>
            <td>{{ row.checkOut }}</td>
            <td>
              <p-tag [value]="row.status" [severity]="getAttendanceSeverity(row.status)" />
            </td>
            <td>{{ row.notes || '-' }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .export-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      
      &.pdf {
        background: linear-gradient(135deg, #EF4444, #DC2626);
        color: white;
      }
    }
    
    /* Employee Profile */
    .employee-profile {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      border-radius: 12px;
      margin-bottom: 1.5rem;
      color: white;
    }
    
    .profile-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .profile-info h2 {
      margin: 0 0 0.5rem;
      font-size: 1.375rem;
    }
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      opacity: 0.9;
    }
    
    /* Filter */
    .filter-card {
      margin-bottom: 1.5rem;
      padding: 1rem 1.25rem !important;
    }
    
    .filter-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      align-items: end;
    }
    
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      
      label {
        font-size: 0.75rem;
        font-weight: 500;
        color: #64748B;
        white-space: nowrap;
      }
      
      &.actions {
        justify-self: start;
      }
    }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;
      
      &.attendance { background: linear-gradient(135deg, #10B981, #059669); color: white; }
      &.leave { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; }
      &.lateness { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; }
      &.overtime { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; }
    }
    
    .stat-value {
      font-size: 1.375rem;
      font-weight: 700;
      color: #1E293B;
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: #64748B;
    }
    
    /* Charts */
    .charts-section {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      h3 {
        margin: 0 0 1rem;
        font-size: 0.9375rem;
        font-weight: 600;
        color: #1E293B;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        i { color: #3B82F6; }
      }
    }
    
    .section-title {
      margin: 0 0 1rem;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      i { color: #3B82F6; }
    }
    
    /* PrimeNG Overrides */
    :host ::ng-deep {
      .filter-item {
        .p-select,
        .p-datepicker {
          width: 100% !important;
          display: flex !important;
          flex-wrap: nowrap !important;
        }
        
        .p-select {
          .p-select-label {
            flex: 1 1 auto !important;
            padding: 0.5rem 0.625rem !important;
            font-size: 0.8125rem !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          
          .p-select-dropdown {
            flex: 0 0 auto !important;
            width: 2rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
        
        .p-datepicker {
          .p-datepicker-input {
            flex: 1 1 auto !important;
            padding: 0.5rem 0.625rem !important;
            font-size: 0.8125rem !important;
          }
          
          .p-datepicker-dropdown,
          .p-datepicker-trigger {
            flex: 0 0 auto !important;
          }
        }
      }
    }
    
    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-section { grid-template-columns: 1fr; }
      .filter-row { grid-template-columns: repeat(3, 1fr); }
    }
    
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
      .filter-row { grid-template-columns: 1fr; }
      .employee-profile { flex-direction: column; text-align: center; }
      .info-row { flex-wrap: wrap; justify-content: center; }
    }
  `]
})
export class EmployeeReportDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  // Sample employee data
  employee = {
    employeeName: 'Ahmad Fauzi',
    initials: 'AF',
    nik: 'EMP001',
    department: 'IT',
    leaveCount: 3,
    attendanceRate: 98,
    latenessCount: 1,
    status: 'Aktif'
  };
  
  // Filter options
  reportTypes = [
    { name: 'Semua', value: 'all' },
    { name: 'Kehadiran', value: 'attendance' },
    { name: 'Cuti', value: 'leave' },
    { name: 'Keterlambatan', value: 'lateness' }
  ];
  
  periods = [
    { name: '1 Bulan', value: '1m' },
    { name: '3 Bulan', value: '3m' },
    { name: '6 Bulan', value: '6m' },
    { name: '1 Tahun', value: '1y' }
  ];
  
  selectedReportType = 'all';
  selectedPeriod = '6m';
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Chart data
  attendanceLineData: any;
  leaveDistributionData: any;
  lineChartOptions: any;
  pieChartOptions: any;
  
  // Attendance history
  attendanceHistory = [
    { date: '02 Jan 2026', checkIn: '08:15', checkOut: '17:30', status: 'Hadir', notes: '' },
    { date: '01 Jan 2026', checkIn: '-', checkOut: '-', status: 'Libur', notes: 'Tahun Baru' },
    { date: '31 Des 2025', checkIn: '08:45', checkOut: '17:00', status: 'Terlambat', notes: 'Terlambat 15 menit' },
    { date: '30 Des 2025', checkIn: '08:00', checkOut: '17:30', status: 'Hadir', notes: '' },
    { date: '29 Des 2025', checkIn: '-', checkOut: '-', status: 'Cuti', notes: 'Cuti Tahunan' },
  ];
  
  ngOnInit(): void {
    this.initCharts();
  }
  
  initCharts(): void {
    this.attendanceLineData = {
      labels: ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      datasets: [
        {
          label: 'Kehadiran (%)',
          data: [95, 98, 96, 99, 97, 98],
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3B82F6',
          tension: 0.4
        }
      ]
    };
    
    this.leaveDistributionData = {
      labels: ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Izin'],
      datasets: [{
        data: [2, 1, 0],
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'],
        hoverBackgroundColor: ['#2563EB', '#D97706', '#059669']
      }]
    };
    
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 80,
          max: 100,
          ticks: { font: { size: 10 } }
        },
        x: {
          ticks: { font: { size: 10 } }
        }
      }
    };
    
    this.pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 } }
        }
      }
    };
  }
  
  goBack(): void {
    this.router.navigate(['/reports/employees']);
  }
  
  getAttendanceSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'Hadir': return 'success';
      case 'Terlambat': return 'warn';
      case 'Cuti': return 'info';
      case 'Sakit': return 'danger';
      case 'Libur': return 'secondary';
      default: return 'secondary';
    }
  }
}
