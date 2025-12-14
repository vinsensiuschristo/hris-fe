import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonDirective, Tag, Tooltip],
  template: `
    <div class="page-header">
      <h1 class="page-title">Persetujuan Cuti</h1>
      <p class="page-subtitle">Daftar pengajuan cuti yang menunggu persetujuan</p>
    </div>
    
    <div class="hris-card">
      <p-table [value]="pendingRequests" [paginator]="true" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th>Nama Karyawan</th>
            <th>Tipe Cuti</th>
            <th>Tanggal</th>
            <th>Total Hari</th>
            <th>Alasan</th>
            <th>Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-request>
          <tr>
            <td>{{ request.employeeName }}</td>
            <td>{{ request.leaveType }}</td>
            <td>{{ request.startDate }} - {{ request.endDate }}</td>
            <td>{{ request.totalDays }} hari</td>
            <td>{{ request.reason }}</td>
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
export class LeaveApprovalComponent {
  pendingRequests = [
    { id: 1, employeeName: 'Ahmad Fauzi', leaveType: 'Cuti Tahunan', startDate: '2024-01-20', endDate: '2024-01-22', totalDays: 3, reason: 'Liburan keluarga' },
    { id: 2, employeeName: 'Siti Rahayu', leaveType: 'Cuti Sakit', startDate: '2024-01-18', endDate: '2024-01-19', totalDays: 2, reason: 'Pemulihan pasca operasi' },
  ];
}
