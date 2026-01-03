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

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
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
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
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
    
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .form-group.full-width {
        grid-column: span 1;
      }
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
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
  }
}
