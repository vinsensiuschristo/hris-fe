import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-leave-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonDirective, InputText, Tag],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Cuti</h1>
        <p class="page-subtitle">Daftar pengajuan cuti Anda</p>
      </div>
      <a routerLink="new" pButton label="Ajukan Cuti Baru" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      <p-table [value]="leaveRequests" [paginator]="true" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th>Tanggal Pengajuan</th>
            <th>Tipe Cuti</th>
            <th>Tanggal Mulai</th>
            <th>Tanggal Selesai</th>
            <th>Total Hari</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-request>
          <tr>
            <td>{{ request.createdAt }}</td>
            <td>{{ request.leaveType }}</td>
            <td>{{ request.startDate }}</td>
            <td>{{ request.endDate }}</td>
            <td>{{ request.totalDays }} hari</td>
            <td>
              <p-tag [value]="request.status" [severity]="getStatusSeverity(request.status)" />
            </td>
            <td>
              <a [routerLink]="[request.id]" pButton icon="pi pi-eye" [text]="true" [rounded]="true"></a>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center p-4">
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
  `
})
export class LeaveRequestListComponent {
  leaveRequests = [
    { id: 1, createdAt: '2024-01-15', leaveType: 'Cuti Tahunan', startDate: '2024-01-20', endDate: '2024-01-22', totalDays: 3, status: 'Menunggu' },
    { id: 2, createdAt: '2024-01-10', leaveType: 'Cuti Sakit', startDate: '2024-01-11', endDate: '2024-01-12', totalDays: 2, status: 'Disetujui' },
    { id: 3, createdAt: '2024-01-05', leaveType: 'Cuti Tahunan', startDate: '2024-01-08', endDate: '2024-01-08', totalDays: 1, status: 'Ditolak' },
  ];

  getStatusSeverity(status: string) {
    switch (status) {
      case 'Disetujui': return 'success';
      case 'Menunggu': return 'warn';
      case 'Ditolak': return 'danger';
      default: return 'info';
    }
  }
}
