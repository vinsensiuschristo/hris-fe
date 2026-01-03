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
  selector: 'app-overtime-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonDirective, InputText, Tag, Select, Tooltip],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Lembur</h1>
        <p class="page-subtitle">Daftar pengajuan lembur Anda</p>
      </div>
      <a routerLink="new" pButton label="Ajukan Lembur Baru" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      <!-- Filter Section -->
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari berdasarkan tanggal..." [(ngModel)]="searchText" (input)="applyFilters()" />
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
            <th>Tanggal Lembur</th>
            <th>Waktu</th>
            <th style="width: 80px; text-align: center">Jam</th>
            <th>Alasan</th>
            <th style="width: 120px">Status</th>
            <th style="width: 80px">Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-request>
          <tr>
            <td>
              <div class="date-cell">
                <i class="pi pi-calendar"></i>
                <span>{{ request.date }}</span>
              </div>
            </td>
            <td>
              <div class="time-range">
                <span class="time-value">{{ request.startTime }}</span>
                <i class="pi pi-arrow-right"></i>
                <span class="time-value">{{ request.endTime }}</span>
              </div>
            </td>
            <td class="text-center">
              <span class="hours-badge">{{ request.totalHours }}</span>
            </td>
            <td>
              <span class="reason-text" [pTooltip]="request.reason">{{ request.reason | slice:0:40 }}{{ request.reason.length > 40 ? '...' : '' }}</span>
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
                <i class="pi pi-clock empty-icon"></i>
                <h4 class="empty-title">Belum ada pengajuan lembur</h4>
                <p class="empty-description">Klik tombol "Ajukan Lembur Baru" untuk membuat pengajuan</p>
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
    
    .date-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #475569;
      
      i {
        color: #8B5CF6;
        font-size: 0.875rem;
      }
    }
    
    .time-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .time-value {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        color: #1E293B;
        background: #F1F5F9;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }
      
      i {
        font-size: 0.625rem;
        color: #94A3B8;
      }
    }
    
    .hours-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #8B5CF6, #7C3AED);
      color: white;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
    }
    
    .reason-text {
      font-size: 0.875rem;
      color: #64748B;
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
export class OvertimeRequestListComponent {
  searchText = '';
  selectedStatus: string | null = null;
  
  statusOptions = [
    { label: 'Menunggu', value: 'Menunggu' },
    { label: 'Disetujui', value: 'Disetujui' },
    { label: 'Ditolak', value: 'Ditolak' }
  ];
  
  overtimeRequests = [
    { id: 1, date: '15 Jan 2024', startTime: '18:00', endTime: '21:00', totalHours: 3, reason: 'Deadline proyek sistem inventory', status: 'Menunggu' },
    { id: 2, date: '12 Jan 2024', startTime: '17:00', endTime: '20:00', totalHours: 3, reason: 'Persiapan presentasi klien', status: 'Disetujui' },
    { id: 3, date: '10 Jan 2024', startTime: '18:00', endTime: '22:00', totalHours: 4, reason: 'Perbaikan bug sistem keuangan', status: 'Disetujui' },
    { id: 4, date: '5 Jan 2024', startTime: '19:00', endTime: '21:00', totalHours: 2, reason: 'Meeting dengan tim development', status: 'Ditolak' },
  ];
  
  filteredRequests = [...this.overtimeRequests];
  
  applyFilters(): void {
    this.filteredRequests = this.overtimeRequests.filter(req => {
      const matchSearch = !this.searchText || 
        req.date.toLowerCase().includes(this.searchText.toLowerCase()) ||
        req.reason.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = !this.selectedStatus || req.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
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
