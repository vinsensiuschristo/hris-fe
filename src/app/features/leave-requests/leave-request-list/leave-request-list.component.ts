import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-leave-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonDirective, InputText, Tag, Select, Tooltip],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Cuti</h1>
        <p class="page-subtitle">Daftar pengajuan cuti Anda</p>
      </div>
      <a routerLink="new" pButton label="Ajukan Cuti Baru" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
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
          <span class="data-count">Total: {{ filteredRequests.length }} pengajuan</span>
        </div>
      </div>
      
      <p-table 
        [value]="filteredRequests" 
        [paginator]="true" 
        [rows]="10" 
        [rowsPerPageOptions]="[10, 20, 50]" 
        [showCurrentPageReport]="true" 
        currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords}"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
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
            <td>
              <span class="date-created">{{ request.createdAt }}</span>
            </td>
            <td>
              <span class="leave-type-badge" [class]="getTypeClass(request.leaveType)">
                {{ request.leaveType }}
              </span>
            </td>
            <td>
              <div class="date-range">
                <span>{{ request.startDate }}</span>
                <i class="pi pi-arrow-right"></i>
                <span>{{ request.endDate }}</span>
              </div>
            </td>
            <td class="text-center">
              <span class="days-badge">{{ request.totalDays }}</span>
            </td>
            <td>
              <p-tag [value]="request.status" [severity]="getStatusSeverity(request.status)" />
            </td>
            <td>
              <a [routerLink]="[request.id]" pButton icon="pi pi-eye" [text]="true" [rounded]="true" severity="info" pTooltip="Lihat Detail"></a>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-calendar empty-icon"></i>
                <h4 class="empty-title">Belum ada pengajuan cuti</h4>
                <p class="empty-description">Klik tombol "Ajukan Cuti Baru" untuk membuat pengajuan</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
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
export class LeaveRequestListComponent {
  searchText = '';
  selectedStatus: string | null = null;
  
  statusOptions = [
    { label: 'Menunggu', value: 'Menunggu' },
    { label: 'Disetujui', value: 'Disetujui' },
    { label: 'Ditolak', value: 'Ditolak' }
  ];
  
  leaveRequests = [
    { id: 1, createdAt: '15 Jan 2024', leaveType: 'Cuti Tahunan', startDate: '20 Jan 2024', endDate: '22 Jan 2024', totalDays: 3, status: 'Menunggu' },
    { id: 2, createdAt: '10 Jan 2024', leaveType: 'Cuti Sakit', startDate: '11 Jan 2024', endDate: '12 Jan 2024', totalDays: 2, status: 'Disetujui' },
    { id: 3, createdAt: '5 Jan 2024', leaveType: 'Cuti Tahunan', startDate: '8 Jan 2024', endDate: '8 Jan 2024', totalDays: 1, status: 'Ditolak' },
    { id: 4, createdAt: '2 Jan 2024', leaveType: 'Cuti Khusus', startDate: '5 Jan 2024', endDate: '6 Jan 2024', totalDays: 2, status: 'Disetujui' },
  ];
  
  filteredRequests = [...this.leaveRequests];
  
  applyFilters(): void {
    this.filteredRequests = this.leaveRequests.filter(req => {
      const matchSearch = !this.searchText || 
        req.leaveType.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = !this.selectedStatus || req.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }
  
  getTypeClass(type: string): string {
    if (type.includes('Tahunan')) return 'annual';
    if (type.includes('Sakit')) return 'sick';
    if (type.includes('Khusus')) return 'special';
    return 'default';
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'Disetujui': return 'success';
      case 'Menunggu': return 'warn';
      case 'Ditolak': return 'danger';
      default: return 'info';
    }
  }
}
