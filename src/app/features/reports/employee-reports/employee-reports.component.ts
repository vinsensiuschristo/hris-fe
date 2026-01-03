import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-employee-reports',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    ButtonDirective, 
    Select, 
    InputText, 
    DatePicker, 
    Tag,
    Tooltip,
    ChartModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Laporan Karyawan</h1>
        <p class="page-subtitle">Lihat dan unduh laporan data karyawan</p>
      </div>
      
      <!-- Export Buttons -->
      <div class="export-buttons">
        <button pButton class="export-btn pdf" pTooltip="Unduh laporan dalam format PDF" tooltipPosition="bottom">
          <i class="pi pi-file-pdf"></i>
          <span>Export PDF</span>
        </button>
        <button pButton class="export-btn excel" pTooltip="Unduh laporan dalam format Excel" tooltipPosition="bottom">
          <i class="pi pi-file-excel"></i>
          <span>Export Excel</span>
        </button>
      </div>
    </div>
    
    <!-- Stats Summary Cards -->
    <div class="report-stats">
      <div class="stat-card">
        <div class="stat-icon leave">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">156</span>
          <span class="stat-label">Total Cuti Bulan Ini</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon attendance">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">98.5%</span>
          <span class="stat-label">Kehadiran Rata-rata</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon lateness">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">23</span>
          <span class="stat-label">Keterlambatan</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon employees">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">87</span>
          <span class="stat-label">Total Karyawan Aktif</span>
        </div>
      </div>
    </div>
    
    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3><i class="pi pi-chart-bar"></i> Tren Cuti & Kehadiran</h3>
        <p-chart type="bar" [data]="attendanceChartData" [options]="chartOptions" height="250px"></p-chart>
      </div>
      <div class="chart-card">
        <h3><i class="pi pi-chart-pie"></i> Distribusi per Departemen</h3>
        <p-chart type="doughnut" [data]="departmentChartData" [options]="pieChartOptions" height="250px"></p-chart>
      </div>
    </div>
    
    <!-- Combined Filter + Table Card -->
    <div class="hris-card report-card">
      <!-- Filter Section - Collapsible -->
      <div class="filter-section" [class.collapsed]="isFilterCollapsed">
        <div class="filter-toggle" (click)="toggleFilter()">
          <div class="filter-title">
            <i class="pi pi-filter"></i>
            <span>Filter Laporan</span>
          </div>
          <div class="filter-toggle-icon">
            <i class="pi" [class.pi-chevron-down]="isFilterCollapsed" [class.pi-chevron-up]="!isFilterCollapsed"></i>
          </div>
        </div>
        
        <div class="filter-content" *ngIf="!isFilterCollapsed">
          <div class="filter-row-top">
            <div class="filter-item">
              <label>Tipe Laporan</label>
              <p-select 
                [options]="reportTypes" 
                [(ngModel)]="selectedReportType"
                optionLabel="name"
                optionValue="value"
                placeholder="Pilih tipe"
                [style]="{'width': '100%'}"
              />
            </div>
            
            <div class="filter-item">
              <label>Departemen</label>
              <p-select 
                [options]="departments" 
                [(ngModel)]="selectedDepartment"
                optionLabel="name"
                optionValue="value"
                placeholder="Semua"
                [style]="{'width': '100%'}"
              />
            </div>
            
            <div class="filter-item">
              <label>Status</label>
              <p-select 
                [options]="statuses" 
                [(ngModel)]="selectedStatus"
                optionLabel="name"
                optionValue="value"
                placeholder="Semua"
                [style]="{'width': '100%'}"
              />
            </div>
          </div>
          
          <div class="filter-row-bottom">
            <div class="filter-item date-item">
              <label>Periode Mulai</label>
              <p-datepicker 
                [(ngModel)]="startDate"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                placeholder="Pilih tanggal"
                appendTo="body"
              />
            </div>
            
            <div class="filter-item date-item">
              <label>Periode Akhir</label>
              <p-datepicker 
                [(ngModel)]="endDate"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                placeholder="Pilih tanggal"
                appendTo="body"
              />
            </div>
            
            <div class="filter-item search-item">
              <label>Cari Karyawan</label>
              <input pInputText type="text" placeholder="Nama / NIK..." [(ngModel)]="searchText" />
            </div>
          </div>
          
          <div class="filter-actions">
            <button pButton label="Reset" icon="pi pi-refresh" [text]="true" (click)="resetFilters()"></button>
            <button pButton label="Terapkan Filter" icon="pi pi-check"></button>
          </div>
        </div>
      </div>
      
      <!-- Table Section -->
      <div class="table-section">
        <div class="table-info">
          <span class="result-count">Menampilkan <strong>{{ reportData.length }}</strong> data karyawan</span>
        </div>
        
        <p-table 
          [value]="reportData" 
          [paginator]="true" 
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords}"
          [rowsPerPageOptions]="[10, 25, 50]"
          [sortMode]="'multiple'"
          styleClass="p-datatable-sm p-datatable-gridlines"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="employeeName" style="width: 20%">Nama <p-sortIcon field="employeeName" /></th>
              <th pSortableColumn="nik" style="width: 10%">NIK <p-sortIcon field="nik" /></th>
              <th pSortableColumn="department" style="width: 12%">Dept <p-sortIcon field="department" /></th>
              <th pSortableColumn="leaveCount" style="width: 10%">Cuti <p-sortIcon field="leaveCount" /></th>
              <th pSortableColumn="attendanceRate" style="width: 15%">Kehadiran <p-sortIcon field="attendanceRate" /></th>
              <th pSortableColumn="latenessCount" style="width: 10%">Terlambat <p-sortIcon field="latenessCount" /></th>
              <th style="width: 10%">Status</th>
              <th style="width: 13%">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr>
              <td>
                <div class="employee-info">
                  <div class="avatar">{{ row.initials }}</div>
                  <span>{{ row.employeeName }}</span>
                </div>
              </td>
              <td>{{ row.nik }}</td>
              <td>{{ row.department }}</td>
              <td>
                <span class="leave-badge">{{ row.leaveCount }} hari</span>
              </td>
              <td>
                <div class="attendance-bar">
                  <div class="bar-fill" [style.width]="row.attendanceRate + '%'" [class.high]="row.attendanceRate >= 95" [class.medium]="row.attendanceRate >= 80 && row.attendanceRate < 95" [class.low]="row.attendanceRate < 80"></div>
                  <span>{{ row.attendanceRate }}%</span>
                </div>
              </td>
              <td>
                <span class="lateness-badge" [class.warning]="row.latenessCount > 3">{{ row.latenessCount }}x</span>
              </td>
              <td>
                <p-tag [value]="row.status" [severity]="getStatusSeverity(row.status)" />
              </td>
              <td>
                <div class="action-buttons">
                  <button pButton icon="pi pi-eye" [rounded]="true" [text]="true" pTooltip="Lihat Detail" tooltipPosition="top" (click)="viewDetail(row.nik)"></button>
                  <button pButton icon="pi pi-download" [rounded]="true" [text]="true" severity="info" pTooltip="Unduh" tooltipPosition="top"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center p-4">
                <div class="empty-state">
                  <i class="pi pi-inbox empty-icon"></i>
                  <h4>Tidak ada data</h4>
                  <p>Ubah filter untuk melihat data lainnya</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .export-buttons {
      display: flex;
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
      transition: all 0.2s ease;
      
      i { font-size: 1rem; }
      
      &.pdf {
        background: linear-gradient(135deg, #EF4444, #DC2626);
        color: white;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
      }
      
      &.excel {
        background: linear-gradient(135deg, #22C55E, #16A34A);
        color: white;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        }
      }
    }
    
    /* Stats Cards */
    .report-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      
      &.leave { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; }
      &.attendance { background: linear-gradient(135deg, #10B981, #059669); color: white; }
      &.lateness { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; }
      &.employees { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; }
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1E293B;
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: #64748B;
    }
    
    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
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
        font-size: 1rem;
        font-weight: 600;
        color: #1E293B;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        i { color: #3B82F6; }
      }
    }
    
    /* Report Card */
    .report-card {
      padding: 0 !important;
      overflow: hidden;
    }
    
    /* Filter Section */
    .filter-section {
      background: #F8FAFC;
    }
    
    .filter-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1.25rem;
      cursor: pointer;
      border-bottom: 1px solid #E2E8F0;
      
      &:hover { background: #F1F5F9; }
    }
    
    .filter-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.9375rem;
      color: #1E293B;
      
      i { color: #3B82F6; }
    }
    
    .filter-content {
      padding: 1rem 1.25rem;
      background: white;
    }
    
    /* Filter Row Layouts */
    .filter-row-top,
    .filter-row-bottom {
      display: grid;
      gap: 1rem;
      align-items: end;
      margin-bottom: 1rem;
    }
    
    .filter-row-top {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .filter-row-bottom {
      grid-template-columns: 1fr 1fr 1.5fr;
    }
    
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      width: 100%;
      
      label {
        font-size: 0.75rem;
        font-weight: 500;
        color: #64748B;
        white-space: nowrap;
      }
    }
    
    .date-item {
      position: relative;
      overflow: visible;
      
      :host ::ng-deep p-datepicker {
        display: block !important;
        width: 100% !important;
      }
    }
    
    .search-item {
      input {
        width: 100%;
        padding: 0.625rem 0.75rem;
        font-size: 0.875rem;
        border: 1px solid #E2E8F0;
        border-radius: 6px;
        
        &:focus {
          outline: none;
          border-color: #3B82F6;
        }
      }
    }
    
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #E2E8F0;
    }
    
    /* Table Section */
    .table-section {
      padding: 1rem 1.25rem;
    }
    
    .table-info {
      margin-bottom: 0.75rem;
      .result-count {
        color: #64748B;
        font-size: 0.8125rem;
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }
    
    /* Table Cell Styles */
    .employee-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.6875rem;
    }
    
    .leave-badge {
      background: #DBEAFE;
      color: #1D4ED8;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.6875rem;
      font-weight: 500;
    }
    
    .attendance-bar {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      
      .bar-fill {
        height: 6px;
        border-radius: 3px;
        min-width: 50px;
        
        &.high { background: linear-gradient(90deg, #10B981, #059669); }
        &.medium { background: linear-gradient(90deg, #F59E0B, #D97706); }
        &.low { background: linear-gradient(90deg, #EF4444, #DC2626); }
      }
      
      span {
        font-size: 0.6875rem;
        font-weight: 600;
        color: #475569;
      }
    }
    
    .lateness-badge {
      background: #F1F5F9;
      color: #475569;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.6875rem;
      font-weight: 500;
      
      &.warning {
        background: #FEF3C7;
        color: #D97706;
      }
    }
    
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #64748B;
      
      .empty-icon {
        font-size: 2.5rem;
        margin-bottom: 0.75rem;
        opacity: 0.5;
      }
      
      h4 { margin: 0 0 0.375rem; color: #1E293B; }
      p { margin: 0; font-size: 0.8125rem; }
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
          display: flex !important;
          flex-wrap: nowrap !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          
          .p-datepicker-input,
          input.p-datepicker-input {
            flex: 1 1 auto !important;
            width: 100% !important;
            max-width: calc(100% - 2.5rem) !important;
            min-width: 0 !important;
            padding: 0.5rem 0.625rem !important;
            font-size: 0.8125rem !important;
            box-sizing: border-box !important;
          }
          
          .p-datepicker-dropdown,
          .p-datepicker-trigger,
          .p-datepicker-input-icon-container {
            flex: 0 0 auto !important;
            width: 2.5rem !important;
          }
        }
      }
      
      .p-paginator {
        padding: 0.625rem 1rem;
        background: #F8FAFC;
        border-top: 1px solid #E2E8F0;
        justify-content: flex-end;
        font-size: 0.8125rem;
      }
      
      .p-datatable .p-datatable-thead > tr > th {
        padding: 0.625rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: #64748B;
        background: #F8FAFC;
      }
      
      .p-datatable .p-datatable-tbody > tr > td {
        padding: 0.5rem 0.75rem;
        font-size: 0.8125rem;
      }
    }
    
    /* Responsive */
    @media (max-width: 1200px) {
      .report-stats { grid-template-columns: repeat(2, 1fr); }
      .charts-section { grid-template-columns: 1fr; }
      .filter-row { grid-template-columns: repeat(3, 1fr); }
    }
    
    @media (max-width: 768px) {
      .report-stats { grid-template-columns: 1fr; }
      .filter-row { grid-template-columns: 1fr; }
      .export-buttons { width: 100%; }
      .export-btn { flex: 1; justify-content: center; }
    }
  `]
})
export class EmployeeReportsComponent implements OnInit {
  private router = inject(Router);
  
  isFilterCollapsed = false;
  searchText = '';
  
  // Chart data
  attendanceChartData: any;
  departmentChartData: any;
  chartOptions: any;
  pieChartOptions: any;
  
  // Filter options
  reportTypes = [
    { name: 'Semua', value: 'all' },
    { name: 'Cuti', value: 'leave' },
    { name: 'Kehadiran', value: 'attendance' },
    { name: 'Keterlambatan', value: 'lateness' }
  ];
  
  departments = [
    { name: 'Semua Dept', value: '' },
    { name: 'IT', value: 'it' },
    { name: 'HR', value: 'hr' },
    { name: 'Finance', value: 'finance' },
    { name: 'Marketing', value: 'marketing' },
    { name: 'Operations', value: 'operations' }
  ];
  
  statuses = [
    { name: 'Semua', value: '' },
    { name: 'Aktif', value: 'active' },
    { name: 'Nonaktif', value: 'inactive' }
  ];
  
  selectedReportType = 'all';
  selectedDepartment = '';
  selectedStatus = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  reportData = [
    { employeeName: 'Ahmad Fauzi', initials: 'AF', nik: 'EMP001', department: 'IT', leaveCount: 3, attendanceRate: 98, latenessCount: 1, status: 'Aktif' },
    { employeeName: 'Siti Rahayu', initials: 'SR', nik: 'EMP002', department: 'HR', leaveCount: 5, attendanceRate: 95, latenessCount: 2, status: 'Aktif' },
    { employeeName: 'Budi Santoso', initials: 'BS', nik: 'EMP003', department: 'Finance', leaveCount: 2, attendanceRate: 100, latenessCount: 0, status: 'Aktif' },
    { employeeName: 'Dewi Lestari', initials: 'DL', nik: 'EMP004', department: 'Marketing', leaveCount: 8, attendanceRate: 88, latenessCount: 5, status: 'Aktif' },
    { employeeName: 'Eko Prasetyo', initials: 'EP', nik: 'EMP005', department: 'Operations', leaveCount: 1, attendanceRate: 99, latenessCount: 0, status: 'Aktif' },
    { employeeName: 'Fitriani Wati', initials: 'FW', nik: 'EMP006', department: 'IT', leaveCount: 4, attendanceRate: 92, latenessCount: 3, status: 'Aktif' },
    { employeeName: 'Gunawan Putra', initials: 'GP', nik: 'EMP007', department: 'HR', leaveCount: 0, attendanceRate: 100, latenessCount: 0, status: 'Nonaktif' },
    { employeeName: 'Hendra Wijaya', initials: 'HW', nik: 'EMP008', department: 'Finance', leaveCount: 6, attendanceRate: 85, latenessCount: 7, status: 'Aktif' },
  ];
  
  ngOnInit(): void {
    this.initCharts();
  }
  
  initCharts(): void {
    // Attendance Bar Chart
    this.attendanceChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      datasets: [
        {
          label: 'Kehadiran (%)',
          backgroundColor: '#3B82F6',
          borderRadius: 6,
          data: [96, 97, 95, 98, 97, 98]
        },
        {
          label: 'Cuti (hari)',
          backgroundColor: '#F59E0B',
          borderRadius: 6,
          data: [12, 15, 18, 10, 14, 16]
        },
        {
          label: 'Terlambat',
          backgroundColor: '#EF4444',
          borderRadius: 6,
          data: [5, 3, 7, 4, 6, 3]
        }
      ]
    };
    
    // Department Pie Chart
    this.departmentChartData = {
      labels: ['IT', 'HR', 'Finance', 'Marketing', 'Operations'],
      datasets: [{
        data: [25, 15, 20, 22, 18],
        backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
        hoverBackgroundColor: ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626']
      }]
    };
    
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
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
  
  toggleFilter(): void {
    this.isFilterCollapsed = !this.isFilterCollapsed;
  }
  
  resetFilters(): void {
    this.selectedReportType = 'all';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.startDate = null;
    this.endDate = null;
    this.searchText = '';
  }
  
  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    return status === 'Aktif' ? 'success' : 'secondary';
  }
  
  viewDetail(nik: string): void {
    this.router.navigate(['/reports/employees', nik]);
  }
}
