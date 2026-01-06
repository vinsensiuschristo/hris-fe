import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { OvertimeRequest } from '../../../core/models';

@Component({
  selector: 'app-overtime-approval',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule, 
    TableModule, 
    ButtonDirective, 
    Tag, 
    Tooltip,
    InputText,
    Select,
    DatePicker,
    Dialog,
    Textarea,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">Persetujuan Lembur</h1>
        <p class="page-subtitle">Kelola pengajuan lembur karyawan</p>
      </div>
      
      <div class="header-stats">
        <div class="stat-badge pending">
          <i class="pi pi-clock"></i>
          <span>{{ getPendingCount() }} Menunggu</span>
        </div>
        <div class="stat-badge hours">
          <i class="pi pi-hourglass"></i>
          <span>{{ getTotalPendingHours() }} Jam</span>
        </div>
      </div>
    </div>
    
    <div class="hris-card">
      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <label>Cari Karyawan</label>
            <div class="search-input">
              <i class="pi pi-search"></i>
              <input type="text" pInputText placeholder="Nama atau NIK..." [(ngModel)]="filters.search" />
            </div>
          </div>
          
          <div class="filter-item">
            <label>Departemen</label>
            <p-select 
              [options]="departments" 
              [(ngModel)]="filters.department"
              optionLabel="name"
              optionValue="value"
              placeholder="Semua"
              [showClear]="true"
              [style]="{'width': '100%'}"
            />
          </div>
          
          <div class="filter-item">
            <label>Status</label>
            <p-select 
              [options]="statuses" 
              [(ngModel)]="filters.status"
              optionLabel="name"
              optionValue="value"
              placeholder="Semua"
              [showClear]="true"
              [style]="{'width': '100%'}"
            />
          </div>
          
          <div class="filter-item">
            <label>Tanggal</label>
            <p-datepicker 
              [(ngModel)]="filters.dateRange"
              selectionMode="range"
              dateFormat="dd/mm/yy"
              placeholder="Pilih periode"
              [showIcon]="true"
              appendTo="body"
              [style]="{'width': '100%'}"
            />
          </div>
          
          <div class="filter-actions">
            <button pButton label="Reset" icon="pi pi-refresh" [outlined]="true" (click)="resetFilters()"></button>
            <button pButton label="Terapkan" icon="pi pi-filter" (click)="applyFilters()"></button>
          </div>
        </div>
      </div>
      
      <!-- Table -->
      <p-table 
        [value]="filteredData" 
        [paginator]="true" 
        [rows]="10"
        [rowsPerPageOptions]="[10, 20, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords}"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Karyawan</th>
            <th>Tanggal</th>
            <th>Waktu</th>
            <th style="width: 80px">Jam</th>
            <th>Biaya</th>
            <th style="width: 100px">Status</th>
            <th style="width: 140px">Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-request>
          <tr>
            <td>
              <div class="employee-info">
                <span class="employee-name">{{ request.karyawan?.nama || '-' }}</span>
                <span class="employee-dept">{{ request.karyawan?.departemen?.namaDepartement || '-' }}</span>
              </div>
            </td>
            <td>{{ request.tglLembur }}</td>
            <td>
              <div class="time-range">
                <span class="time-badge">{{ request.jamMulai }}</span>
                <i class="pi pi-arrow-right"></i>
                <span class="time-badge">{{ request.jamSelesai }}</span>
              </div>
            </td>
            <td class="text-center">
              <span class="hours-badge">{{ request.durasi }}h</span>
            </td>
            <td class="reason-cell">Rp {{ request.estimasiBiaya | number:'1.0-0' }}</td>
            <td>
              <p-tag [value]="getStatusLabel(request.status?.namaStatus)" [severity]="getStatusSeverity(request.status?.namaStatus)" />
            </td>
            <td>
              @if (request.status?.namaStatus === 'MENUNGGU_PERSETUJUAN') {
                <div class="action-buttons">
                  <button pButton icon="pi pi-check" severity="success" [rounded]="true" [text]="true" pTooltip="Setujui" (click)="approve(request)"></button>
                  <button pButton icon="pi pi-times" severity="danger" [rounded]="true" [text]="true" pTooltip="Tolak" (click)="openRejectDialog(request)"></button>
                  <a [routerLink]="['/approvals/overtime', request.id]" pButton icon="pi pi-eye" severity="info" [rounded]="true" [text]="true" pTooltip="Detail"></a>
                </div>
              } @else if (request.status?.namaStatus === 'MENUNGGU_REIMBURSE') {
                <div class="action-buttons">
                  <button pButton icon="pi pi-wallet" severity="success" [rounded]="true" [text]="true" pTooltip="Reimburse" (click)="reimburse(request)"></button>
                  <a [routerLink]="['/approvals/overtime', request.id]" pButton icon="pi pi-eye" severity="info" [rounded]="true" [text]="true" pTooltip="Detail"></a>
                </div>
              } @else {
                <a [routerLink]="['/approvals/overtime', request.id]" pButton icon="pi pi-eye" severity="info" [rounded]="true" [text]="true" pTooltip="Lihat Detail"></a>
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-inbox empty-icon"></i>
                <p>Tidak ada pengajuan lembur</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    
    <!-- Reject Dialog -->
    <p-dialog [(visible)]="rejectDialogVisible" header="Tolak Pengajuan" [modal]="true" [style]="{width: '400px'}">
      <div class="form-group">
        <label>Alasan Penolakan <span class="required">*</span></label>
        <textarea pTextarea [(ngModel)]="rejectReason" rows="3" placeholder="Masukkan alasan penolakan" class="w-full"></textarea>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="rejectDialogVisible = false"></button>
        <button pButton label="Tolak" severity="danger" icon="pi pi-times" (click)="reject()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .header-stats {
      display: flex;
      gap: 0.75rem;
    }
    
    .stat-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      
      &.pending {
        background: #FEF3C7;
        color: #D97706;
      }
      
      &.hours {
        background: #DBEAFE;
        color: #2563EB;
      }
    }
    
    .filter-section {
      padding: 1rem 1.25rem;
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      overflow: visible;
    }
    
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
    }
    
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      flex: 0 0 auto;
      width: 180px;
      
      label {
        font-size: 0.75rem;
        font-weight: 500;
        color: #64748B;
      }
    }
    
    .search-input {
      position: relative;
      
      i {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        font-size: 0.875rem;
      }
      
      input {
        width: 100%;
        padding-left: 2.25rem;
      }
    }
    
    .filter-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .employee-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    
    .employee-name { font-weight: 500; color: #1E293B; }
    .employee-dept { font-size: 0.75rem; color: #64748B; }
    
    .time-range {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      
      i { font-size: 0.625rem; color: #94A3B8; }
    }
    
    .time-badge {
      background: #F1F5F9;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8125rem;
      font-family: monospace;
    }
    
    .hours-badge {
      background: linear-gradient(135deg, #3B82F6, #2563EB);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .text-center { text-align: center; }
    
    .reason-cell {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #64748B;
      font-size: 0.875rem;
    }
    
    .action-buttons { display: flex; gap: 0.25rem; }
    
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #94A3B8;
      
      .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    }
    
    .w-full { width: 100%; }
    
    .loading-container { display: flex; align-items: center; justify-content: center; padding: 3rem; color: #64748B; }
  `]
})
export class OvertimeApprovalComponent implements OnInit {
  private overtimeService = inject(OvertimeRequestService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  
  loading = false;
  
  filters = {
    search: '',
    department: null as string | null,
    status: null as string | null,
    dateRange: null
  };
  
  rejectDialogVisible = false;
  rejectReason = '';
  selectedRequest: OvertimeRequest | null = null;
  
  departments = [
    { name: 'IT', value: 'IT' },
    { name: 'HR', value: 'HR' },
    { name: 'Finance', value: 'Finance' },
    { name: 'Marketing', value: 'Marketing' },
  ];
  
  statuses = [
    { name: 'Menunggu', value: 'MENUNGGU_PERSETUJUAN' },
    { name: 'Menunggu Reimburse', value: 'MENUNGGU_REIMBURSE' },
    { name: 'Dibayar', value: 'DIBAYAR' },
    { name: 'Ditolak', value: 'DITOLAK' },
  ];
  
  allRequests: OvertimeRequest[] = [];
  filteredData: OvertimeRequest[] = [];
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.loading = true;
    this.overtimeService.getAll().subscribe({
      next: (data) => {
        this.allRequests = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading overtime requests:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data pengajuan lembur' });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  getPendingCount(): number {
    return this.allRequests.filter(r => r.status?.namaStatus === 'MENUNGGU_PERSETUJUAN').length;
  }
  
  getTotalPendingHours(): number {
    return this.allRequests
      .filter(r => r.status?.namaStatus === 'MENUNGGU_PERSETUJUAN')
      .reduce((sum, r) => sum + (r.durasi || 0), 0);
  }
  
  getStatusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'DIBAYAR': return 'success';
      case 'MENUNGGU_REIMBURSE': return 'info';
      case 'MENUNGGU_PERSETUJUAN': return 'warn';
      case 'DITOLAK': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'MENUNGGU_PERSETUJUAN': return 'Menunggu';
      case 'MENUNGGU_REIMBURSE': return 'Perlu Reimburse';
      case 'DIBAYAR': return 'Dibayar';
      case 'DITOLAK': return 'Ditolak';
      default: return status || '-';
    }
  }
  
  applyFilters(): void {
    this.filteredData = this.allRequests.filter(r => {
      const matchSearch = !this.filters.search || 
        r.karyawan?.nama?.toLowerCase().includes(this.filters.search.toLowerCase());
      const matchDept = !this.filters.department || 
        r.karyawan?.departemen?.namaDepartement === this.filters.department;
      const matchStatus = !this.filters.status || r.status?.namaStatus === this.filters.status;
      return matchSearch && matchDept && matchStatus;
    });
  }
  
  resetFilters(): void {
    this.filters = { search: '', department: null, status: null, dateRange: null };
    this.applyFilters();
  }
  
  approve(request: OvertimeRequest): void {
    this.overtimeService.approve(request.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengajuan lembur disetujui' });
        this.loadData();
      },
      error: (err) => {
        console.error('Error approving:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal menyetujui pengajuan' });
      }
    });
  }

  reimburse(request: OvertimeRequest): void {
    this.overtimeService.reimburse(request.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Pembayaran lembur berhasil dicatat' });
        this.loadData();
      },
      error: (err) => {
        console.error('Error reimbursing:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal memproses pembayaran' });
      }
    });
  }
  
  openRejectDialog(request: OvertimeRequest): void {
    this.selectedRequest = request;
    this.rejectReason = '';
    this.rejectDialogVisible = true;
  }
  
  reject(): void {
    if (!this.rejectReason.trim() || !this.selectedRequest) return;
    
    this.overtimeService.reject(this.selectedRequest.id, this.rejectReason).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengajuan lembur ditolak' });
        this.rejectDialogVisible = false;
        this.loadData();
      },
      error: (err) => {
        console.error('Error rejecting:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal menolak pengajuan' });
      }
    });
  }
}

