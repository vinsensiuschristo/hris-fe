<div class="page-container"><div class="page-content">import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { OvertimeRequest } from '../../../core/models';

@Component({
  selector: 'app-overtime-request-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TableModule, 
    ButtonDirective, 
    Tag,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Lembur</h1>
        <p class="page-subtitle">{{ isAdminOrHR ? 'Kelola pengajuan lembur karyawan' : 'Daftar pengajuan lembur Anda' }}</p>
      </div>
      <a routerLink="new" pButton label="Ajukan Lembur Baru" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Memuat data...</p>
        </div>
      } @else {
        <p-table 
          [value]="overtimeRequests()" 
          [paginator]="true" 
          [rows]="10"
          [rowHover]="true"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} pengajuan"
        >
          <ng-template pTemplate="header">
            <tr>
              @if (isAdminOrHR) {
                <th>Karyawan</th>
              }
              <th>Tanggal</th>
              <th>Jam Mulai</th>
              <th>Jam Selesai</th>
              <th>Durasi</th>
              <th>Estimasi Biaya</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-request>
            <tr>
              @if (isAdminOrHR) {
                <td>
                  <div class="fw-semibold">{{ request.karyawan?.nama }}</div>
                  <div class="text-muted small">{{ request.karyawan?.nik }}</div>
                </td>
              }
              <td>{{ request.tglLembur }}</td>
              <td>{{ request.jamMulai }}</td>
              <td>{{ request.jamSelesai }}</td>
              <td>{{ request.durasi }} jam</td>
              <td>
                <span class="text-primary fw-semibold">{{ formatCurrency(request.estimasiBiaya) }}</span>
              </td>
              <td>
                <p-tag [value]="getStatusLabel(request.status?.namaStatus)" [severity]="getStatusSeverity(request.status?.namaStatus)" />
              </td>
              <td>
                <a [routerLink]="[request.id]" pButton icon="pi pi-eye" [text]="true" [rounded]="true" severity="info"></a>
                @if (isAdminOrHR && request.status?.namaStatus === 'MENUNGGU_PERSETUJUAN') {
                  <button pButton icon="pi pi-check" [text]="true" [rounded]="true" severity="success" (click)="approveRequest(request)"></button>
                  <button pButton icon="pi pi-times" [text]="true" [rounded]="true" severity="danger" (click)="rejectRequest(request)"></button>
                }
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="isAdminOrHR ? 8 : 7" class="text-center p-4">
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

    <p-toast />
    <p-confirmDialog />
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--hris-gray-500);
    }
    .fw-semibold { font-weight: 600; }
    .small { font-size: 0.8125rem; }
    .text-muted { color: var(--hris-gray-500); }
    .text-primary { color: var(--hris-primary); }
    .empty-state { padding: 2rem; text-align: center; }
    .empty-icon { font-size: 3rem; color: var(--hris-gray-400); }
    .empty-title { margin-top: 1rem; color: var(--hris-gray-700); }
    .empty-description { color: var(--hris-gray-500); }
  `]
})
export class OvertimeRequestListComponent implements OnInit {
  private overtimeRequestService = inject(OvertimeRequestService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  overtimeRequests = signal<OvertimeRequest[]>([]);
  loading = signal<boolean>(true);

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  ngOnInit(): void {
    this.loadOvertimeRequests();
  }

  loadOvertimeRequests(): void {
    this.loading.set(true);
    
    this.overtimeRequestService.getAll().subscribe({
      next: (data) => {
        this.overtimeRequests.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading overtime requests:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat data pengajuan lembur'
        });
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'DISETUJUI': return 'success';
      case 'MENUNGGU_PERSETUJUAN': return 'warn';
      case 'DITOLAK': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DISETUJUI': return 'Disetujui';
      case 'MENUNGGU_PERSETUJUAN': return 'Menunggu';
      case 'DITOLAK': return 'Ditolak';
      default: return status || '-';
    }
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
      message: `Setujui pengajuan lembur dari "${request.karyawan?.nama}"?`,
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
            this.loadOvertimeRequests();
          },
          error: (err) => {
            console.error('Error approving:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Gagal menyetujui pengajuan'
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
            this.loadOvertimeRequests();
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
  }
}
</div></div>
