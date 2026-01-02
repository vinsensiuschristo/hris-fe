import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveRequest } from '../../../core/models';

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TableModule, 
    ButtonDirective, 
    Tag, 
    Tooltip,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-header">
      <h1 class="page-title">Persetujuan Cuti</h1>
      <p class="page-subtitle">Daftar pengajuan cuti yang menunggu persetujuan</p>
    </div>

    <div class="hris-card">
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
              <th>Tipe Cuti</th>
              <th>Tanggal</th>
              <th>Total Hari</th>
              <th>Alasan</th>
              <th>Sisa Cuti</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-request>
            <tr>
              <td>
                <div class="fw-semibold">{{ request.karyawan?.nama }}</div>
                <div class="text-muted small">{{ request.karyawan?.nik }}</div>
              </td>
              <td>{{ request.jenisCuti?.namaJenis }}</td>
              <td>{{ request.tglMulai }} - {{ request.tglSelesai }}</td>
              <td>{{ request.jumlahHari }} hari</td>
              <td>{{ request.alasan || '-' }}</td>
              <td>
                <p-tag
                  [value]="request.karyawan?.sisaCuti + ' hari'"
                  [severity]="request.karyawan?.sisaCuti >= request.jumlahHari ? 'success' : 'danger'"
                />
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
              <td colspan="7" class="text-center p-4">
                <i class="pi pi-check-circle" style="font-size: 2rem; color: var(--hris-success)"></i>
                <p class="mt-2">Tidak ada pengajuan cuti yang pending</p>
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
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class LeaveApprovalComponent implements OnInit {
  private leaveRequestService = inject(LeaveRequestService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  pendingRequests = signal<LeaveRequest[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.loading.set(true);
    this.leaveRequestService.getPending().subscribe({
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

  approveRequest(request: LeaveRequest): void {
    this.confirmationService.confirm({
      message: `Setujui pengajuan cuti dari "${request.karyawan?.nama}" (${request.jumlahHari} hari)?`,
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
              detail: 'Pengajuan cuti disetujui. Saldo cuti karyawan telah dikurangi.'
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
  }
}
