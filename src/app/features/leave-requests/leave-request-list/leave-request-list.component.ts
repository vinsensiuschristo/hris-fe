<div class="page-container"><div class="page-content">import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveRequest } from '../../../core/models';

@Component({
  selector: 'app-leave-request-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TableModule, 
    ButtonDirective, 
    InputText, 
    Tag,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Cuti</h1>
        <p class="page-subtitle">{{ isAdminOrHR ? 'Kelola pengajuan cuti karyawan' : 'Daftar pengajuan cuti Anda' }}</p>
      </div>
      <a routerLink="new" pButton label="Ajukan Cuti Baru" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Memuat data...</p>
        </div>
      } @else {
        <p-table 
          [value]="leaveRequests()" 
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
              <th>Tipe Cuti</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Total Hari</th>
              <th>Alasan</th>
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
              <td>{{ request.jenisCuti?.namaJenis }}</td>
              <td>{{ request.tglMulai }}</td>
              <td>{{ request.tglSelesai }}</td>
              <td>{{ request.jumlahHari }} hari</td>
              <td>{{ request.alasan || '-' }}</td>
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
    .empty-state { padding: 2rem; text-align: center; }
    .empty-icon { font-size: 3rem; color: var(--hris-gray-400); }
    .empty-title { margin-top: 1rem; color: var(--hris-gray-700); }
    .empty-description { color: var(--hris-gray-500); }
  `]
})
export class LeaveRequestListComponent implements OnInit {
  private leaveRequestService = inject(LeaveRequestService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  leaveRequests = signal<LeaveRequest[]>([]);
  loading = signal<boolean>(true);

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  ngOnInit(): void {
    this.loadLeaveRequests();
  }

  loadLeaveRequests(): void {
    this.loading.set(true);
    
    const request$ = this.isAdminOrHR 
      ? this.leaveRequestService.getAll()
      : this.leaveRequestService.getAll(); // TODO: filter by current user

    request$.subscribe({
      next: (data) => {
        this.leaveRequests.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading leave requests:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat data pengajuan cuti'
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

  approveRequest(request: LeaveRequest): void {
    this.confirmationService.confirm({
      message: `Setujui pengajuan cuti dari "${request.karyawan?.nama}"?`,
      header: 'Konfirmasi Persetujuan',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Ya, Setujui',
      rejectLabel: 'Batal',
      accept: () => {
        this.leaveRequestService.approve(request.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Berhasil',
              detail: 'Pengajuan cuti disetujui'
            });
            this.loadLeaveRequests();
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

  rejectRequest(request: LeaveRequest): void {
    this.confirmationService.confirm({
      message: `Tolak pengajuan cuti dari "${request.karyawan?.nama}"?`,
      header: 'Konfirmasi Penolakan',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Ya, Tolak',
      rejectLabel: 'Batal',
      accept: () => {
        this.leaveRequestService.reject(request.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Berhasil',
              detail: 'Pengajuan cuti ditolak'
            });
            this.loadLeaveRequests();
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
