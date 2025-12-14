import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Avatar } from 'primeng/avatar';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonDirective, InputText, Avatar],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Karyawan</h1>
        <p class="page-subtitle">Kelola data karyawan perusahaan</p>
      </div>
      <a routerLink="new" pButton label="Tambah Karyawan" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      <p-table [value]="employees" [paginator]="true" [rows]="10" [globalFilterFields]="['firstName', 'lastName', 'email']">
        <ng-template pTemplate="header">
          <tr>
            <th>Karyawan</th>
            <th>NIK</th>
            <th>Departemen</th>
            <th>Jabatan</th>
            <th>Email</th>
            <th>Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-employee>
          <tr>
            <td>
              <div class="d-flex align-items-center gap-2">
                <p-avatar [label]="employee.initials" shape="circle" />
                <span>{{ employee.firstName }} {{ employee.lastName }}</span>
              </div>
            </td>
            <td>{{ employee.employeeCode }}</td>
            <td>{{ employee.department }}</td>
            <td>{{ employee.position }}</td>
            <td>{{ employee.email }}</td>
            <td>
              <a [routerLink]="[employee.id]" pButton icon="pi pi-eye" [text]="true" [rounded]="true"></a>
              <a [routerLink]="[employee.id, 'edit']" pButton icon="pi pi-pencil" [text]="true" [rounded]="true"></a>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class EmployeeListComponent {
  employees = [
    { id: 1, firstName: 'Ahmad', lastName: 'Fauzi', initials: 'AF', employeeCode: 'EMP001', department: 'IT', position: 'Developer', email: 'ahmad@company.com' },
    { id: 2, firstName: 'Siti', lastName: 'Rahayu', initials: 'SR', employeeCode: 'EMP002', department: 'HR', position: 'HR Staff', email: 'siti@company.com' },
    { id: 3, firstName: 'Budi', lastName: 'Santoso', initials: 'BS', employeeCode: 'EMP003', department: 'Finance', position: 'Accountant', email: 'budi@company.com' },
  ];
}
