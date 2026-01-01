import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TableModule, 
    ButtonDirective, 
    InputText, 
    Avatar, 
    Tag,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Karyawan</h1>
        <p class="page-subtitle">Kelola data karyawan perusahaan</p>
      </div>
      <a routerLink="new" pButton label="Tambah Karyawan" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Memuat data...</p>
        </div>
      } @else {
        <p-table 
          [value]="employees()" 
          [paginator]="true" 
          [rows]="10" 
          [globalFilterFields]="['nama', 'nik', 'email']"
          [rowHover]="true"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} karyawan"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Karyawan</th>
              <th>NIK</th>
              <th>Departemen</th>
              <th>Jabatan</th>
              <th>Sisa Cuti</th>
              <th>Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-employee>
            <tr>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <p-avatar [label]="getInitials(employee.nama)" shape="circle" />
                  <div>
                    <div class="fw-semibold">{{ employee.nama }}</div>
                    <div class="text-muted small">{{ employee.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ employee.nik }}</td>
              <td>{{ employee.departemen?.namaDepartment || '-' }}</td>
              <td>{{ employee.jabatan?.namaJabatan || '-' }}</td>
              <td>
                <p-tag 
                  [value]="employee.sisaCuti + ' hari'" 
                  [severity]="employee.sisaCuti > 5 ? 'success' : employee.sisaCuti > 0 ? 'warn' : 'danger'"
                />
              </td>
              <td>
                <a [routerLink]="[employee.id]" pButton icon="pi pi-eye" [text]="true" [rounded]="true" severity="info"></a>
                <a [routerLink]="[employee.id, 'edit']" pButton icon="pi pi-pencil" [text]="true" [rounded]="true" severity="secondary"></a>
                <button pButton icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (click)="confirmDelete(employee)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-4">
                <i class="pi pi-users" style="font-size: 2rem; color: var(--hris-gray-400)"></i>
                <p class="text-muted mt-2">Belum ada data karyawan</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>

    <p-confirmDialog />
    <p-toast />
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--hris-gray-500);
    }
    .fw-semibold { font-weight: 600; }
    .small { font-size: 0.8125rem; }
    .text-muted { color: var(--hris-gray-500); }
    .d-flex { display: flex; }
    .align-items-center { align-items: center; }
    .gap-2 { gap: 0.5rem; }
    .py-4 { padding: 2rem 0; }
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  employees = signal<Employee[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat data karyawan'
        });
      }
    });
  }

  getInitials(nama: string): string {
    if (!nama) return '?';
    const parts = nama.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nama.substring(0, 2).toUpperCase();
  }

  confirmDelete(employee: Employee): void {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus karyawan "${employee.nama}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.deleteEmployee(employee.id);
      }
    });
  }

  deleteEmployee(id: string): void {
    this.employeeService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Karyawan berhasil dihapus'
        });
        this.loadEmployees();
      },
      error: (err) => {
        console.error('Error deleting employee:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal menghapus karyawan'
        });
      }
    });
  }
}
