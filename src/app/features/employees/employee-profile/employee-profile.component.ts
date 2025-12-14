import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Profil Karyawan</h1>
    </div>
    <div class="hris-card">
      <p>Profil karyawan akan ditampilkan di sini.</p>
      <a routerLink="/employees" class="p-button p-button-text">Kembali</a>
    </div>
  `
})
export class EmployeeProfileComponent {}
