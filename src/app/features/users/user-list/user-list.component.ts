import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonDirective],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen User</h1>
        <p class="page-subtitle">Kelola akun pengguna sistem</p>
      </div>
      <a routerLink="new" pButton label="Tambah User" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      <p-table [value]="users" [paginator]="true" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.isActive ? 'Aktif' : 'Nonaktif' }}</td>
            <td>
              <a [routerLink]="[user.id, 'edit']" pButton icon="pi pi-pencil" [text]="true" [rounded]="true"></a>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class UserListComponent {
  users = [
    { id: 1, username: 'admin', email: 'admin@company.com', role: 'ADMIN', isActive: true },
    { id: 2, username: 'hr_manager', email: 'hr@company.com', role: 'HR', isActive: true },
    { id: 3, username: 'employee1', email: 'emp1@company.com', role: 'EMPLOYEE', isActive: true },
  ];
}
