import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Data Departemen</h1>
      <p class="page-subtitle">Kelola data departemen</p>
    </div>
    <div class="hris-card">
      <p>CRUD departemen akan diimplementasikan di sini.</p>
    </div>
  `
})
export class DepartmentListComponent {}
