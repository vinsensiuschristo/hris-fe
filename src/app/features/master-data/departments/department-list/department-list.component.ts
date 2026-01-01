<div class="page-container"><div class="page-content">import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DepartmentService } from '../../../../core/services/master-data.service';
import { Department } from '../../../../core/models';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonDirective,
    InputText,
    ToastModule,
    ConfirmDialogModule,
    DialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Departemen</h1>
        <p class="page-subtitle">Kelola data departemen perusahaan</p>
      </div>
      <button pButton label="Tambah Departemen" icon="pi pi-plus" (click)="openDialog()"></button>
    </div>
    
    <div class="hris-card">
      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Memuat data...</p>
        </div>
      } @else {
        <p-table [value]="departments()" [paginator]="true" [rows]="10" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Nama Departemen</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-dept>
            <tr>
              <td>{{ dept.namaDepartment }}</td>
              <td>
                <button pButton icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" (click)="editDepartment(dept)"></button>
                <button pButton icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (click)="confirmDelete(dept)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="2" class="text-center p-4">
                <p class="text-muted">Belum ada data departemen</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>

    <!-- Form Dialog -->
    <p-dialog 
      [header]="isEditMode ? 'Edit Departemen' : 'Tambah Departemen'" 
      [(visible)]="dialogVisible" 
      [modal]="true"
      [style]="{ width: '400px' }"
    >
      <div class="form-group">
        <label for="namaDepartment">Nama Departemen</label>
        <input 
          pInputText 
          id="namaDepartment" 
          [(ngModel)]="formData.namaDepartment" 
          placeholder="Masukkan nama departemen"
          style="width: 100%"
        />
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" severity="secondary" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-save" (click)="saveDepartment()" [loading]="submitting()"></button>
      </ng-template>
    </p-dialog>

    <p-toast />
    <p-confirmDialog />
  `,
  styles: [`
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: var(--hris-gray-500); }
    .text-muted { color: var(--hris-gray-500); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
  `]
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  departments = signal<Department[]>([]);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  
  dialogVisible = false;
  isEditMode = false;
  editingId: string | null = null;
  formData = { namaDepartment: '' };

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading.set(true);
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data' });
      }
    });
  }

  openDialog(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.formData = { namaDepartment: '' };
    this.dialogVisible = true;
  }

  editDepartment(dept: Department): void {
    this.isEditMode = true;
    this.editingId = dept.id;
    this.formData = { namaDepartment: dept.namaDepartment };
    this.dialogVisible = true;
  }

  saveDepartment(): void {
    if (!this.formData.namaDepartment.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Peringatan', detail: 'Nama departemen wajib diisi' });
      return;
    }

    this.submitting.set(true);

    if (this.isEditMode && this.editingId) {
      this.departmentService.update(this.editingId, this.formData).subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Departemen diperbarui' });
          this.loadDepartments();
        },
        error: (err) => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal memperbarui' });
        }
      });
    } else {
      this.departmentService.create(this.formData).subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Departemen ditambahkan' });
          this.loadDepartments();
        },
        error: (err) => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal menambahkan' });
        }
      });
    }
  }

  confirmDelete(dept: Department): void {
    this.confirmationService.confirm({
      message: `Hapus departemen "${dept.namaDepartment}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.departmentService.delete(dept.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Departemen dihapus' });
            this.loadDepartments();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal menghapus' });
          }
        });
      }
    });
  }
}
</div></div>
