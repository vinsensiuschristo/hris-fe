import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Data Role</h1>
      <p class="page-subtitle">Kelola role pengguna</p>
    </div>
    <div class="hris-card">
      <p>CRUD role akan diimplementasikan di sini.</p>
    </div>
  `
})
export class RoleListComponent {}
