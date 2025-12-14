import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Data Jabatan</h1>
      <p class="page-subtitle">Kelola data jabatan</p>
    </div>
    <div class="hris-card">
      <p>CRUD jabatan akan diimplementasikan di sini.</p>
    </div>
  `
})
export class PositionListComponent {}
