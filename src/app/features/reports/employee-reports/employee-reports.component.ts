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
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { EmployeeService } from '../../../core/services/employee.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DepartmentService } from '../../../core/services/department.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { EmployeeResponse, Department, Attendance, OvertimeRequest, LeaveRequest, DashboardStats } from '../../../core/models';
import { forkJoin } from 'rxjs';

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
    ChartModule,
    ToastModule,
    TabsModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">📊 Laporan</h1>
        <p class="page-subtitle">Lihat dan unduh laporan kehadiran, lembur, cuti, dan karyawan</p>
      </div>
    </div>
    
    <!-- Tabs -->
    <p-tabs value="0" (onChange)="onTabChange($event)">
      <p-tablist>
        <p-tab value="0"><i class="pi pi-calendar-clock"></i> Kehadiran</p-tab>
        <p-tab value="1"><i class="pi pi-clock"></i> Lembur</p-tab>
        <p-tab value="2"><i class="pi pi-calendar"></i> Cuti</p-tab>
        <p-tab value="3"><i class="pi pi-users"></i> Karyawan</p-tab>
      </p-tablist>
      
      <!-- Tab 1: Kehadiran -->
      <p-tabpanel value="0">
        <div class="tab-content">
          <!-- Stats -->
          <div class="report-stats">
            <div class="stat-card">
              <div class="stat-icon green"><i class="pi pi-check-circle"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ attendanceStats.hadir }}</span>
                <span class="stat-label">Hadir</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orange"><i class="pi pi-clock"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ attendanceStats.terlambat }}</span>
                <span class="stat-label">Terlambat</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon red"><i class="pi pi-times-circle"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ attendanceStats.alpha }}</span>
                <span class="stat-label">Alpha</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon blue"><i class="pi pi-percentage"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ attendanceStats.percentage }}%</span>
                <span class="stat-label">Tingkat Kehadiran</span>
              </div>
            </div>
          </div>
          
          <!-- Chart -->
          <div class="chart-section">
            <div class="chart-card full">
              <h3><i class="pi pi-chart-bar"></i> Tren Kehadiran</h3>
              <p-chart type="bar" [data]="attendanceChartData" [options]="barChartOptions" height="250px" />
            </div>
          </div>
          
          <!-- Filter + Table -->
          <div class="hris-card">
            <div class="card-header-actions">
              <h3>Data Kehadiran</h3>
              <div class="export-buttons">
                <button pButton class="export-btn excel" (click)="exportAttendance('excel')"><i class="pi pi-file-excel"></i> Excel</button>
                <button pButton class="export-btn csv" (click)="exportAttendance('csv')"><i class="pi pi-download"></i> CSV</button>
              </div>
            </div>
            
            <div class="filter-inline">
              <div class="filter-item">
                <p-select [options]="departmentOptions" [(ngModel)]="attendanceFilter.department" placeholder="Departemen" [showClear]="true" />
              </div>
              <div class="filter-item">
                <p-datepicker [(ngModel)]="attendanceFilter.startDate" placeholder="Dari" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" />
              </div>
              <div class="filter-item">
                <p-datepicker [(ngModel)]="attendanceFilter.endDate" placeholder="Sampai" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" />
              </div>
              <button pButton icon="pi pi-filter" label="Filter" (click)="applyAttendanceFilter()"></button>
            </div>
            
            <p-table [value]="filteredAttendance" [paginator]="true" [rows]="10" styleClass="p-datatable-sm" [loading]="loadingAttendance">
              <ng-template pTemplate="header">
                <tr>
                  <th>Tanggal</th>
                  <th>Karyawan</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Terlambat</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row>
                <tr>
                  <td>{{ row.tanggal }}</td>
                  <td>{{ row.karyawan?.nama || '-' }}</td>
                  <td>{{ row.jamMasuk || '-' }}</td>
                  <td>{{ row.jamKeluar || '-' }}</td>
                  <td><p-tag [value]="row.status" [severity]="getAttendanceStatusSeverity(row.status)" /></td>
                  <td>{{ row.keterlambatanMenit ? row.keterlambatanMenit + ' menit' : '-' }}</td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage"><tr><td colspan="6" class="text-center">Tidak ada data</td></tr></ng-template>
            </p-table>
          </div>
        </div>
      </p-tabpanel>
      
      <!-- Tab 2: Lembur -->
      <p-tabpanel value="1">
        <div class="tab-content">
          <!-- Stats -->
          <div class="report-stats">
            <div class="stat-card">
              <div class="stat-icon purple"><i class="pi pi-list"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ overtimeStats.total }}</span>
                <span class="stat-label">Total Pengajuan</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green"><i class="pi pi-check"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ overtimeStats.disetujui }}</span>
                <span class="stat-label">Disetujui</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orange"><i class="pi pi-clock"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ overtimeStats.menunggu }}</span>
                <span class="stat-label">Menunggu</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon blue"><i class="pi pi-hourglass"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ overtimeStats.totalJam }}</span>
                <span class="stat-label">Total Jam</span>
              </div>
            </div>
          </div>
          
          <!-- Chart -->
          <div class="chart-section">
            <div class="chart-card">
              <h3><i class="pi pi-chart-bar"></i> Lembur per Departemen</h3>
              <p-chart type="bar" [data]="overtimeChartData" [options]="barChartOptions" height="220px" />
            </div>
            <div class="chart-card">
              <h3><i class="pi pi-chart-pie"></i> Status Lembur</h3>
              <p-chart type="doughnut" [data]="overtimeStatusChart" [options]="pieChartOptions" height="220px" />
            </div>
          </div>
          
          <!-- Filter + Table -->
          <div class="hris-card">
            <div class="card-header-actions">
              <h3>Data Lembur</h3>
              <div class="export-buttons">
                <button pButton class="export-btn excel" (click)="exportOvertime('excel')"><i class="pi pi-file-excel"></i> Excel</button>
                <button pButton class="export-btn csv" (click)="exportOvertime('csv')"><i class="pi pi-download"></i> CSV</button>
              </div>
            </div>
            
            <div class="filter-inline">
              <div class="filter-item">
                <p-select [options]="departmentOptions" [(ngModel)]="overtimeFilter.department" placeholder="Departemen" [showClear]="true" />
              </div>
              <div class="filter-item">
                <p-select [options]="statusOptions" [(ngModel)]="overtimeFilter.status" placeholder="Status" [showClear]="true" />
              </div>
              <button pButton icon="pi pi-filter" label="Filter" (click)="applyOvertimeFilter()"></button>
            </div>
            
            <p-table [value]="filteredOvertime" [paginator]="true" [rows]="10" styleClass="p-datatable-sm" [loading]="loadingOvertime">
              <ng-template pTemplate="header">
                <tr>
                  <th>Karyawan</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Durasi</th>
                  <th>Biaya</th>
                  <th>Status</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row>
                <tr>
                  <td>{{ row.karyawan?.nama || '-' }}</td>
                  <td>{{ row.tglLembur }}</td>
                  <td>{{ row.jamMulai }} - {{ row.jamSelesai }}</td>
                  <td><span class="badge-hours">{{ row.durasi }}h</span></td>
                  <td>Rp {{ row.estimasiBiaya | number:'1.0-0' }}</td>
                  <td><p-tag [value]="getOvertimeStatusLabel(row.status?.namaStatus)" [severity]="getOvertimeStatusSeverity(row.status?.namaStatus)" /></td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage"><tr><td colspan="6" class="text-center">Tidak ada data</td></tr></ng-template>
            </p-table>
          </div>
        </div>
      </p-tabpanel>
      
      <!-- Tab 3: Cuti -->
      <p-tabpanel value="2">
        <div class="tab-content">
          <!-- Stats -->
          <div class="report-stats">
            <div class="stat-card">
              <div class="stat-icon blue"><i class="pi pi-list"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ leaveStats.total }}</span>
                <span class="stat-label">Total Pengajuan</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green"><i class="pi pi-check"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ leaveStats.disetujui }}</span>
                <span class="stat-label">Disetujui</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orange"><i class="pi pi-clock"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ leaveStats.menunggu }}</span>
                <span class="stat-label">Menunggu</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon red"><i class="pi pi-times"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ leaveStats.ditolak }}</span>
                <span class="stat-label">Ditolak</span>
              </div>
            </div>
          </div>
          
          <!-- Chart -->
          <div class="chart-section">
            <div class="chart-card">
              <h3><i class="pi pi-chart-pie"></i> Distribusi Jenis Cuti</h3>
              <p-chart type="pie" [data]="leaveTypeChart" [options]="pieChartOptions" height="220px" />
            </div>
            <div class="chart-card">
              <h3><i class="pi pi-chart-bar"></i> Cuti per Departemen</h3>
              <p-chart type="bar" [data]="leaveDeptChart" [options]="barChartOptions" height="220px" />
            </div>
          </div>
          
          <!-- Filter + Table -->
          <div class="hris-card">
            <div class="card-header-actions">
              <h3>Data Cuti</h3>
              <div class="export-buttons">
                <button pButton class="export-btn excel" (click)="exportLeave('excel')"><i class="pi pi-file-excel"></i> Excel</button>
                <button pButton class="export-btn csv" (click)="exportLeave('csv')"><i class="pi pi-download"></i> CSV</button>
              </div>
            </div>
            
            <div class="filter-inline">
              <div class="filter-item">
                <p-select [options]="departmentOptions" [(ngModel)]="leaveFilter.department" placeholder="Departemen" [showClear]="true" />
              </div>
              <div class="filter-item">
                <p-select [options]="leaveTypeOptions" [(ngModel)]="leaveFilter.type" placeholder="Jenis Cuti" [showClear]="true" />
              </div>
              <div class="filter-item">
                <p-select [options]="statusOptions" [(ngModel)]="leaveFilter.status" placeholder="Status" [showClear]="true" />
              </div>
              <button pButton icon="pi pi-filter" label="Filter" (click)="applyLeaveFilter()"></button>
            </div>
            
            <p-table [value]="filteredLeave" [paginator]="true" [rows]="10" styleClass="p-datatable-sm" [loading]="loadingLeave">
              <ng-template pTemplate="header">
                <tr>
                  <th>Karyawan</th>
                  <th>Jenis Cuti</th>
                  <th>Tanggal</th>
                  <th>Durasi</th>
                  <th>Alasan</th>
                  <th>Status</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row>
                <tr>
                  <td>{{ row.karyawan?.nama || '-' }}</td>
                  <td><p-tag [value]="row.jenisCuti?.namaJenis || '-'" severity="info" /></td>
                  <td>{{ row.tglMulai }} - {{ row.tglSelesai }}</td>
                  <td><span class="badge-days">{{ row.jumlahHari }} hari</span></td>
                  <td class="reason-cell">{{ row.alasan || '-' }}</td>
                  <td><p-tag [value]="getLeaveStatusLabel(row.status?.namaStatus)" [severity]="getLeaveStatusSeverity(row.status?.namaStatus)" /></td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage"><tr><td colspan="6" class="text-center">Tidak ada data</td></tr></ng-template>
            </p-table>
          </div>
        </div>
      </p-tabpanel>
      
      <!-- Tab 4: Karyawan -->
      <p-tabpanel value="3">
        <div class="tab-content">
          <!-- Stats -->
          <div class="report-stats">
            <div class="stat-card">
              <div class="stat-icon purple"><i class="pi pi-users"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ allEmployees.length }}</span>
                <span class="stat-label">Total Karyawan</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon blue"><i class="pi pi-building"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ departments.length }}</span>
                <span class="stat-label">Departemen</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green"><i class="pi pi-calendar"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ getTotalSisaCuti() }}</span>
                <span class="stat-label">Total Sisa Cuti</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orange"><i class="pi pi-chart-line"></i></div>
              <div class="stat-content">
                <span class="stat-value">{{ getAvgSisaCuti() }}</span>
                <span class="stat-label">Rata-rata Sisa Cuti</span>
              </div>
            </div>
          </div>
          
          <!-- Chart -->
          <div class="chart-section">
            <div class="chart-card full">
              <h3><i class="pi pi-chart-pie"></i> Distribusi Karyawan per Departemen</h3>
              <p-chart type="doughnut" [data]="employeeDeptChart" [options]="pieChartOptions" height="250px" />
            </div>
          </div>
          
          <!-- Filter + Table -->
          <div class="hris-card">
            <div class="card-header-actions">
              <h3>Data Karyawan</h3>
              <div class="export-buttons">
                <button pButton class="export-btn excel" (click)="exportEmployees('excel')"><i class="pi pi-file-excel"></i> Excel</button>
                <button pButton class="export-btn csv" (click)="exportEmployees('csv')"><i class="pi pi-download"></i> CSV</button>
              </div>
            </div>
            
            <div class="filter-inline">
              <div class="filter-item">
                <p-select [options]="departmentOptions" [(ngModel)]="employeeFilter.department" placeholder="Departemen" [showClear]="true" />
              </div>
              <div class="filter-item search">
                <input pInputText placeholder="Cari nama/NIK..." [(ngModel)]="employeeFilter.search" />
              </div>
              <button pButton icon="pi pi-filter" label="Filter" (click)="applyEmployeeFilter()"></button>
            </div>
            
            <p-table [value]="filteredEmployees" [paginator]="true" [rows]="10" styleClass="p-datatable-sm" [loading]="loadingEmployees">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nama</th>
                  <th>NIK</th>
                  <th>Email</th>
                  <th>Departemen</th>
                  <th>Jabatan</th>
                  <th>Sisa Cuti</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row>
                <tr>
                  <td>
                    <div class="employee-cell">
                      <div class="avatar">{{ getInitials(row.nama) }}</div>
                      <span>{{ row.nama }}</span>
                    </div>
                  </td>
                  <td><span class="nik-badge">{{ row.nik }}</span></td>
                  <td>{{ row.email }}</td>
                  <td><span class="dept-badge">{{ row.departemen?.namaDepartment || '-' }}</span></td>
                  <td>{{ row.jabatan?.namaJabatan || '-' }}</td>
                  <td><span class="leave-badge" [class.low]="row.sisaCuti < 5">{{ row.sisaCuti }} hari</span></td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage"><tr><td colspan="6" class="text-center">Tidak ada data</td></tr></ng-template>
            </p-table>
          </div>
        </div>
      </p-tabpanel>
    </p-tabs>
  `,
  styles: [`
    /* Tab Styling - Override PrimeNG defaults */
    :host ::ng-deep .p-tabs { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: none !important; }
    :host ::ng-deep .p-tablist { background: #F8FAFC; padding: 0.75rem 1rem 0; border: none !important; border-bottom: 1px solid #E2E8F0 !important; }
    :host ::ng-deep .p-tablist-content { border: none !important; }
    :host ::ng-deep .p-tab { padding: 0.875rem 1.5rem; font-weight: 600; font-size: 0.875rem; gap: 0.5rem; border-radius: 8px 8px 0 0; transition: all 0.2s; border: none !important; outline: none !important; }
    :host ::ng-deep .p-tab:hover { background: rgba(59, 130, 246, 0.1); }
    :host ::ng-deep .p-tab.p-tab-active { background: white; color: #3B82F6; border: none !important; border-bottom: 3px solid #3B82F6 !important; }
    :host ::ng-deep .p-tab:focus { box-shadow: none !important; }
    :host ::ng-deep .p-tab i { font-size: 1rem; }
    :host ::ng-deep .p-tabpanels { padding: 1.5rem; border: none !important; }
    :host ::ng-deep .p-tabpanel { border: none !important; }
    
    .tab-content { padding: 0; }
    
    /* Stats Cards */
    .report-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border-radius: 16px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.2s ease; cursor: default; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .stat-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.375rem; }
    .stat-icon.green { background: linear-gradient(135deg, #10B981, #059669); color: white; }
    .stat-icon.orange { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; }
    .stat-icon.red { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; }
    .stat-icon.blue { background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; }
    .stat-icon.purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: #1E293B; line-height: 1.2; }
    .stat-label { font-size: 0.8125rem; color: #64748B; margin-top: 0.125rem; }
    
    /* Chart Section */
    .chart-section { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .chart-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .chart-card.full { grid-column: 1 / -1; }
    .chart-card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: #1E293B; display: flex; align-items: center; gap: 0.5rem; }
    .chart-card h3 i { color: #3B82F6; font-size: 1.125rem; }
    
    /* Card Header */
    .hris-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .card-header-actions { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #E2E8F0; }
    .card-header-actions h3 { margin: 0; font-size: 1.0625rem; font-weight: 600; color: #1E293B; }
    .export-buttons { display: flex; gap: 0.5rem; }
    .export-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 600; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s; }
    .export-btn:hover { transform: translateY(-1px); }
    .export-btn.excel { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; }
    .export-btn.csv { background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; }
    
    /* Filter Inline */
    .filter-inline { display: flex; gap: 0.75rem; padding: 1rem 1.5rem; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; align-items: center; flex-wrap: wrap; }
    .filter-item { min-width: 160px; }
    .filter-item.search input { width: 220px; padding: 0.625rem 0.875rem; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 0.875rem; transition: border-color 0.2s; }
    .filter-item.search input:focus { outline: none; border-color: #3B82F6; }
    
    /* Table Styles */
    .employee-cell { display: flex; align-items: center; gap: 0.625rem; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.6875rem; }
    .nik-badge { font-family: 'SF Mono', Monaco, monospace; font-size: 0.8125rem; color: #475569; }
    .dept-badge { background: #DBEAFE; color: #1D4ED8; padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.6875rem; font-weight: 600; }
    .leave-badge { background: #D1FAE5; color: #059669; padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.6875rem; font-weight: 600; }
    .leave-badge.low { background: #FEF3C7; color: #D97706; }
    .badge-hours { background: #E0E7FF; color: #4338CA; padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.6875rem; font-weight: 600; }
    .badge-days { background: #FEF3C7; color: #D97706; padding: 0.25rem 0.625rem; border-radius: 6px; font-size: 0.6875rem; font-weight: 600; }
    .reason-cell { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748B; font-size: 0.8125rem; }
    .text-center { text-align: center; padding: 2rem; color: #94A3B8; }
    
    /* PrimeNG Overrides */
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th { padding: 0.75rem 1rem; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B; background: #F8FAFC; }
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td { padding: 0.625rem 1rem; font-size: 0.8125rem; }
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover { background: #F8FAFC; }
    :host ::ng-deep .p-paginator { padding: 0.75rem 1rem; background: #F8FAFC; font-size: 0.8125rem; border-top: 1px solid #E2E8F0; }
    :host ::ng-deep .p-select { min-width: 150px; }
    
    @media (max-width: 1200px) { .report-stats { grid-template-columns: repeat(2, 1fr); } .chart-section { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .report-stats { grid-template-columns: 1fr; } .filter-inline { flex-direction: column; align-items: stretch; } .filter-item { width: 100%; min-width: auto; } .filter-item.search input { width: 100%; } }
  `]
})
export class EmployeeReportsComponent implements OnInit {
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private dashboardService = inject(DashboardService);
  private departmentService = inject(DepartmentService);
  private attendanceService = inject(AttendanceService);
  private overtimeService = inject(OvertimeRequestService);
  private leaveService = inject(LeaveRequestService);
  private messageService = inject(MessageService);
  
  // Loading states
  loadingAttendance = false;
  loadingOvertime = false;
  loadingLeave = false;
  loadingEmployees = false;
  
  // Data
  departments: Department[] = [];
  departmentOptions: { label: string; value: string }[] = [];
  statusOptions = [
    { label: 'Menunggu', value: 'MENUNGGU_PERSETUJUAN' },
    { label: 'Disetujui', value: 'DISETUJUI' },
    { label: 'Ditolak', value: 'DITOLAK' }
  ];
  leaveTypeOptions = [
    { label: 'Cuti Tahunan', value: 'Cuti Tahunan' },
    { label: 'Cuti Sakit', value: 'Cuti Sakit' },
    { label: 'Cuti Melahirkan', value: 'Cuti Melahirkan' }
  ];
  
  // Attendance
  allAttendance: Attendance[] = [];
  filteredAttendance: Attendance[] = [];
  attendanceFilter = { department: '', startDate: null as Date | null, endDate: null as Date | null };
  attendanceStats = { hadir: 0, terlambat: 0, alpha: 0, percentage: 0 };
  attendanceChartData: any;
  
  // Overtime
  allOvertime: OvertimeRequest[] = [];
  filteredOvertime: OvertimeRequest[] = [];
  overtimeFilter = { department: '', status: '' };
  overtimeStats = { total: 0, disetujui: 0, menunggu: 0, totalJam: 0 };
  overtimeChartData: any;
  overtimeStatusChart: any;
  
  // Leave
  allLeave: LeaveRequest[] = [];
  filteredLeave: LeaveRequest[] = [];
  leaveFilter = { department: '', type: '', status: '' };
  leaveStats = { total: 0, disetujui: 0, menunggu: 0, ditolak: 0 };
  leaveTypeChart: any;
  leaveDeptChart: any;
  
  // Employees
  allEmployees: EmployeeResponse[] = [];
  filteredEmployees: EmployeeResponse[] = [];
  employeeFilter = { department: '', search: '' };
  employeeDeptChart: any;
  
  // Chart options
  barChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const, labels: { font: { size: 11 } } } } };
  pieChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' as const, labels: { font: { size: 11 } } } } };
  
  ngOnInit(): void {
    this.loadDepartments();
    this.loadAllData();
  }
  
  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (data: Department[]) => {
        this.departments = data;
        this.departmentOptions = data.map((d: Department) => ({ label: d.namaDepartment, value: d.id }));
      },
      error: (err: Error) => console.error('Error loading departments:', err)
    });
  }
  
  loadAllData(): void {
    this.loadAttendanceData();
    this.loadOvertimeData();
    this.loadLeaveData();
    this.loadEmployeeData();
  }
  
  onTabChange(event: any): void {
    // Data already loaded on init
  }
  
  // ===== ATTENDANCE =====
  loadAttendanceData(): void {
    this.loadingAttendance = true;
    this.attendanceService.getAll().subscribe({
      next: (data: Attendance[]) => {
        this.allAttendance = data;
        this.applyAttendanceFilter();
        this.calculateAttendanceStats();
        this.buildAttendanceChart();
        this.loadingAttendance = false;
      },
      error: (err: Error) => { console.error('Error:', err); this.loadingAttendance = false; }
    });
  }
  
  applyAttendanceFilter(): void {
    this.filteredAttendance = this.allAttendance.filter((a: Attendance) => {
      const matchDept = !this.attendanceFilter.department || a.karyawan?.departemen === this.attendanceFilter.department;
      return matchDept;
    });
  }
  
  calculateAttendanceStats(): void {
    const data = this.filteredAttendance;
    this.attendanceStats = {
      hadir: data.filter((a: Attendance) => a.status === 'HADIR').length,
      terlambat: data.filter((a: Attendance) => a.status === 'TERLAMBAT').length,
      alpha: data.filter((a: Attendance) => a.status === 'ALPHA').length,
      percentage: data.length ? Math.round((data.filter((a: Attendance) => a.status !== 'ALPHA').length / data.length) * 100) : 0
    };
  }
  
  buildAttendanceChart(): void {
    this.attendanceChartData = {
      labels: ['Hadir', 'Terlambat', 'Alpha'],
      datasets: [{ label: 'Jumlah', data: [this.attendanceStats.hadir, this.attendanceStats.terlambat, this.attendanceStats.alpha], backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'], borderRadius: 6 }]
    };
  }
  
  getAttendanceStatusSeverity(status: string): "success" | "warn" | "danger" | "info" | undefined {
    switch (status) { case 'HADIR': return 'success'; case 'TERLAMBAT': return 'warn'; case 'ALPHA': return 'danger'; default: return 'info'; }
  }
  
  exportAttendance(format: string): void {
    if (!this.filteredAttendance.length) { this.messageService.add({ severity: 'warn', summary: 'Perhatian', detail: 'Tidak ada data' }); return; }
    const headers = ['Tanggal', 'Karyawan', 'Check In', 'Check Out', 'Status', 'Terlambat (menit)'];
    const rows = this.filteredAttendance.map((a: Attendance) => [a.tanggal, a.karyawan?.nama || '-', a.jamMasuk || '-', a.jamKeluar || '-', a.status, a.keterlambatanMenit || 0]);
    this.downloadData(headers, rows, 'laporan_kehadiran', format);
  }
  
  // ===== OVERTIME =====
  loadOvertimeData(): void {
    this.loadingOvertime = true;
    this.overtimeService.getAll().subscribe({
      next: (data: OvertimeRequest[]) => {
        this.allOvertime = data;
        this.applyOvertimeFilter();
        this.calculateOvertimeStats();
        this.buildOvertimeCharts();
        this.loadingOvertime = false;
      },
      error: (err: Error) => { console.error('Error:', err); this.loadingOvertime = false; }
    });
  }
  
  applyOvertimeFilter(): void {
    this.filteredOvertime = this.allOvertime.filter((o: OvertimeRequest) => {
      const matchDept = !this.overtimeFilter.department || o.karyawan?.departemen?.id === this.overtimeFilter.department;
      const matchStatus = !this.overtimeFilter.status || o.status?.namaStatus === this.overtimeFilter.status;
      return matchDept && matchStatus;
    });
  }
  
  calculateOvertimeStats(): void {
    const data = this.filteredOvertime;
    this.overtimeStats = {
      total: data.length,
      disetujui: data.filter((o: OvertimeRequest) => o.status?.namaStatus === 'DISETUJUI' || o.status?.namaStatus === 'MENUNGGU_REIMBURSE' || o.status?.namaStatus === 'DIBAYAR').length,
      menunggu: data.filter((o: OvertimeRequest) => o.status?.namaStatus === 'MENUNGGU_PERSETUJUAN').length,
      totalJam: data.reduce((sum: number, o: OvertimeRequest) => sum + (o.durasi || 0), 0)
    };
  }
  
  buildOvertimeCharts(): void {
    // Group by department
    const deptMap = new Map<string, number>();
    this.filteredOvertime.forEach((o: OvertimeRequest) => {
      const dept = o.karyawan?.departemen?.namaDepartement || 'Lainnya';
      deptMap.set(dept, (deptMap.get(dept) || 0) + (o.durasi || 0));
    });
    this.overtimeChartData = {
      labels: Array.from(deptMap.keys()),
      datasets: [{ label: 'Jam Lembur', data: Array.from(deptMap.values()), backgroundColor: '#8B5CF6', borderRadius: 6 }]
    };
    
    this.overtimeStatusChart = {
      labels: ['Disetujui', 'Menunggu', 'Ditolak'],
      datasets: [{ data: [this.overtimeStats.disetujui, this.overtimeStats.menunggu, this.allOvertime.filter((o: OvertimeRequest) => o.status?.namaStatus === 'DITOLAK').length], backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'] }]
    };
  }
  
  getOvertimeStatusLabel(status?: string): string {
    switch (status) { case 'MENUNGGU_PERSETUJUAN': return 'Menunggu'; case 'MENUNGGU_REIMBURSE': return 'Perlu Reimburse'; case 'DIBAYAR': return 'Dibayar'; case 'DITOLAK': return 'Ditolak'; default: return status || '-'; }
  }
  
  getOvertimeStatusSeverity(status?: string): "success" | "warn" | "danger" | "info" | undefined {
    switch (status) { case 'DIBAYAR': case 'MENUNGGU_REIMBURSE': return 'success'; case 'MENUNGGU_PERSETUJUAN': return 'warn'; case 'DITOLAK': return 'danger'; default: return 'info'; }
  }
  
  exportOvertime(format: string): void {
    if (!this.filteredOvertime.length) { this.messageService.add({ severity: 'warn', summary: 'Perhatian', detail: 'Tidak ada data' }); return; }
    const headers = ['Karyawan', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Durasi', 'Biaya', 'Status'];
    const rows = this.filteredOvertime.map((o: OvertimeRequest) => [o.karyawan?.nama || '-', o.tglLembur, o.jamMulai, o.jamSelesai, o.durasi, o.estimasiBiaya, o.status?.namaStatus || '-']);
    this.downloadData(headers, rows, 'laporan_lembur', format);
  }
  
  // ===== LEAVE =====
  loadLeaveData(): void {
    this.loadingLeave = true;
    this.leaveService.getAll().subscribe({
      next: (data: LeaveRequest[]) => {
        this.allLeave = data;
        this.applyLeaveFilter();
        this.calculateLeaveStats();
        this.buildLeaveCharts();
        this.loadingLeave = false;
      },
      error: (err: Error) => { console.error('Error:', err); this.loadingLeave = false; }
    });
  }
  
  applyLeaveFilter(): void {
    this.filteredLeave = this.allLeave.filter((l: LeaveRequest) => {
      const matchDept = !this.leaveFilter.department || l.karyawan?.departemen?.id === this.leaveFilter.department;
      const matchType = !this.leaveFilter.type || l.jenisCuti?.namaJenis === this.leaveFilter.type;
      const matchStatus = !this.leaveFilter.status || l.status?.namaStatus === this.leaveFilter.status;
      return matchDept && matchType && matchStatus;
    });
  }
  
  calculateLeaveStats(): void {
    const data = this.filteredLeave;
    this.leaveStats = {
      total: data.length,
      disetujui: data.filter((l: LeaveRequest) => l.status?.namaStatus === 'DISETUJUI').length,
      menunggu: data.filter((l: LeaveRequest) => l.status?.namaStatus === 'MENUNGGU_PERSETUJUAN').length,
      ditolak: data.filter((l: LeaveRequest) => l.status?.namaStatus === 'DITOLAK').length
    };
  }
  
  buildLeaveCharts(): void {
    // Leave Type distribution
    const typeMap = new Map<string, number>();
    this.filteredLeave.forEach((l: LeaveRequest) => {
      const type = l.jenisCuti?.namaJenis || 'Lainnya';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    this.leaveTypeChart = {
      labels: Array.from(typeMap.keys()),
      datasets: [{ data: Array.from(typeMap.values()), backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'] }]
    };
    
    // Leave per Department
    const deptMap = new Map<string, number>();
    this.filteredLeave.forEach((l: LeaveRequest) => {
      const dept = l.karyawan?.departemen?.namaDepartement || 'Lainnya';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    this.leaveDeptChart = {
      labels: Array.from(deptMap.keys()),
      datasets: [{ label: 'Jumlah Cuti', data: Array.from(deptMap.values()), backgroundColor: '#3B82F6', borderRadius: 6 }]
    };
  }
  
  getLeaveStatusLabel(status?: string): string {
    switch (status) { case 'MENUNGGU_PERSETUJUAN': return 'Menunggu'; case 'DISETUJUI': return 'Disetujui'; case 'DITOLAK': return 'Ditolak'; default: return status || '-'; }
  }
  
  getLeaveStatusSeverity(status?: string): "success" | "warn" | "danger" | "info" | undefined {
    switch (status) { case 'DISETUJUI': return 'success'; case 'MENUNGGU_PERSETUJUAN': return 'warn'; case 'DITOLAK': return 'danger'; default: return 'info'; }
  }
  
  exportLeave(format: string): void {
    if (!this.filteredLeave.length) { this.messageService.add({ severity: 'warn', summary: 'Perhatian', detail: 'Tidak ada data' }); return; }
    const headers = ['Karyawan', 'Jenis Cuti', 'Tgl Mulai', 'Tgl Selesai', 'Durasi', 'Alasan', 'Status'];
    const rows = this.filteredLeave.map((l: LeaveRequest) => [l.karyawan?.nama || '-', l.jenisCuti?.namaJenis || '-', l.tglMulai, l.tglSelesai, l.jumlahHari, l.alasan || '-', l.status?.namaStatus || '-']);
    this.downloadData(headers, rows, 'laporan_cuti', format);
  }
  
  // ===== EMPLOYEES =====
  loadEmployeeData(): void {
    this.loadingEmployees = true;
    this.employeeService.getAll().subscribe({
      next: (data: EmployeeResponse[]) => {
        this.allEmployees = data;
        this.applyEmployeeFilter();
        this.buildEmployeeChart();
        this.loadingEmployees = false;
      },
      error: (err: Error) => { console.error('Error:', err); this.loadingEmployees = false; }
    });
  }
  
  applyEmployeeFilter(): void {
    this.filteredEmployees = this.allEmployees.filter((e: EmployeeResponse) => {
      const matchDept = !this.employeeFilter.department || e.departemen?.id === this.employeeFilter.department;
      const matchSearch = !this.employeeFilter.search || 
        e.nama?.toLowerCase().includes(this.employeeFilter.search.toLowerCase()) ||
        e.nik?.toLowerCase().includes(this.employeeFilter.search.toLowerCase());
      return matchDept && matchSearch;
    });
  }
  
  buildEmployeeChart(): void {
    const deptMap = new Map<string, number>();
    this.allEmployees.forEach((e: EmployeeResponse) => {
      const dept = e.departemen?.namaDepartment || 'Lainnya';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    this.employeeDeptChart = {
      labels: Array.from(deptMap.keys()),
      datasets: [{ data: Array.from(deptMap.values()), backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'] }]
    };
  }
  
  getTotalSisaCuti(): number { return this.allEmployees.reduce((sum: number, e: EmployeeResponse) => sum + (e.sisaCuti || 0), 0); }
  getAvgSisaCuti(): number { return this.allEmployees.length ? Math.round(this.getTotalSisaCuti() / this.allEmployees.length) : 0; }
  getInitials(name: string): string { return name ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '?'; }
  
  exportEmployees(format: string): void {
    if (!this.filteredEmployees.length) { this.messageService.add({ severity: 'warn', summary: 'Perhatian', detail: 'Tidak ada data' }); return; }
    const headers = ['Nama', 'NIK', 'Email', 'Departemen', 'Jabatan', 'Sisa Cuti'];
    const rows = this.filteredEmployees.map((e: EmployeeResponse) => [e.nama, e.nik, e.email, e.departemen?.namaDepartment || '-', e.jabatan?.namaJabatan || '-', e.sisaCuti]);
    this.downloadData(headers, rows, 'laporan_karyawan', format);
  }
  
  // ===== EXPORT HELPER =====
  private downloadData(headers: string[], rows: any[][], filename: string, format: string): void {
    const separator = format === 'excel' ? '\t' : ',';
    const content = [headers.join(separator), ...rows.map((r: any[]) => r.map((v: any) => format === 'csv' && typeof v === 'string' ? `"${v}"` : v).join(separator))].join('\n');
    const blob = new Blob([format === 'excel' ? '\ufeff' + content : content], { type: format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8' : 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format === 'excel' ? 'xls' : 'csv'}`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: `Data berhasil diekspor` });
  }
}
