import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { Attendance, CheckInRequest, CheckOutRequest } from '../../../core/models';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule,
    TableModule, 
    ButtonDirective, 
    Tag,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">Kehadiran</h1>
            <p class="page-subtitle">{{ isAdminOrHR ? 'Kelola kehadiran karyawan' : 'Riwayat kehadiran Anda' }}</p>
          </div>
          <div class="quick-actions">
            @if (!hasCheckedInToday()) {
              <button pButton label="Check In" icon="pi pi-sign-in" (click)="checkIn()" [loading]="checkingIn()"></button>
            } @else if (!hasCheckedOutToday()) {
              <button pButton label="Check Out" icon="pi pi-sign-out" severity="secondary" (click)="checkOut()" [loading]="checkingOut()"></button>
            } @else {
              <span class="checked-complete">
                <i class="pi pi-check-circle"></i>
                Sudah check-in & check-out hari ini
              </span>
            }
          </div>
        </div>

        <!-- Today's Status Card -->
        @if (todayAttendance()) {
          <div class="today-status-card hris-card mb-4">
            <div class="status-header">
              <h3>Status Hari Ini</h3>
              <p-tag [value]="getStatusLabel(todayAttendance()!.status)" [severity]="getStatusSeverity(todayAttendance()!.status)" />
            </div>
            <div class="status-content">
              <div class="status-item">
                <i class="pi pi-clock"></i>
                <div>
                  <span class="label">Jam Masuk</span>
                  <span class="value">{{ todayAttendance()!.jamMasuk || '-' }}</span>
                </div>
              </div>
              <div class="status-item">
                <i class="pi pi-clock"></i>
                <div>
                  <span class="label">Jam Keluar</span>
                  <span class="value">{{ todayAttendance()!.jamKeluar || '-' }}</span>
                </div>
              </div>
              @if (todayAttendance()!.keterlambatanMenit > 0) {
                <div class="status-item warning">
                  <i class="pi pi-exclamation-triangle"></i>
                  <div>
                    <span class="label">Keterlambatan</span>
                    <span class="value">{{ todayAttendance()!.keterlambatanMenit }} menit</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Filter Section -->
        @if (isAdminOrHR) {
          <div class="filter-section hris-card mb-4">
            <div class="filter-item">
              <label>Tanggal Mulai</label>
              <input type="date" [(ngModel)]="filterStartDate" (change)="onFilterChange()" class="form-input" />
            </div>
            <div class="filter-item">
              <label>Tanggal Akhir</label>
              <input type="date" [(ngModel)]="filterEndDate" (change)="onFilterChange()" class="form-input" />
            </div>
            <div class="filter-item">
              <label>Status</label>
              <select [(ngModel)]="filterStatus" (change)="onFilterChange()" class="form-input">
                <option value="">Semua Status</option>
                <option value="HADIR">Hadir</option>
                <option value="TERLAMBAT">Terlambat</option>
                <option value="IZIN">Izin</option>
                <option value="SAKIT">Sakit</option>
                <option value="ALPHA">Alpha</option>
              </select>
            </div>
          </div>
        }

        <div class="hris-card">
          @if (loading()) {
            <div class="loading-container">
              <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
              <p>Memuat data...</p>
            </div>
          } @else {
            <p-table
              [value]="attendances()"
              [paginator]="true"
              [rows]="10"
              [rowHover]="true"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
            >
              <ng-template pTemplate="header">
                <tr>
                  @if (isAdminOrHR) {
                    <th>Karyawan</th>
                  }
                  <th>Tanggal</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Status</th>
                  <th>Keterlambatan</th>
                  <th>Keterangan</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-attendance>
                <tr>
                  @if (isAdminOrHR) {
                    <td>
                      <div class="fw-semibold">{{ attendance.karyawan?.nama }}</div>
                      <div class="text-muted small">{{ attendance.karyawan?.departemen || '-' }}</div>
                    </td>
                  }
                  <td>{{ attendance.tanggal }}</td>
                  <td>{{ attendance.jamMasuk || '-' }}</td>
                  <td>{{ attendance.jamKeluar || '-' }}</td>
                  <td>
                    <p-tag [value]="getStatusLabel(attendance.status)" [severity]="getStatusSeverity(attendance.status)" />
                  </td>
                  <td>
                    @if (attendance.keterlambatanMenit > 0) {
                      <span class="text-warning">{{ attendance.keterlambatanMenit }} menit</span>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                  <td>{{ attendance.keterangan || '-' }}</td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td [attr.colspan]="isAdminOrHR ? 7 : 6" class="text-center p-4">
                    <div class="empty-state">
                      <i class="pi pi-calendar empty-icon"></i>
                      <h4 class="empty-title">Belum ada data kehadiran</h4>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </div>
    
        <p-toast />
      </div>
    </div>
  `,
  styles: [`
    .quick-actions { display: flex; gap: 0.5rem; align-items: center; }
    .checked-complete { 
      color: var(--hris-success); 
      display: flex; 
      align-items: center; 
      gap: 0.5rem;
      font-weight: 500;
    }
    .today-status-card {
      .status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--hris-gray-200);
        margin-bottom: 1rem;
        h3 { margin: 0; font-weight: 600; }
      }
      .status-content {
        display: flex;
        gap: 2rem;
        .status-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          i { 
            font-size: 1.5rem; 
            color: var(--hris-primary);
          }
          .label { 
            display: block; 
            font-size: 0.75rem; 
            color: var(--hris-gray-500); 
          }
          .value { 
            display: block; 
            font-size: 1.25rem; 
            font-weight: 600; 
          }
          &.warning i { color: var(--hris-warning); }
        }
      }
    }
    .filter-section {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      flex-wrap: wrap;
      .filter-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        label { font-size: 0.8125rem; font-weight: 500; color: var(--hris-gray-600); }
      }
    }
    .form-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--hris-gray-300);
      border-radius: var(--hris-border-radius);
      font-size: 0.875rem;
    }
    .mb-4 { margin-bottom: 1.5rem; }
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: var(--hris-gray-500); }
    .fw-semibold { font-weight: 600; }
    .small { font-size: 0.8125rem; }
    .text-muted { color: var(--hris-gray-500); }
    .text-warning { color: var(--hris-warning); font-weight: 500; }
    .empty-state { padding: 2rem; text-align: center; }
    .empty-icon { font-size: 3rem; color: var(--hris-gray-400); }
    .empty-title { margin-top: 1rem; color: var(--hris-gray-700); }
  `]
})
export class AttendanceListComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  attendances = signal<Attendance[]>([]);
  todayAttendance = signal<Attendance | null>(null);
  loading = signal<boolean>(true);
  checkingIn = signal<boolean>(false);
  checkingOut = signal<boolean>(false);

  // Filters
  filterStartDate = '';
  filterEndDate = '';
  filterStatus = '';

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  ngOnInit(): void {
    this.setDefaultFilters();
    this.loadAttendances();
    this.loadTodayAttendance();
  }

  setDefaultFilters(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.filterStartDate = firstDay.toISOString().split('T')[0];
    this.filterEndDate = today.toISOString().split('T')[0];
  }

  loadAttendances(): void {
    this.loading.set(true);
    
    const params: any = {};
    if (this.filterStartDate) params.startDate = this.filterStartDate;
    if (this.filterEndDate) params.endDate = this.filterEndDate;
    if (this.filterStatus) params.status = this.filterStatus;

    this.attendanceService.getAll(params).subscribe({
      next: (data) => {
        this.attendances.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading attendances:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat data kehadiran'
        });
      }
    });
  }

  loadTodayAttendance(): void {
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService.getByDate(today).subscribe({
      next: (data) => {
        // Find current user's attendance (simplified - should use user ID)
        if (data && data.length > 0) {
          this.todayAttendance.set(data[0]);
        }
      },
      error: (err) => {
        console.error('Error loading today attendance:', err);
      }
    });
  }

  onFilterChange(): void {
    this.loadAttendances();
  }

  hasCheckedInToday(): boolean {
    return this.todayAttendance() !== null && this.todayAttendance()!.jamMasuk !== null;
  }

  hasCheckedOutToday(): boolean {
    return this.todayAttendance() !== null && this.todayAttendance()!.jamKeluar !== null;
  }

  checkIn(): void {
    this.checkingIn.set(true);
    const request: CheckInRequest = {
      karyawanId: '' // TODO: Get from current user
    };
    
    this.attendanceService.checkIn(request).subscribe({
      next: (data) => {
        this.checkingIn.set(false);
        this.todayAttendance.set(data);
        this.messageService.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Check-in berhasil!'
        });
        this.loadAttendances();
      },
      error: (err) => {
        this.checkingIn.set(false);
        console.error('Error checking in:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Gagal melakukan check-in'
        });
      }
    });
  }

  checkOut(): void {
    this.checkingOut.set(true);
    const request: CheckOutRequest = {
      karyawanId: '' // TODO: Get from current user
    };
    
    this.attendanceService.checkOut(request).subscribe({
      next: (data) => {
        this.checkingOut.set(false);
        this.todayAttendance.set(data);
        this.messageService.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Check-out berhasil!'
        });
        this.loadAttendances();
      },
      error: (err) => {
        this.checkingOut.set(false);
        console.error('Error checking out:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Gagal melakukan check-out'
        });
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'HADIR': return 'success';
      case 'TERLAMBAT': return 'warn';
      case 'IZIN': return 'info';
      case 'SAKIT': return 'info';
      case 'ALPHA': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'HADIR': return 'Hadir';
      case 'TERLAMBAT': return 'Terlambat';
      case 'IZIN': return 'Izin';
      case 'SAKIT': return 'Sakit';
      case 'ALPHA': return 'Alpha';
      default: return status || '-';
    }
  }
}
