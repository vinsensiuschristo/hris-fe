import { Component, OnInit, inject } from '@angular/core';
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
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveRequest } from '../../../core/models';

@Component({
  selector: 'app-leave-approval',
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
        <h1 class="page-title">Persetujuan Cuti</h1>
        <p class="page-subtitle">Kelola pengajuan cuti karyawan</p>
      </div>
      
      <div class="header-stats">
        <div class="stat-badge pending">
          <i class="pi pi-clock"></i>
          <span>{{ getPendingCount() }} Menunggu</span>
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
            <label>Tipe Cuti</label>
            <p-select 
              [options]="leaveTypes" 
              [(ngModel)]="filters.leaveType"
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
            <label>Periode</label>
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
        [loading]="loading"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Karyawan</th>
            <th>Tipe Cuti</th>
            <th>Tanggal</th>
            <th style="width: 80px">Hari</th>
            <th>Alasan</th>
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
            <td>
              <p-tag [value]="request.jenisCuti?.namaJenis || '-'" severity="info" />
            </td>
            <td>
              <div class="date-range">
                <span>{{ request.tglMulai }}</span>
                <i class="pi pi-arrow-right"></i>
                <span>{{ request.tglSelesai }}</span>
              </div>
            </td>
            <td class="text-center">{{ request.jumlahHari }}</td>
            <td class="reason-cell">{{ request.alasan || '-' }}</td>
            <td>
              <p-tag [value]="getStatusLabel(request.status?.namaStatus)" [severity]="getStatusSeverity(request.status?.namaStatus)" />
            </td>
            <td>
              @if (request.status?.namaStatus === 'MENUNGGU_PERSETUJUAN') {
                <div class="action-buttons">
                  <button pButton icon="pi pi-check" severity="success" [rounded]="true" [text]="true" pTooltip="Setujui" (click)="approve(request)"></button>
                  <button pButton icon="pi pi-times" severity="danger" [rounded]="true" [text]="true" pTooltip="Tolak" (click)="openRejectDialog(request)"></button>
                  <a [routerLink]="['/approvals/leave', request.id]" pButton icon="pi pi-eye" severity="info" [rounded]="true" [text]="true" pTooltip="Detail"></a>
                </div>
              } @else {
                <a [routerLink]="['/approvals/leave', request.id]" pButton icon="pi pi-eye" severity="info" [rounded]="true" [text]="true" pTooltip="Lihat Detail"></a>
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-inbox empty-icon"></i>
                <p>Tidak ada pengajuan cuti</p>
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
    
    .date-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      
      i { font-size: 0.625rem; color: #94A3B8; }
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
  `]
})
export class LeaveApprovalComponent implements OnInit {
  private leaveService = inject(LeaveRequestService);
  private messageService = inject(MessageService);
  
  loading = false;
  
  filters = {
    search: '',
    leaveType: null as string | null,
    status: null as string | null,
    dateRange: null
  };
  
  rejectDialogVisible = false;
  rejectReason = '';
  selectedRequest: LeaveRequest | null = null;
  
  leaveTypes = [
    { name: 'Cuti Tahunan', value: 'Cuti Tahunan' },
    { name: 'Cuti Sakit', value: 'Cuti Sakit' },
    { name: 'Cuti Melahirkan', value: 'Cuti Melahirkan' },
    { name: 'Cuti Khusus', value: 'Cuti Khusus' },
  ];
  
  statuses = [
    { name: 'Menunggu', value: 'MENUNGGU_PERSETUJUAN' },
    { name: 'Disetujui', value: 'DISETUJUI' },
    { name: 'Ditolak', value: 'DITOLAK' },
  ];
  
  allRequests: LeaveRequest[] = [];
  filteredData: LeaveRequest[] = [];
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.loading = true;
    this.leaveService.getAll().subscribe({
      next: (data) => {
        this.allRequests = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading leave requests:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data pengajuan cuti' });
        this.loading = false;
      }
    });
  }
  
  getPendingCount(): number {
    return this.allRequests.filter(r => r.status?.namaStatus === 'MENUNGGU_PERSETUJUAN').length;
  }
  
  getStatusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'DISETUJUI': return 'success';
      case 'MENUNGGU_PERSETUJUAN': return 'warn';
      case 'DITOLAK': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'MENUNGGU_PERSETUJUAN': return 'Menunggu';
      case 'DISETUJUI': return 'Disetujui';
      case 'DITOLAK': return 'Ditolak';
      default: return status || '-';
    }
  }
  
  applyFilters(): void {
    this.filteredData = this.allRequests.filter(r => {
      const matchSearch = !this.filters.search || 
        r.karyawan?.nama?.toLowerCase().includes(this.filters.search.toLowerCase());
      const matchType = !this.filters.leaveType || 
        r.jenisCuti?.namaJenis === this.filters.leaveType;
      const matchStatus = !this.filters.status || r.status?.namaStatus === this.filters.status;
      return matchSearch && matchType && matchStatus;
    });
  }
  
  resetFilters(): void {
    this.filters = { search: '', leaveType: null, status: null, dateRange: null };
    this.applyFilters();
  }
  
  approve(request: LeaveRequest): void {
    this.leaveService.approve(request.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengajuan cuti disetujui' });
        this.loadData();
      },
      error: (err) => {
        console.error('Error approving:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal menyetujui pengajuan' });
      }
    });
  }
  
  openRejectDialog(request: LeaveRequest): void {
    this.selectedRequest = request;
    this.rejectReason = '';
    this.rejectDialogVisible = true;
  }
  
  reject(): void {
    if (!this.rejectReason.trim() || !this.selectedRequest) return;
    
    this.leaveService.reject(this.selectedRequest.id, this.rejectReason).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengajuan cuti ditolak' });
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
