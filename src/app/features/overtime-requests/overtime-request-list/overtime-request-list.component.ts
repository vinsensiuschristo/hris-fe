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
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { OvertimeRequest } from '../../../core/models';

@Component({
  selector: 'app-overtime-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonDirective, InputText, Tag, Select, Tooltip, ProgressSpinner],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Lembur</h1>
        <p class="page-subtitle">Daftar pengajuan lembur {{ isAdminOrHR ? 'semua karyawan' : 'Anda' }}</p>
      </div>
      <a routerLink="new" pButton label="Ajukan Lembur Baru" icon="pi pi-plus"></a>
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
            <input type="text" pInputText placeholder="Cari..." [(ngModel)]="searchText" (input)="applyFilters()" />
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
              <th>Tanggal Lembur</th>
              <th>Waktu</th>
              <th style="width: 80px; text-align: center">Jam</th>
              <th style="width: 120px; text-align: right">Est. Biaya</th>
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
                <div class="date-cell">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatDate(request.tglLembur) }}</span>
                </div>
              </td>
              <td>
                <div class="time-range">
                  <span class="time-value">{{ request.jamMulai }}</span>
                  <i class="pi pi-arrow-right"></i>
                  <span class="time-value">{{ request.jamSelesai }}</span>
                </div>
              </td>
              <td class="text-center">
                <span class="hours-badge">{{ request.durasi }}</span>
              </td>
              <td style="text-align: right;">
                <span class="cost-value">{{ formatCurrency(request.estimasiBiaya) }}</span>
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
                  <i class="pi pi-clock empty-icon"></i>
                  <h4 class="empty-title">Belum ada pengajuan lembur</h4>
                  <p class="empty-description">Klik tombol "Ajukan Lembur Baru" untuk membuat pengajuan</p>
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

    .cost-value {
      font-weight: 600;
      color: #059669;
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
export class OvertimeRequestListComponent implements OnInit {
  private overtimeRequestService = inject(OvertimeRequestService);
  private authService = inject(AuthService);

  loading = signal<boolean>(true);
  overtimeRequests = signal<OvertimeRequest[]>([]);
  filteredRequests = signal<OvertimeRequest[]>([]);

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
      // Admin/HR sees all overtime requests
      this.overtimeRequestService.getAll().subscribe({
        next: (data) => {
          this.overtimeRequests.set(data);
          this.filteredRequests.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading overtime requests:', err);
          this.overtimeRequests.set([]);
          this.filteredRequests.set([]);
          this.loading.set(false);
        }
      });
    } else if (this.currentKaryawanId) {
      // Employee sees only their own requests
      this.overtimeRequestService.getByKaryawanId(this.currentKaryawanId).subscribe({
        next: (data) => {
          this.overtimeRequests.set(data);
          this.filteredRequests.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading overtime requests:', err);
          this.overtimeRequests.set([]);
          this.filteredRequests.set([]);
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }
  
  applyFilters(): void {
    const all = this.overtimeRequests();
    const filtered = all.filter(req => {
      const statusName = req.status?.namaStatus || '';
      const karyawanName = req.karyawan?.nama || '';
      const matchSearch = !this.searchText || 
        karyawanName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        this.formatDate(req.tglLembur).toLowerCase().includes(this.searchText.toLowerCase());
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

  formatCurrency(amount: number): string {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
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
