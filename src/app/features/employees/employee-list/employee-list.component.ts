import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService, PositionService } from '../../../core/services/master-data.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeCreateRequest, EmployeeUpdateRequest, EmployeeResponse } from '../../../core/models';

interface EmployeeDisplay {
  id: string;
  nama: string;
  nik: string;
  email: string;
  jabatan: string;
  jabatanId?: string;
  departemen: string;
  departemenId?: string;
  sisaCuti: number;
  initials: string;
  avatarBg: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, TableModule, ButtonDirective, 
    InputText, Tooltip, Dialog, Select, ConfirmDialog
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Karyawan</h1>
        <p class="page-subtitle">Kelola data karyawan perusahaan</p>
      </div>
      <button pButton label="Tambah Karyawan" icon="pi pi-plus" (click)="openDialog()"></button>
    </div>
    
    <div class="hris-card">
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari nama karyawan..." [(ngModel)]="searchText" (input)="onSearch()" />
        </div>
        <span class="data-count">Total: {{ filteredEmployees.length }} karyawan</span>
      </div>
      
      @if (loading) {
        <div class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Memuat data...</span>
        </div>
      } @else {
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
              <th style="width: 60px">No</th>
              <th>Karyawan</th>
              <th style="width: 120px">NIK</th>
              <th>Departemen</th>
              <th>Jabatan</th>
              <th>Email</th>
              <th style="width: 100px">Sisa Cuti</th>
              <th style="width: 100px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-employee let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>
                <span class="employee-name">{{ employee.nama }}</span>
              </td>
              <td><code class="code-badge">{{ employee.nik }}</code></td>
              <td>{{ employee.departemen || '-' }}</td>
              <td>{{ employee.jabatan || '-' }}</td>
              <td class="email-cell">{{ employee.email }}</td>
              <td class="text-center">
                <span class="leave-badge">{{ employee.sisaCuti }} hari</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button pButton icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" pTooltip="Edit" (click)="editEmployee(employee)"></button>
                  <button pButton icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Hapus" (click)="confirmDelete(employee)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center p-4">
                <div class="empty-state">
                  <i class="pi pi-users empty-icon"></i>
                  <p>Tidak ada data karyawan</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
    
    <!-- Add/Edit Dialog -->
    <p-dialog 
      [(visible)]="dialogVisible" 
      [header]="isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan'" 
      [modal]="true" 
      [style]="{'width': '500px'}"
      [draggable]="false"
    >
      <div class="dialog-content" (keydown.enter)="saveEmployee()">
        <div class="form-group">
          <label>Nama Lengkap <span class="required">*</span></label>
          <input type="text" pInputText [(ngModel)]="formData.nama" placeholder="Contoh: Ahmad Fauzi" class="w-full" />
        </div>
        
        <div class="form-group">
          <label>NIK <span class="required">*</span></label>
          <input type="text" pInputText [(ngModel)]="formData.nik" placeholder="Contoh: EMP001" class="w-full" [disabled]="isEditMode" />
        </div>
        
        <div class="form-group">
          <label>Email <span class="required">*</span></label>
          <input type="email" pInputText [(ngModel)]="formData.email" placeholder="Contoh: ahmad@company.com" class="w-full" />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Departemen</label>
            <p-select 
              [options]="departments" 
              [(ngModel)]="formData.departemenId"
              optionLabel="namaDepartment"
              optionValue="id"
              placeholder="Pilih departemen"
              [style]="{'width': '100%'}"
            />
          </div>
          
          <div class="form-group">
            <label>Jabatan</label>
            <p-select 
              [options]="positions" 
              [(ngModel)]="formData.jabatanId"
              optionLabel="namaJabatan"
              optionValue="id"
              placeholder="Pilih jabatan"
              [style]="{'width': '100%'}"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Sisa Cuti (hari)</label>
          <input type="number" pInputText [(ngModel)]="formData.sisaCuti" min="0" max="30" class="w-full" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="saveEmployee()" [loading]="saving"></button>
      </ng-template>
    </p-dialog>
    
    <p-confirmDialog />
  `,
  styles: [`
    .table-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem; border-bottom: 1px solid #E2E8F0;
    }
    .search-box {
      position: relative;
      i { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: #94A3B8; }
      input { padding-left: 2.5rem; width: 280px; }
    }
    .data-count { font-size: 0.875rem; color: #64748B; }
    .employee-cell { display: flex; align-items: center; gap: 0.75rem; }
    .employee-info { display: flex; flex-direction: column; gap: 0.125rem; }
    .employee-name { font-weight: 500; color: #1E293B; }
    .code-badge { background: #F1F5F9; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-family: monospace; color: #475569; }
    .leave-badge { background: #DBEAFE; color: #1D4ED8; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .email-cell { color: #64748B; font-size: 0.875rem; }
    .action-buttons { display: flex; gap: 0.25rem; }
    .dialog-content { padding: 0.5rem 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .loading-state {
      display: flex; align-items: center; justify-content: center;
      gap: 0.5rem; padding: 3rem; color: #64748B;
      i { font-size: 1.5rem; }
    }
    .empty-state { padding: 2rem; text-align: center; color: #94A3B8; .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; } }
    .text-center { text-align: center; }
    .w-full { width: 100%; }
  `]
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private positionService = inject(PositionService);
  private confirmationService = inject(ConfirmationService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  searchText = '';
  loading = false;
  saving = false;
  dialogVisible = false;
  isEditMode = false;
  
  employees: EmployeeDisplay[] = [];
  filteredEmployees: EmployeeDisplay[] = [];
  departments: { id: string; namaDepartment: string }[] = [];
  positions: { id: string; namaJabatan: string }[] = [];
  
  formData = {
    id: null as string | null,
    nama: '',
    nik: '',
    email: '',
    jabatanId: '' as string | undefined,
    departemenId: '' as string | undefined,
    sisaCuti: 12
  };

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
    this.loadPositions();
  }

  loadEmployees(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data.map(e => this.transformEmployee(e));
        this.filteredEmployees = [...this.employees];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notificationService.error('Error', 'Gagal memuat data karyawan');
        console.error('Load employees error:', err);
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => console.error('Load departments error:', err)
    });
  }

  loadPositions(): void {
    this.positionService.getAll().subscribe({
      next: (data) => {
        this.positions = data;
      },
      error: (err) => console.error('Load positions error:', err)
    });
  }

  transformEmployee(emp: EmployeeResponse): EmployeeDisplay {
    const colors = ['#3B82F6', '#EC4899', '#22C55E', '#F59E0B', '#8B5CF6', '#06B6D4'];
    // Use deterministic color based on name hash to avoid ExpressionChangedAfterChecked error
    const hash = emp.nama.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      id: emp.id,
      nama: emp.nama,
      nik: emp.nik,
      email: emp.email,
      jabatan: emp.jabatan?.namaJabatan || '',
      jabatanId: emp.jabatan?.id,
      departemen: emp.departemen?.namaDepartment || '',
      departemenId: emp.departemen?.id,
      sisaCuti: emp.sisaCuti,
      initials: emp.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
      avatarBg: colors[hash % colors.length]
    };
  }
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredEmployees = this.employees.filter(e =>
      e.nama.toLowerCase().includes(term) ||
      e.nik.toLowerCase().includes(term) ||
      e.departemen.toLowerCase().includes(term)
    );
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, nama: '', nik: '', email: '', jabatanId: undefined, departemenId: undefined, sisaCuti: 12 };
    this.dialogVisible = true;
  }

  editEmployee(employee: EmployeeDisplay): void {
    console.log('Edit employee:', employee);
    console.log('JabatanId:', employee.jabatanId, 'DepartemenId:', employee.departemenId);
    this.isEditMode = true;
    this.formData = {
      id: employee.id,
      nama: employee.nama,
      nik: employee.nik,
      email: employee.email,
      jabatanId: employee.jabatanId || undefined,
      departemenId: employee.departemenId || undefined,
      sisaCuti: employee.sisaCuti
    };
    console.log('FormData after set:', this.formData);
    this.dialogVisible = true;
  }

  saveEmployee(): void {
    if (!this.formData.nama || !this.formData.nik || !this.formData.email) {
      this.notificationService.warn('Peringatan', 'Nama, NIK, dan Email harus diisi');
      return;
    }

    this.saving = true;

    if (this.isEditMode && this.formData.id) {
      const request: EmployeeUpdateRequest = {
        nama: this.formData.nama,
        email: this.formData.email,
        jabatanId: this.formData.jabatanId || undefined,
        departemenId: this.formData.departemenId || undefined,
        sisaCuti: this.formData.sisaCuti
      };

      this.employeeService.update(this.formData.id, request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'Karyawan berhasil diperbarui');
          this.dialogVisible = false;
          this.saving = false;
          this.cdr.markForCheck();
          this.loadEmployees();
        },
        error: (err) => {
          this.saving = false;
          this.cdr.markForCheck();
          this.notificationService.error('Error', 'Gagal memperbarui karyawan');
          console.error('Update error:', err);
        }
      });
    } else {
      const request: EmployeeCreateRequest = {
        nama: this.formData.nama,
        nik: this.formData.nik,
        email: this.formData.email,
        jabatanId: this.formData.jabatanId || undefined,
        departemenId: this.formData.departemenId || undefined,
        sisaCuti: this.formData.sisaCuti
      };

      this.employeeService.create(request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'Karyawan berhasil ditambahkan');
          this.dialogVisible = false;
          this.saving = false;
          this.cdr.markForCheck();
          this.loadEmployees();
        },
        error: (err) => {
          this.saving = false;
          this.cdr.markForCheck();
          this.notificationService.error('Error', 'Gagal menambahkan karyawan');
          console.error('Create error:', err);
        }
      });
    }
  }
  
  confirmDelete(employee: EmployeeDisplay): void {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus karyawan "${employee.nama}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.employeeService.delete(employee.id).subscribe({
          next: () => {
            this.notificationService.success('Berhasil', 'Karyawan berhasil dihapus');
            this.cdr.markForCheck();
            this.loadEmployees();
          },
          error: (err) => {
            this.cdr.markForCheck();
            this.notificationService.error('Error', 'Gagal menghapus karyawan');
            console.error('Delete error:', err);
          }
        });
      }
    });
  }
}
