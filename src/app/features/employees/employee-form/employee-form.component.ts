<<<<<<< HEAD
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
=======
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputMask } from 'primeng/inputmask';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { NotificationService } from '../../../core/services/notification.service';
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
<<<<<<< HEAD
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

    <p-toast />
    </div>
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

=======
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputText,
    Select,
    DatePicker,
    InputMask,
    Card,
    Divider
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan' }}</h1>
        <p class="page-subtitle">{{ isEditMode ? 'Perbarui data karyawan' : 'Isi formulir untuk menambahkan karyawan baru' }}</p>
      </div>
    </div>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-container">
        <!-- Personal Information -->
        <div class="hris-card form-section">
          <div class="section-header">
            <i class="pi pi-user"></i>
            <h3>Data Pribadi</h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Nama Depan <span class="required">*</span></label>
              <input type="text" pInputText formControlName="firstName" placeholder="Nama depan" />
              @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                <small class="error-text">Nama depan wajib diisi</small>
              }
            </div>
            
            <div class="form-group">
              <label>Nama Belakang <span class="required">*</span></label>
              <input type="text" pInputText formControlName="lastName" placeholder="Nama belakang" />
              @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
                <small class="error-text">Nama belakang wajib diisi</small>
              }
            </div>
            
            <div class="form-group">
              <label>Email <span class="required">*</span></label>
              <input type="email" pInputText formControlName="email" placeholder="email@company.com" />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <small class="error-text">Email tidak valid</small>
              }
            </div>
            
            <div class="form-group">
              <label>No. Telepon <span class="required">*</span></label>
              <p-inputMask formControlName="phone" mask="9999-9999-9999" placeholder="0812-3456-7890" [style]="{'width': '100%'}" />
              @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
                <small class="error-text">Nomor telepon wajib diisi</small>
              }
            </div>
            
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <p-datepicker formControlName="birthDate" dateFormat="dd/mm/yy" placeholder="Pilih tanggal" [showIcon]="true" appendTo="body" [style]="{'width': '100%'}" />
            </div>
            
            <div class="form-group">
              <label>Jenis Kelamin <span class="required">*</span></label>
              <p-select 
                formControlName="gender"
                [options]="genders"
                optionLabel="name"
                optionValue="value"
                placeholder="Pilih jenis kelamin"
                [style]="{'width': '100%'}"
              />
            </div>
            
            <div class="form-group full-width">
              <label>Alamat</label>
              <input type="text" pInputText formControlName="address" placeholder="Alamat lengkap" />
            </div>
          </div>
        </div>
        
        <!-- Employment Information -->
        <div class="hris-card form-section">
          <div class="section-header">
            <i class="pi pi-briefcase"></i>
            <h3>Data Pekerjaan</h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>NIK / Kode Karyawan <span class="required">*</span></label>
              <input type="text" pInputText formControlName="employeeCode" placeholder="EMP001" />
              @if (form.get('employeeCode')?.invalid && form.get('employeeCode')?.touched) {
                <small class="error-text">NIK wajib diisi</small>
              }
            </div>
            
            <div class="form-group">
              <label>Departemen <span class="required">*</span></label>
              <p-select 
                formControlName="departmentId"
                [options]="departments"
                optionLabel="name"
                optionValue="id"
                placeholder="Pilih departemen"
                [style]="{'width': '100%'}"
              />
            </div>
            
            <div class="form-group">
              <label>Jabatan <span class="required">*</span></label>
              <p-select 
                formControlName="positionId"
                [options]="positions"
                optionLabel="name"
                optionValue="id"
                placeholder="Pilih jabatan"
                [style]="{'width': '100%'}"
              />
            </div>
            
            <div class="form-group">
              <label>Status Karyawan <span class="required">*</span></label>
              <p-select 
                formControlName="employmentStatus"
                [options]="employmentStatuses"
                optionLabel="name"
                optionValue="value"
                placeholder="Pilih status"
                [style]="{'width': '100%'}"
              />
            </div>
            
            <div class="form-group">
              <label>Tanggal Bergabung <span class="required">*</span></label>
              <p-datepicker formControlName="joinDate" dateFormat="dd/mm/yy" placeholder="Pilih tanggal" [showIcon]="true" appendTo="body" [style]="{'width': '100%'}" />
            </div>
            
            <div class="form-group">
              <label>Atasan Langsung</label>
              <p-select 
                formControlName="managerId"
                [options]="managers"
                optionLabel="name"
                optionValue="id"
                placeholder="Pilih atasan"
                [showClear]="true"
                [style]="{'width': '100%'}"
              />
            </div>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="form-actions">
          <a routerLink="/employees" class="p-button p-button-outlined">
            <i class="pi pi-arrow-left"></i>
            <span>Batal</span>
          </a>
          <button pButton type="submit" [label]="isEditMode ? 'Simpan Perubahan' : 'Tambah Karyawan'" icon="pi pi-check" [loading]="isLoading"></button>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 900px;
    }
    
    .form-section {
      padding: 1.5rem !important;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #E2E8F0;
      
      i {
        font-size: 1.25rem;
        color: #3B82F6;
      }
      
      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1E293B;
      }
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
    
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
<<<<<<< HEAD

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

=======
      
      &.full-width {
        grid-column: span 2;
      }
      
      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #475569;
      }
      
      input, :host ::ng-deep .p-inputtext {
        width: 100%;
      }
      
      /* Fix for p-select dropdown arrow - More aggressive */
      :host ::ng-deep {
        p-select,
        .p-select {
          width: 100% !important;
          display: inline-flex !important;
          flex-wrap: nowrap !important;
          flex-direction: row !important;
          align-items: stretch !important;
        }
        
        .p-select-label {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          display: block !important;
        }
        
        .p-select-dropdown,
        .p-select-trigger {
          flex: 0 0 auto !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 2.5rem !important;
        }
      }
    }
    
    .error-text {
      color: #DC2626;
      font-size: 0.75rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 0.5rem;
      
      .p-button-outlined {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
    
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
<<<<<<< HEAD
=======
      
      .form-group.full-width {
        grid-column: span 1;
      }
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
<<<<<<< HEAD
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
=======
  private notificationService = inject(NotificationService);
  
  isEditMode = false;
  isLoading = false;
  employeeId: string | null = null;
  
  genders = [
    { name: 'Laki-laki', value: 'male' },
    { name: 'Perempuan', value: 'female' }
  ];
  
  departments = [
    { id: 1, name: 'Human Resources' },
    { id: 2, name: 'Information Technology' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Marketing' },
    { id: 5, name: 'Operations' }
  ];
  
  positions = [
    { id: 1, name: 'Staff' },
    { id: 2, name: 'Senior Staff' },
    { id: 3, name: 'Supervisor' },
    { id: 4, name: 'Manager' },
    { id: 5, name: 'Senior Manager' }
  ];
  
  employmentStatuses = [
    { name: 'Kontrak', value: 'contract' },
    { name: 'Tetap', value: 'permanent' },
    { name: 'Magang', value: 'intern' },
    { name: 'Paruh Waktu', value: 'part-time' }
  ];
  
  managers = [
    { id: 1, name: 'Ahmad Fauzi - IT Manager' },
    { id: 2, name: 'Siti Rahayu - HR Manager' },
    { id: 3, name: 'Budi Santoso - Finance Manager' }
  ];
  
  form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    birthDate: [null],
    gender: [null, Validators.required],
    address: [''],
    employeeCode: ['', Validators.required],
    departmentId: [null, Validators.required],
    positionId: [null, Validators.required],
    employmentStatus: [null, Validators.required],
    joinDate: [null, Validators.required],
    managerId: [null]
  });
  
  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId && this.employeeId !== 'new') {
      this.isEditMode = true;
      this.loadEmployeeData();
    }
  }
  
  loadEmployeeData(): void {
    // Mock data for edit mode
    this.form.patchValue({
      firstName: 'Ahmad',
      lastName: 'Fauzi',
      email: 'ahmad@company.com',
      phone: '0812-3456-7890',
      gender: 'male',
      employeeCode: 'EMP001',
      departmentId: 2,
      positionId: 4,
      employmentStatus: 'permanent',
      joinDate: new Date('2022-01-15')
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => {
        c.markAsTouched();
        c.markAsDirty();
      });
      return;
    }
    
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.notificationService.success(
        'Berhasil',
        this.isEditMode ? 'Data karyawan berhasil diperbarui' : 'Karyawan baru berhasil ditambahkan'
      );
      this.router.navigate(['/employees']);
    }, 1000);
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
  }
}
