<div class="page-container"><div class="page-content">import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
<<<<<<< HEAD
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { OvertimeRequest } from '../../../core/models';
=======
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)

@Component({
  selector: 'app-overtime-approval',
  standalone: true,
  imports: [
    CommonModule, 
<<<<<<< HEAD
    RouterModule, 
    TableModule, 
    ButtonDirective,
    Tag,
    Tooltip,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
=======
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
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
  template: `
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
<<<<<<< HEAD
      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Memuat data...</p>
        </div>
      } @else {
        <p-table [value]="pendingRequests()" [paginator]="true" [rows]="10" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Nama Karyawan</th>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Durasi</th>
              <th>Estimasi Biaya</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-request>
            <tr>
              <td>
                <div class="fw-semibold">{{ request.karyawan?.nama }}</div>
                <div class="text-muted small">{{ request.karyawan?.nik }}</div>
              </td>
              <td>{{ request.tglLembur }}</td>
              <td>{{ request.jamMulai }} - {{ request.jamSelesai }}</td>
              <td>{{ request.durasi }} jam</td>
              <td>
                <span class="text-primary fw-semibold">{{ formatCurrency(request.estimasiBiaya) }}</span>
              </td>
              <td>
                <button 
                  pButton 
                  icon="pi pi-check" 
                  severity="success" 
                  [rounded]="true" 
                  [text]="true" 
                  pTooltip="Setujui"
                  (click)="approveRequest(request)"
                ></button>
                <button 
                  pButton 
                  icon="pi pi-times" 
                  severity="danger" 
                  [rounded]="true" 
                  [text]="true" 
                  pTooltip="Tolak"
                  (click)="rejectRequest(request)"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center p-4">
                <i class="pi pi-check-circle" style="font-size: 2rem; color: var(--hris-success)"></i>
                <p class="mt-2">Tidak ada pengajuan lembur yang pending</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>

    <p-toast />
    <p-confirmDialog />
  `,
  styles: [`
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: var(--hris-gray-500); }
    .fw-semibold { font-weight: 600; }
    .small { font-size: 0.8125rem; }
    .text-muted { color: var(--hris-gray-500); }
    .text-primary { color: var(--hris-primary); }
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class OvertimeApprovalComponent implements OnInit {
  private overtimeRequestService = inject(OvertimeRequestService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  pendingRequests = signal<OvertimeRequest[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.loading.set(true);
    this.overtimeRequestService.getPending().subscribe({
      next: (data) => {
        this.pendingRequests.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pending requests:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat data pengajuan'
        });
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  }

  approveRequest(request: OvertimeRequest): void {
    this.confirmationService.confirm({
      message: `Setujui lembur "${request.karyawan?.nama}" (${request.durasi} jam, ${this.formatCurrency(request.estimasiBiaya)})?`,
      header: 'Konfirmasi Persetujuan',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Ya, Setujui',
      rejectLabel: 'Batal',
      accept: () => {
        this.overtimeRequestService.approve(request.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Berhasil',
              detail: 'Pengajuan lembur disetujui'
            });
            this.loadPendingRequests();
          },
          error: (err) => {
            console.error('Error approving:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Gagal menyetujui pengajuan'
            });
          }
        });
      }
    });
  }

  rejectRequest(request: OvertimeRequest): void {
    this.confirmationService.confirm({
      message: `Tolak pengajuan lembur dari "${request.karyawan?.nama}"?`,
      header: 'Konfirmasi Penolakan',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Ya, Tolak',
      rejectLabel: 'Batal',
      accept: () => {
        this.overtimeRequestService.reject(request.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Berhasil',
              detail: 'Pengajuan lembur ditolak'
            });
            this.loadPendingRequests();
          },
          error: (err) => {
            console.error('Error rejecting:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Gagal menolak pengajuan'
            });
          }
        });
      }
    });
=======
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
            <td>{{ request.date }}</td>
            <td>
              <div class="time-range">
                <span class="time-badge">{{ request.startTime }}</span>
                <i class="pi pi-arrow-right"></i>
                <span class="time-badge">{{ request.endTime }}</span>
              </div>
            </td>
            <td class="text-center">
              <span class="hours-badge">{{ request.totalHours }}h</span>
            </td>
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
  `]
})
export class OvertimeApprovalComponent {
  filters = {
    search: '',
    department: null,
    status: null,
    dateRange: null
  };
  
  rejectDialogVisible = false;
  rejectReason = '';
  selectedRequest: any = null;
  
  departments = [
    { name: 'IT', value: 'IT' },
    { name: 'HR', value: 'HR' },
    { name: 'Finance', value: 'Finance' },
    { name: 'Marketing', value: 'Marketing' },
  ];
  
  statuses = [
    { name: 'Menunggu', value: 'Menunggu' },
    { name: 'Disetujui', value: 'Disetujui' },
    { name: 'Ditolak', value: 'Ditolak' },
  ];
  
  pendingRequests = [
    { id: 1, employeeName: 'Ahmad Fauzi', department: 'IT', date: '2024-01-15', startTime: '18:00', endTime: '21:00', totalHours: 3, reason: 'Deadline proyek', status: 'Menunggu' },
    { id: 2, employeeName: 'Siti Rahayu', department: 'HR', date: '2024-01-14', startTime: '17:00', endTime: '20:00', totalHours: 3, reason: 'Rekrutmen urgent', status: 'Menunggu' },
    { id: 3, employeeName: 'Budi Santoso', department: 'Finance', date: '2024-01-13', startTime: '18:00', endTime: '22:00', totalHours: 4, reason: 'Tutup buku bulanan', status: 'Disetujui' },
    { id: 4, employeeName: 'Dewi Lestari', department: 'Marketing', date: '2024-01-12', startTime: '17:00', endTime: '19:00', totalHours: 2, reason: 'Persiapan event', status: 'Ditolak' },
  ];
  
  filteredData = [...this.pendingRequests];
  
  getPendingCount(): number {
    return this.pendingRequests.filter(r => r.status === 'Menunggu').length;
  }
  
  getTotalPendingHours(): number {
    return this.pendingRequests
      .filter(r => r.status === 'Menunggu')
      .reduce((sum, r) => sum + r.totalHours, 0);
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
      const matchDept = !this.filters.department || r.department === this.filters.department;
      const matchStatus = !this.filters.status || r.status === this.filters.status;
      return matchSearch && matchDept && matchStatus;
    });
  }
  
  resetFilters(): void {
    this.filters = { search: '', department: null, status: null, dateRange: null };
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
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
  }
}
</div></div>
