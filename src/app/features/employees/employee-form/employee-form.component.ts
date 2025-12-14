import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Form Karyawan</h1>
    </div>
    <div class="hris-card">
      <p>Form karyawan akan diimplementasikan di sini.</p>
      <a routerLink="/employees" class="p-button p-button-text">Kembali</a>
    </div>
  `
})
export class EmployeeFormComponent {}
