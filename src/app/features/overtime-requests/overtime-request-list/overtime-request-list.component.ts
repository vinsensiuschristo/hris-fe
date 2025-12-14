import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-overtime-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonDirective, Tag],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Lembur</h1>
        <p class="page-subtitle">Daftar pengajuan lembur Anda</p>
      </div>
      <a routerLink="new" pButton label="Ajukan Lembur Baru" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      <p-table [value]="overtimeRequests" [paginator]="true" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th>Tanggal</th>
            <th>Jam Mulai</th>
            <th>Jam Selesai</th>
            <th>Total Jam</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-request>
          <tr>
            <td>{{ request.date }}</td>
            <td>{{ request.startTime }}</td>
            <td>{{ request.endTime }}</td>
            <td>{{ request.totalHours }} jam</td>
            <td>
              <p-tag [value]="request.status" [severity]="getStatusSeverity(request.status)" />
            </td>
            <td>
              <a [routerLink]="[request.id]" pButton icon="pi pi-eye" [text]="true" [rounded]="true"></a>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class OvertimeRequestListComponent {
  overtimeRequests = [
    { id: 1, date: '2024-01-15', startTime: '18:00', endTime: '21:00', totalHours: 3, status: 'Menunggu' },
    { id: 2, date: '2024-01-12', startTime: '17:00', endTime: '20:00', totalHours: 3, status: 'Disetujui' },
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
