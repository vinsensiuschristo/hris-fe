import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-overtime-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Detail Pengajuan Lembur</h1>
    </div>
    <div class="hris-card">
      <p>Detail pengajuan lembur akan ditampilkan di sini.</p>
      <a routerLink="/overtime-requests" class="p-button p-button-text">Kembali</a>
    </div>
  `
})
export class OvertimeRequestDetailComponent {}
