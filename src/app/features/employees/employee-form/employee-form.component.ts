import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee, EmployeeCreateRequest, EmployeeUpdateRequest } from '../../../core/models';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    ReactiveFormsModule,
    ButtonDirective, 
    InputText,
    ToastModule
  ],
  providers: [MessageService],
  template: `
<div class="page-container">
  <div class="page-content">
    <!-- Access Denied -->
    @if (!isAdminOrHR) {
      <div class="access-denied">
        <i class="pi pi-lock"></i>
        <h2>Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <a routerLink="/dashboard" pButton label="Kembali ke Dashboard" icon="pi pi-arrow-left"></a>
      </div>
    } @else {
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan Baru' }}</h1>
          <p class="page-subtitle">{{ isEditMode ? 'Perbarui data karyawan' : 'Isi form untuk menambahkan karyawan baru' }}</p>
        </div>
        <a routerLink="/employees" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
      </div>

      <div class="hris-card form-card">
        @if (loading()) {
          <div class="loading-container">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <p>Memuat data...</p>
          </div>
        } @else {
          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <!-- Nama Lengkap -->
              <div class="form-group">
                <label for="nama">Nama Lengkap <span class="required">*</span></label>
                <input 
                  pInputText 
                  id="nama" 
                  formControlName="nama" 
                  placeholder="Masukkan nama lengkap"
                  [class.ng-invalid]="isInvalid('nama')"
                />
                @if (isInvalid('nama')) {
                  <small class="error-message">Nama wajib diisi</small>
                }
              </div>

              <!-- NIK -->
              <div class="form-group">
                <label for="nik">NIK (Nomor Induk Karyawan) <span class="required">*</span></label>
                <input 
                  pInputText 
                  id="nik" 
                  formControlName="nik" 
                  placeholder="Contoh: EMP001"
                  [class.ng-invalid]="isInvalid('nik')"
                  [readonly]="isEditMode"
                />
                @if (isInvalid('nik')) {
                  <small class="error-message">NIK wajib diisi</small>
                }
              </div>

              <!-- Email -->
              <div class="form-group">
                <label for="email">Email <span class="required">*</span></label>
                <input 
                  pInputText 
                  id="email" 
                  type="email"
                  formControlName="email" 
                  placeholder="email@perusahaan.com"
                  [class.ng-invalid]="isInvalid('email')"
                />
                @if (isInvalid('email')) {
                  <small class="error-message">Email wajib diisi dan format valid</small>
                }
              </div>

              <!-- Sisa Cuti -->
              <div class="form-group">
                <label for="sisaCuti">Sisa Cuti (hari)</label>
                <input 
                  pInputText 
                  id="sisaCuti" 
                  type="number"
                  formControlName="sisaCuti" 
                  placeholder="12"
                />
              </div>

              <!-- Departemen ID (TODO: dropdown from API) -->
              <div class="form-group">
                <label for="departemenId">Departemen ID</label>
                <input 
                  pInputText 
                  id="departemenId" 
                  formControlName="departemenId" 
                  placeholder="UUID Departemen (opsional)"
                />
                <small class="hint">Kosongkan jika belum ada departemen</small>
              </div>

              <!-- Jabatan ID (TODO: dropdown from API) -->
              <div class="form-group">
                <label for="jabatanId">Jabatan ID</label>
                <input 
                  pInputText 
                  id="jabatanId" 
                  formControlName="jabatanId" 
                  placeholder="UUID Jabatan (opsional)"
                />
                <small class="hint">Kosongkan jika belum ada jabatan</small>
              </div>
            </div>

            <div class="form-actions">
              <a routerLink="/employees" pButton label="Batal" [outlined]="true" severity="secondary"></a>
              <button 
                pButton 
                type="submit" 
                [label]="isEditMode ? 'Simpan Perubahan' : 'Tambah Karyawan'" 
                icon="pi pi-save"
                [loading]="submitting()"
                [disabled]="employeeForm.invalid || submitting()"
              ></button>
            </div>
          </form>
        }
      </div>
    }
    </div>
    <p-toast />
</div>
  `,
  styles: [`
    .access-denied {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      text-align: center;
      
      i {
        font-size: 4rem;
        color: var(--hris-danger);
        margin-bottom: 1rem;
      }
      
      h2 {
        color: var(--hris-gray-800);
        margin-bottom: 0.5rem;
      }
      
      p {
        color: var(--hris-gray-500);
        margin-bottom: 1.5rem;
      }
    }

    .form-card {
      max-width: 800px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 500;
        color: var(--hris-gray-700);
        font-size: 0.875rem;
      }

      .required {
        color: var(--hris-danger);
      }

      input {
        width: 100%;
      }

      .error-message {
        color: var(--hris-danger);
        font-size: 0.75rem;
      }

      .hint {
        color: var(--hris-gray-500);
        font-size: 0.75rem;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--hris-gray-200);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      color: var(--hris-gray-500);
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  ngOnInit(): void {
    this.initForm();
    
    // Check if edit mode
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId && this.employeeId !== 'new') {
      this.isEditMode = true;
      this.loadEmployee(this.employeeId);
    }
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      nama: ['', [Validators.required, Validators.minLength(2)]],
      nik: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      sisaCuti: [12],
      departemenId: [''],
      jabatanId: ['']
    });
  }

  loadEmployee(id: string): void {
    this.loading.set(true);
    this.employeeService.getById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          nama: employee.nama,
          nik: employee.nik,
          email: employee.email,
          sisaCuti: employee.sisaCuti,
          departemenId: employee.departemen?.id || '',
          jabatanId: employee.jabatan?.id || ''
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat data karyawan'
        });
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.employeeForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formValue = this.employeeForm.value;

    if (this.isEditMode && this.employeeId) {
      // Update
      const request: EmployeeUpdateRequest = {
        nama: formValue.nama,
        email: formValue.email,
        sisaCuti: formValue.sisaCuti,
        departemenId: formValue.departemenId || undefined,
        jabatanId: formValue.jabatanId || undefined
      };

      this.employeeService.update(this.employeeId, request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Data karyawan berhasil diperbarui'
          });
          setTimeout(() => this.router.navigate(['/employees']), 1500);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Error updating employee:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Gagal memperbarui data karyawan'
          });
        }
      });
    } else {
      // Create
      const request: EmployeeCreateRequest = {
        nama: formValue.nama,
        nik: formValue.nik,
        email: formValue.email,
        sisaCuti: formValue.sisaCuti,
        departemenId: formValue.departemenId || undefined,
        jabatanId: formValue.jabatanId || undefined
      };

      this.employeeService.create(request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Karyawan baru berhasil ditambahkan'
          });
          setTimeout(() => this.router.navigate(['/employees']), 1500);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Error creating employee:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Gagal menambahkan karyawan'
          });
        }
      });
    }
  }
}
