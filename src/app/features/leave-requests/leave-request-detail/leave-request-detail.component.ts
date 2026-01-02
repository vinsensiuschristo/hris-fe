import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-leave-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Detail Pengajuan Cuti</h1>
        </div>
        <div class="hris-card">
          <p>Detail pengajuan cuti akan ditampilkan di sini.</p>
          <a routerLink="/leave-requests" class="p-button p-button-text">Kembali</a>
        </div>
      </div>
    </div>
  `
})
export class LeaveRequestDetailComponent {}
