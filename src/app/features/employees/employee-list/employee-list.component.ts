import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
  employeeCode: string;
  department: string;
  position: string;
  email: string;
  avatarBg: string;
  isActive: boolean;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonDirective, InputText, Avatar, Tag, Tooltip, Dialog, Select],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Karyawan</h1>
        <p class="page-subtitle">Kelola data karyawan perusahaan</p>
      </div>
      <a routerLink="new" pButton label="Tambah Karyawan" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari nama karyawan..." [(ngModel)]="searchText" (input)="onSearch()" />
        </div>
        <span class="data-count">Total: {{ filteredEmployees.length }} karyawan</span>
      </div>
      
      <p-table 
        [value]="filteredEmployees" 
        [paginator]="true" 
        [rows]="10" 
        [rowsPerPageOptions]="[10, 20, 50]" 
        [showCurrentPageReport]="true" 
        currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords}"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Karyawan</th>
            <th style="width: 100px">NIK</th>
            <th>Departemen</th>
            <th>Jabatan</th>
            <th>Email</th>
            <th style="width: 80px">Status</th>
            <th style="width: 120px">Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-employee>
          <tr>
            <td>
              <div class="employee-cell">
                <p-avatar [label]="employee.initials" shape="circle" [style]="{'background': employee.avatarBg, 'color': 'white'}" />
                <div class="employee-info">
                  <span class="employee-name">{{ employee.firstName }} {{ employee.lastName }}</span>
                  <span class="employee-code">{{ employee.employeeCode }}</span>
                </div>
              </div>
            </td>
            <td><code class="code-badge">{{ employee.employeeCode }}</code></td>
            <td>{{ employee.department }}</td>
            <td>{{ employee.position }}</td>
            <td class="email-cell">{{ employee.email }}</td>
            <td>
              <p-tag [value]="employee.isActive ? 'Aktif' : 'Nonaktif'" [severity]="employee.isActive ? 'success' : 'secondary'" />
            </td>
            <td>
              <div class="action-buttons">
                <a [routerLink]="['/employees', employee.id]" pButton icon="pi pi-eye" [text]="true" [rounded]="true" severity="info" pTooltip="Lihat Detail"></a>
                <a [routerLink]="['/employees', employee.id, 'edit']" pButton icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Edit"></a>
                <button pButton icon="pi pi-power-off" [text]="true" [rounded]="true" 
                  [severity]="employee.isActive ? 'warn' : 'success'" 
                  [pTooltip]="employee.isActive ? 'Nonaktifkan' : 'Aktifkan'"
                  (click)="openStatusDialog(employee)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-users empty-icon"></i>
                <p>Tidak ada data karyawan</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    
    <!-- Status Change Dialog -->
    <p-dialog [header]="selectedEmployee?.isActive ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'" [(visible)]="showStatusDialog" [modal]="true" [style]="{'width': '450px'}">
      @if (selectedEmployee) {
        <div class="dialog-content">
          <div class="dialog-icon" [class.deactivate]="selectedEmployee.isActive" [class.activate]="!selectedEmployee.isActive">
            <i class="pi" [ngClass]="selectedEmployee.isActive ? 'pi-power-off' : 'pi-check-circle'"></i>
          </div>
          <p class="dialog-message">
            Apakah Anda yakin ingin <strong>{{ selectedEmployee.isActive ? 'menonaktifkan' : 'mengaktifkan' }}</strong> karyawan:
          </p>
          <div class="employee-preview">
            <p-avatar [label]="selectedEmployee.initials" shape="circle" [style]="{'background': selectedEmployee.avatarBg, 'color': 'white'}" />
            <div>
              <span class="name">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</span>
              <span class="code">{{ selectedEmployee.employeeCode }} - {{ selectedEmployee.department }}</span>
            </div>
          </div>
          @if (selectedEmployee.isActive) {
            <p class="warning-text"><i class="pi pi-info-circle"></i> Karyawan yang dinonaktifkan tidak dapat login ke sistem.</p>
          }
        </div>
      }
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="showStatusDialog = false"></button>
        <button pButton 
          [label]="selectedEmployee?.isActive ? 'Nonaktifkan' : 'Aktifkan'" 
          [icon]="selectedEmployee?.isActive ? 'pi pi-power-off' : 'pi pi-check'"
          [severity]="selectedEmployee?.isActive ? 'warn' : 'success'" 
          (click)="toggleEmployeeStatus()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .employee-cell { display: flex; align-items: center; gap: 0.75rem; }
    .employee-info { display: flex; flex-direction: column; gap: 0.125rem; }
    .employee-name { font-weight: 500; color: #1E293B; }
    .employee-code { font-size: 0.75rem; color: #94A3B8; }
    .code-badge { background: #F1F5F9; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-family: monospace; color: #475569; }
    .email-cell { color: #64748B; font-size: 0.875rem; }
    .action-buttons { display: flex; gap: 0.25rem; }
    .empty-state { padding: 2rem; text-align: center; color: #94A3B8; .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; } }
    
    .dialog-content { text-align: center; padding: 1rem 0; }
    .dialog-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;
      i { font-size: 1.75rem; }
      &.deactivate { background: #FEF3C7; color: #D97706; }
      &.activate { background: #D1FAE5; color: #059669; }
    }
    .dialog-message { margin: 0 0 1rem; color: #475569; }
    .employee-preview { display: flex; align-items: center; gap: 0.75rem; background: #F8FAFC; padding: 1rem; border-radius: 8px; text-align: left;
      .name { display: block; font-weight: 600; color: #1E293B; }
      .code { display: block; font-size: 0.8125rem; color: #64748B; }
    }
    .warning-text { display: flex; align-items: center; gap: 0.5rem; background: #FEF3C7; color: #92400E; padding: 0.75rem; border-radius: 6px; font-size: 0.8125rem; margin-top: 1rem;
      i { color: #D97706; }
    }
  `]
})
export class EmployeeListComponent {
  searchText = '';
  showStatusDialog = false;
  selectedEmployee: Employee | null = null;
  
  employees: Employee[] = [
    { id: 1, firstName: 'Ahmad', lastName: 'Fauzi', initials: 'AF', employeeCode: 'EMP001', department: 'IT', position: 'Senior Developer', email: 'ahmad@company.com', avatarBg: '#3B82F6', isActive: true },
    { id: 2, firstName: 'Siti', lastName: 'Rahayu', initials: 'SR', employeeCode: 'EMP002', department: 'HR', position: 'HR Manager', email: 'siti@company.com', avatarBg: '#EC4899', isActive: true },
    { id: 3, firstName: 'Budi', lastName: 'Santoso', initials: 'BS', employeeCode: 'EMP003', department: 'Finance', position: 'Accountant', email: 'budi@company.com', avatarBg: '#22C55E', isActive: true },
    { id: 4, firstName: 'Dewi', lastName: 'Lestari', initials: 'DL', employeeCode: 'EMP004', department: 'Marketing', position: 'Marketing Staff', email: 'dewi@company.com', avatarBg: '#F59E0B', isActive: false },
    { id: 5, firstName: 'Eko', lastName: 'Prasetyo', initials: 'EP', employeeCode: 'EMP005', department: 'IT', position: 'Junior Developer', email: 'eko@company.com', avatarBg: '#8B5CF6', isActive: true },
  ];
  
  filteredEmployees = [...this.employees];
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredEmployees = this.employees.filter(e => 
      e.firstName.toLowerCase().includes(term) ||
      e.lastName.toLowerCase().includes(term) ||
      e.employeeCode.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term)
    );
  }
  
  openStatusDialog(employee: Employee): void {
    this.selectedEmployee = employee;
    this.showStatusDialog = true;
  }
  
  toggleEmployeeStatus(): void {
    if (this.selectedEmployee) {
      const emp = this.employees.find(e => e.id === this.selectedEmployee!.id);
      if (emp) {
        emp.isActive = !emp.isActive;
      }
    }
    this.showStatusDialog = false;
    this.selectedEmployee = null;
  }
}
