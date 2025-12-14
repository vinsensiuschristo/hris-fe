import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-type-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Tipe Cuti</h1>
      <p class="page-subtitle">Kelola tipe-tipe cuti</p>
    </div>
    <div class="hris-card">
      <p>CRUD tipe cuti akan diimplementasikan di sini.</p>
    </div>
  `
})
export class LeaveTypeListComponent {}
