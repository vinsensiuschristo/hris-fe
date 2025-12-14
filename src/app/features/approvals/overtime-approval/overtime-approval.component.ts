import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-overtime-approval',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonDirective, Tooltip],
  template: `
    <div class="page-header">
      <h1 class="page-title">Persetujuan Lembur</h1>
      <p class="page-subtitle">Daftar pengajuan lembur yang menunggu persetujuan</p>
    </div>
    
    <div class="hris-card">
      <p-table [value]="pendingRequests" [paginator]="true" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th>Nama Karyawan</th>
            <th>Tanggal</th>
            <th>Jam</th>
            <th>Total Jam</th>
            <th>Deskripsi</th>
            <th>Bukti</th>
            <th>Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-request>
          <tr>
            <td>{{ request.employeeName }}</td>
            <td>{{ request.date }}</td>
            <td>{{ request.startTime }} - {{ request.endTime }}</td>
            <td>{{ request.totalHours }} jam</td>
            <td>{{ request.description }}</td>
            <td>
              <button pButton icon="pi pi-paperclip" [text]="true" [rounded]="true" pTooltip="Lihat Bukti"></button>
            </td>
            <td>
              <button pButton icon="pi pi-check" severity="success" [rounded]="true" [text]="true" pTooltip="Setujui"></button>
              <button pButton icon="pi pi-times" severity="danger" [rounded]="true" [text]="true" pTooltip="Tolak"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class OvertimeApprovalComponent {
  pendingRequests = [
    { id: 1, employeeName: 'Budi Santoso', date: '2024-01-15', startTime: '18:00', endTime: '21:00', totalHours: 3, description: 'Finishing laporan bulanan' },
    { id: 2, employeeName: 'Dewi Lestari', date: '2024-01-14', startTime: '17:00', endTime: '20:00', totalHours: 3, description: 'Persiapan meeting client' },
  ];
}
