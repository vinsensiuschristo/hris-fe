import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveRequest } from '../../../core/models';

@Component({
  selector: 'app-leave-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonDirective, InputText, Tag, Select, Tooltip, ProgressSpinner],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Cuti</h1>
        <p class="page-subtitle">Daftar pengajuan cuti {{ isAdminOrHR ? 'semua karyawan' : 'Anda' }}</p>
      </div>
      <a routerLink="new" pButton label="Ajukan Cuti Baru" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      @if (loading()) {
        <div style="text-align: center; padding: 3rem;">
          <p-progressSpinner strokeWidth="4" />
          <p style="margin-top: 1rem; color: var(--hris-gray-500);">Memuat data...</p>
        </div>
      } @else {
        <!-- Filter Section -->
        <div class="table-header">
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input type="text" pInputText placeholder="Cari tipe cuti..." [(ngModel)]="searchText" (input)="applyFilters()" />
          </div>
          <div class="filter-group">
            <p-select 
              [options]="statusOptions" 
              [(ngModel)]="selectedStatus"
              optionLabel="label"
              optionValue="value"
              placeholder="Semua Status"
              [showClear]="true"
              (onChange)="applyFilters()"
              [style]="{'width': '160px'}"
            />
            <span class="data-count">Total: {{ filteredRequests().length }} pengajuan</span>
          </div>
        </div>
        
        <p-table 
          [value]="filteredRequests()" 
          [paginator]="true" 
          [rows]="10" 
          [rowsPerPageOptions]="[10, 20, 50]" 
          [showCurrentPageReport]="true" 
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords}"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              @if (isAdminOrHR) {
                <th>Karyawan</th>
              }
              <th>Tanggal Pengajuan</th>
              <th>Tipe Cuti</th>
              <th>Periode</th>
              <th style="width: 80px; text-align: center">Hari</th>
              <th style="width: 120px">Status</th>
              <th style="width: 80px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-request>
            <tr>
              @if (isAdminOrHR) {
                <td>{{ request.karyawan?.nama || '-' }}</td>
              }
              <td>
                <span class="date-created">{{ formatDate(request.createdAt) }}</span>
              </td>
              <td>
                <span class="leave-type-badge" [class]="getTypeClass(request.jenisCuti?.namaJenis || '')">
                  {{ request.jenisCuti?.namaJenis || '-' }}
                </span>
              </td>
              <td>
                <div class="date-range">
                  <span>{{ formatDate(request.tglMulai) }}</span>
                  <i class="pi pi-arrow-right"></i>
                  <span>{{ formatDate(request.tglSelesai) }}</span>
                </div>
              </td>
              <td class="text-center">
                <span class="days-badge">{{ calculateDays(request.tglMulai, request.tglSelesai) }}</span>
              </td>
              <td>
                <p-tag [value]="getStatusLabel(request.status?.namaStatus)" [severity]="getStatusSeverity(request.status?.namaStatus)" />
              </td>
              <td>
                <a [routerLink]="[request.id]" pButton icon="pi pi-eye" [text]="true" [rounded]="true" severity="info" pTooltip="Lihat Detail"></a>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="isAdminOrHR ? 7 : 6" class="text-center p-4">
                <div class="empty-state">
                  <i class="pi pi-calendar empty-icon"></i>
                  <h4 class="empty-title">Belum ada pengajuan cuti</h4>
                  <p class="empty-description">Klik tombol "Ajukan Cuti Baru" untuk membuat pengajuan</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
  `,
  styles: [`
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #E2E8F0;
      background: #FAFAFA;
    }
    
    .filter-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .data-count {
      font-size: 0.875rem;
      color: #64748B;
    }
    
    .search-box {
      position: relative;
      width: 280px;
      
      i {
        position: absolute;
        left: 0.875rem;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
      }
      
      input {
        width: 100%;
        padding-left: 2.5rem;
      }
    }
    
    .leave-type-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 500;
      
      &.annual {
        background: #DBEAFE;
        color: #1D4ED8;
      }
      
      &.sick {
        background: #FEE2E2;
        color: #DC2626;
      }
      
      &.special {
        background: #F3E8FF;
        color: #7C3AED;
      }
      
      &.default {
        background: #F1F5F9;
        color: #64748B;
      }
    }
    
    .date-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #475569;
      
      i {
        font-size: 0.625rem;
        color: #94A3B8;
      }
    }
    
    .days-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3B82F6, #2563EB);
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .empty-state {
      padding: 2rem;
      text-align: center;
      
      .empty-icon {
        font-size: 3rem;
        color: #94A3B8;
        margin-bottom: 1rem;
      }
      
      .empty-title {
        font-size: 1rem;
        color: #475569;
        margin-bottom: 0.25rem;
      }
      
      .empty-description {
        font-size: 0.875rem;
        color: #94A3B8;
      }
    }
  `]
})
export class LeaveRequestListComponent implements OnInit {
  private leaveRequestService = inject(LeaveRequestService);
  private authService = inject(AuthService);

  loading = signal<boolean>(true);
  leaveRequests = signal<LeaveRequest[]>([]);
  filteredRequests = signal<LeaveRequest[]>([]);

  searchText = '';
  selectedStatus: string | null = null;
  
  statusOptions = [
    { label: 'Menunggu', value: 'MENUNGGU_PERSETUJUAN' },
    { label: 'Disetujui', value: 'DISETUJUI' },
    { label: 'Ditolak', value: 'DITOLAK' }
  ];

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  get currentKaryawanId(): string | null {
    return this.authService.currentUser?.employee?.id || null;
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    
    if (this.isAdminOrHR) {
      // Admin/HR sees all leave requests
      this.leaveRequestService.getAll().subscribe({
        next: (data) => {
          this.leaveRequests.set(data);
          this.filteredRequests.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading leave requests:', err);
          this.leaveRequests.set([]);
          this.filteredRequests.set([]);
          this.loading.set(false);
        }
      });
    } else if (this.currentKaryawanId) {
      // Employee sees only their own requests
      this.leaveRequestService.getByKaryawanId(this.currentKaryawanId).subscribe({
        next: (data) => {
          this.leaveRequests.set(data);
          this.filteredRequests.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading leave requests:', err);
          this.leaveRequests.set([]);
          this.filteredRequests.set([]);
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }
  
  applyFilters(): void {
    const all = this.leaveRequests();
    const filtered = all.filter(req => {
      const typeName = req.jenisCuti?.namaJenis || '';
      const statusName = req.status?.namaStatus || '';
      const matchSearch = !this.searchText || 
        typeName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = !this.selectedStatus || statusName === this.selectedStatus;
      return matchSearch && matchStatus;
    });
    this.filteredRequests.set(filtered);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  calculateDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  getTypeClass(type: string): string {
    if (type.includes('Tahunan')) return 'annual';
    if (type.includes('Sakit')) return 'sick';
    if (type.includes('Khusus')) return 'special';
    return 'default';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'MENUNGGU_PERSETUJUAN': return 'Menunggu';
      case 'DISETUJUI': return 'Disetujui';
      case 'DITOLAK': return 'Ditolak';
      default: return status || '-';
    }
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'DISETUJUI': return 'success';
      case 'MENUNGGU_PERSETUJUAN': return 'warn';
      case 'DITOLAK': return 'danger';
      default: return 'info';
    }
  }
}
