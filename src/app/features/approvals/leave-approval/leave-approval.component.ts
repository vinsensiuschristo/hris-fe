import { Component } from '@angular/core';
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
    Textarea
  ],
  template: `
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
                <span class="employee-name">{{ request.employeeName }}</span>
                <span class="employee-dept">{{ request.department }}</span>
              </div>
            </td>
            <td>
              <p-tag [value]="request.leaveType" severity="info" />
            </td>
            <td>
              <div class="date-range">
                <span>{{ request.startDate }}</span>
                <i class="pi pi-arrow-right"></i>
                <span>{{ request.endDate }}</span>
              </div>
            </td>
            <td class="text-center">{{ request.totalDays }}</td>
            <td class="reason-cell">{{ request.reason }}</td>
            <td>
              <p-tag [value]="request.status" [severity]="getStatusSeverity(request.status)" />
            </td>
            <td>
              @if (request.status === 'Menunggu') {
                <div class="action-buttons">
                  <button pButton icon="pi pi-check" severity="success" [rounded]="true" [text]="true" pTooltip="Setujui" (click)="approve(request)"></button>
                  <button pButton icon="pi pi-times" severity="danger" [rounded]="true" [text]="true" pTooltip="Tolak" (click)="openRejectDialog(request)"></button>
                  <button pButton icon="pi pi-eye" severity="info" [rounded]="true" [text]="true" pTooltip="Detail"></button>
                </div>
              } @else {
                <button pButton icon="pi pi-eye" severity="info" [rounded]="true" [text]="true" pTooltip="Lihat Detail"></button>
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
export class LeaveApprovalComponent {
  filters = {
    search: '',
    leaveType: null,
    status: null,
    dateRange: null
  };
  
  rejectDialogVisible = false;
  rejectReason = '';
  selectedRequest: any = null;
  
  leaveTypes = [
    { name: 'Cuti Tahunan', value: 'Cuti Tahunan' },
    { name: 'Cuti Sakit', value: 'Cuti Sakit' },
    { name: 'Cuti Melahirkan', value: 'Cuti Melahirkan' },
    { name: 'Cuti Khusus', value: 'Cuti Khusus' },
  ];
  
  statuses = [
    { name: 'Menunggu', value: 'Menunggu' },
    { name: 'Disetujui', value: 'Disetujui' },
    { name: 'Ditolak', value: 'Ditolak' },
  ];
  
  pendingRequests = [
    { id: 1, employeeName: 'Ahmad Fauzi', department: 'IT', leaveType: 'Cuti Tahunan', startDate: '2024-01-20', endDate: '2024-01-22', totalDays: 3, reason: 'Liburan keluarga', status: 'Menunggu' },
    { id: 2, employeeName: 'Siti Rahayu', department: 'HR', leaveType: 'Cuti Sakit', startDate: '2024-01-18', endDate: '2024-01-19', totalDays: 2, reason: 'Pemulihan pasca operasi', status: 'Menunggu' },
    { id: 3, employeeName: 'Budi Santoso', department: 'Finance', leaveType: 'Cuti Tahunan', startDate: '2024-01-25', endDate: '2024-01-26', totalDays: 2, reason: 'Acara keluarga', status: 'Disetujui' },
    { id: 4, employeeName: 'Dewi Lestari', department: 'Marketing', leaveType: 'Cuti Khusus', startDate: '2024-01-15', endDate: '2024-01-15', totalDays: 1, reason: 'Pernikahan saudara', status: 'Ditolak' },
  ];
  
  filteredData = [...this.pendingRequests];
  
  getPendingCount(): number {
    return this.pendingRequests.filter(r => r.status === 'Menunggu').length;
  }
  
  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'Disetujui': return 'success';
      case 'Menunggu': return 'warn';
      case 'Ditolak': return 'danger';
      default: return 'info';
    }
  }
  
  applyFilters(): void {
    this.filteredData = this.pendingRequests.filter(r => {
      const matchSearch = !this.filters.search || 
        r.employeeName.toLowerCase().includes(this.filters.search.toLowerCase());
      const matchType = !this.filters.leaveType || r.leaveType === this.filters.leaveType;
      const matchStatus = !this.filters.status || r.status === this.filters.status;
      return matchSearch && matchType && matchStatus;
    });
  }
  
  resetFilters(): void {
    this.filters = { search: '', leaveType: null, status: null, dateRange: null };
    this.filteredData = [...this.pendingRequests];
  }
  
  approve(request: any): void {
    request.status = 'Disetujui';
    this.filteredData = [...this.filteredData];
  }
  
  openRejectDialog(request: any): void {
    this.selectedRequest = request;
    this.rejectReason = '';
    this.rejectDialogVisible = true;
  }
  
  reject(): void {
    if (!this.rejectReason || !this.selectedRequest) return;
    this.selectedRequest.status = 'Ditolak';
    this.filteredData = [...this.filteredData];
    this.rejectDialogVisible = false;
  }
}
