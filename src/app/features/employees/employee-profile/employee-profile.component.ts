<<<<<<< HEAD
<div class="page-container"><div class="page-content">import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee } from '../../../core/models';
=======
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Divider } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'Aktif' | 'Nonaktif';
  birthDate: string;
  address: string;
  gender: string;
  religion: string;
  maritalStatus: string;
  education: string;
  leaveBalance: number;
  attendanceRate: number;
}
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)

@Component({
  selector: 'app-employee-profile',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterModule, ButtonDirective, Tag, ToastModule],
  providers: [MessageService],
=======
  imports: [CommonModule, RouterModule, ButtonDirective, Tag, Avatar, Divider, TabsModule],
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Profil Karyawan</h1>
<<<<<<< HEAD
        <p class="page-subtitle">Detail informasi karyawan</p>
      </div>
      <div class="header-actions">
        @if (isAdminOrHR && employee()) {
          <a [routerLink]="['/employees', employee()!.id, 'edit']" pButton label="Edit" icon="pi pi-pencil" [outlined]="true"></a>
        }
        <a routerLink="/employees" pButton label="Kembali" icon="pi pi-arrow-left" severity="secondary" [outlined]="true"></a>
      </div>
    </div>
    
    @if (loading()) {
      <div class="hris-card loading-container">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Memuat data...</p>
      </div>
    } @else if (employee()) {
      <div class="profile-grid">
        <!-- Main Info Card -->
        <div class="hris-card profile-card">
          <div class="profile-header">
            <div class="avatar">{{ getInitials(employee()!.nama) }}</div>
            <div class="profile-info">
              <h2>{{ employee()!.nama }}</h2>
              <p class="text-muted">{{ employee()!.email }}</p>
              <p-tag [value]="employee()!.nik" severity="info" />
            </div>
          </div>
        </div>

        <!-- Details Card -->
        <div class="hris-card">
          <h3 class="card-title">Informasi Pekerjaan</h3>
          <div class="details-grid">
            <div class="detail-item">
              <label>NIK</label>
              <span>{{ employee()!.nik }}</span>
            </div>
            <div class="detail-item">
              <label>Department</label>
              <span>{{ employee()!.departemen?.namaDepartment || 'Belum ditentukan' }}</span>
            </div>
            <div class="detail-item">
              <label>Jabatan</label>
              <span>{{ employee()!.jabatan?.namaJabatan || 'Belum ditentukan' }}</span>
            </div>
            <div class="detail-item">
              <label>Sisa Cuti</label>
              <span>
                <p-tag 
                  [value]="employee()!.sisaCuti + ' hari'" 
                  [severity]="employee()!.sisaCuti > 5 ? 'success' : employee()!.sisaCuti > 0 ? 'warn' : 'danger'"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="hris-card error-container">
        <i class="pi pi-exclamation-circle" style="font-size: 3rem; color: var(--hris-danger)"></i>
        <h3>Data tidak ditemukan</h3>
        <p class="text-muted">Karyawan dengan ID tersebut tidak ditemukan</p>
        <a routerLink="/employees" pButton label="Kembali ke Daftar" icon="pi pi-arrow-left"></a>
      </div>
    }

    <p-toast />
  `,
  styles: [`
    .header-actions { display: flex; gap: 0.5rem; }
    .loading-container, .error-container { 
      display: flex; flex-direction: column; align-items: center; justify-content: center; 
      padding: 3rem; text-align: center; min-height: 300px;
    }
    .error-container h3 { margin: 1rem 0 0.5rem; }
    .profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; }
    .profile-card {
      .profile-header { display: flex; flex-direction: column; align-items: center; text-align: center; }
      .avatar { 
        width: 100px; height: 100px; border-radius: 50%; 
        background: linear-gradient(135deg, var(--hris-primary) 0%, var(--hris-accent) 100%);
        color: white; display: flex; align-items: center; justify-content: center;
        font-size: 2rem; font-weight: 700; margin-bottom: 1rem;
      }
      .profile-info h2 { margin: 0 0 0.25rem; }
    }
    .card-title { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: var(--hris-gray-800); }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .detail-item { 
      display: flex; flex-direction: column; gap: 0.25rem;
      label { font-size: 0.75rem; color: var(--hris-gray-500); text-transform: uppercase; letter-spacing: 0.05em; }
      span { font-size: 1rem; color: var(--hris-gray-900); }
    }
    .text-muted { color: var(--hris-gray-500); }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
  `]
})
export class EmployeeProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  employee = signal<Employee | null>(null);
  loading = signal<boolean>(true);

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
    } else {
      this.loading.set(false);
    }
  }

  loadEmployee(id: string): void {
    this.loading.set(true);
    this.employeeService.getById(id).subscribe({
      next: (data) => {
        this.employee.set(data);
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

  getInitials(nama: string): string {
    if (!nama) return '?';
    const parts = nama.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nama.substring(0, 2).toUpperCase();
  }
}
</div></div>
=======
        <p class="page-subtitle">{{ employee.employeeCode }}</p>
      </div>
      <div class="header-actions">
        <a routerLink="/employees" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
        <a [routerLink]="['/employees', employee.id, 'edit']" pButton label="Edit" icon="pi pi-pencil"></a>
      </div>
    </div>
    
    <div class="profile-layout">
      <!-- Left Card - Profile Summary -->
      <div class="profile-card hris-card">
        <div class="profile-header">
          <div class="avatar-wrapper">
            <p-avatar [label]="getInitials()" size="xlarge" shape="circle" 
              [style]="{'background': 'linear-gradient(135deg, #3B82F6, #8B5CF6)', 'color': 'white', 'font-size': '2rem', 'width': '100px', 'height': '100px'}" />
            <span class="status-badge" [class.active]="employee.status === 'Aktif'">
              {{ employee.status }}
            </span>
          </div>
          
          <h2 class="employee-name">{{ employee.firstName }} {{ employee.lastName }}</h2>
          <span class="employee-position">{{ employee.position }}</span>
          <span class="employee-dept">{{ employee.department }}</span>
        </div>
        
        <p-divider />
        
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ employee.leaveBalance }}</span>
            <span class="stat-label">Sisa Cuti</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ employee.attendanceRate }}%</span>
            <span class="stat-label">Kehadiran</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ getTenure() }}</span>
            <span class="stat-label">Masa Kerja</span>
          </div>
        </div>
        
        <p-divider />
        
        <div class="contact-info">
          <div class="info-row">
            <i class="pi pi-envelope"></i>
            <span>{{ employee.email }}</span>
          </div>
          <div class="info-row">
            <i class="pi pi-phone"></i>
            <span>{{ employee.phone }}</span>
          </div>
          <div class="info-row">
            <i class="pi pi-calendar"></i>
            <span>Bergabung {{ employee.joinDate }}</span>
          </div>
        </div>
      </div>
      
      <!-- Right Content -->
      <div class="profile-content">
        <p-tabs>
          <p-tabpanel header="Informasi Pribadi">
            <div class="info-grid">
              <div class="info-card">
                <h4><i class="pi pi-user"></i> Data Diri</h4>
                <div class="info-rows">
                  <div class="row">
                    <span class="label">Nama Lengkap</span>
                    <span class="value">{{ employee.firstName }} {{ employee.lastName }}</span>
                  </div>
                  <div class="row">
                    <span class="label">NIK</span>
                    <span class="value">{{ employee.employeeCode }}</span>
                  </div>
                  <div class="row">
                    <span class="label">Tanggal Lahir</span>
                    <span class="value">{{ employee.birthDate }}</span>
                  </div>
                  <div class="row">
                    <span class="label">Jenis Kelamin</span>
                    <span class="value">{{ employee.gender }}</span>
                  </div>
                  <div class="row">
                    <span class="label">Agama</span>
                    <span class="value">{{ employee.religion }}</span>
                  </div>
                  <div class="row">
                    <span class="label">Status Pernikahan</span>
                    <span class="value">{{ employee.maritalStatus }}</span>
                  </div>
                </div>
              </div>
              
              <div class="info-card">
                <h4><i class="pi pi-building"></i> Data Pekerjaan</h4>
                <div class="info-rows">
                  <div class="row">
                    <span class="label">Departemen</span>
                    <span class="value">{{ employee.department }}</span>
                  </div>
                  <div class="row">
                    <span class="label">Jabatan</span>
                    <span class="value">{{ employee.position }}</span>
                  </div>
                  <div class="row">
                    <span class="label">Tanggal Bergabung</span>
                    <span class="value">{{ employee.joinDate }}</span>
                  </div>
                  <div class="row">
                    <span class="label">Pendidikan Terakhir</span>
                    <span class="value">{{ employee.education }}</span>
                  </div>
                  <div class="row">
                    <span class="label">Status</span>
                    <span class="value">
                      <p-tag [value]="employee.status" [severity]="employee.status === 'Aktif' ? 'success' : 'secondary'" />
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="info-card full-width">
                <h4><i class="pi pi-map-marker"></i> Alamat</h4>
                <p class="address-text">{{ employee.address }}</p>
              </div>
            </div>
          </p-tabpanel>
          
          <p-tabpanel header="Riwayat Cuti">
            <div class="coming-soon">
              <i class="pi pi-calendar"></i>
              <p>Riwayat cuti karyawan akan ditampilkan di sini</p>
            </div>
          </p-tabpanel>
          
          <p-tabpanel header="Riwayat Kehadiran">
            <div class="coming-soon">
              <i class="pi pi-clock"></i>
              <p>Riwayat kehadiran karyawan akan ditampilkan di sini</p>
            </div>
          </p-tabpanel>
        </p-tabs>
      </div>
    </div>
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    .profile-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.5rem;
    }
    
    .profile-card {
      text-align: center;
      padding: 1.5rem;
    }
    
    .profile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .avatar-wrapper {
      position: relative;
      margin-bottom: 0.5rem;
    }
    
    .status-badge {
      position: absolute;
      bottom: 0;
      right: -10px;
      padding: 0.25rem 0.625rem;
      border-radius: 50px;
      font-size: 0.6875rem;
      font-weight: 600;
      background: #94A3B8;
      color: white;
      
      &.active {
        background: linear-gradient(135deg, #22C55E, #16A34A);
      }
    }
    
    .employee-name {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1E293B;
    }
    
    .employee-position {
      font-size: 0.9375rem;
      color: #3B82F6;
      font-weight: 500;
    }
    
    .employee-dept {
      font-size: 0.8125rem;
      color: #64748B;
    }
    
    .profile-stats {
      display: flex;
      justify-content: space-around;
      padding: 0.5rem 0;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      
      .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1E293B;
      }
      
      .stat-label {
        font-size: 0.6875rem;
        color: #64748B;
        text-transform: uppercase;
      }
    }
    
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.8125rem;
      color: #475569;
      
      i {
        color: #64748B;
        width: 20px;
      }
    }
    
    .profile-content {
      .hris-card {
        padding: 0;
      }
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      padding: 1rem;
    }
    
    .info-card {
      background: #F8FAFC;
      border-radius: 12px;
      padding: 1.25rem;
      
      &.full-width {
        grid-column: 1 / -1;
      }
      
      h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem;
        font-size: 0.9375rem;
        font-weight: 600;
        color: #1E293B;
        
        i { color: #3B82F6; }
      }
    }
    
    .info-rows {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .label {
        font-size: 0.8125rem;
        color: #64748B;
      }
      
      .value {
        font-size: 0.8125rem;
        font-weight: 500;
        color: #1E293B;
      }
    }
    
    .address-text {
      margin: 0;
      font-size: 0.875rem;
      color: #475569;
      line-height: 1.6;
    }
    
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #94A3B8;
      
      i {
        font-size: 2.5rem;
        margin-bottom: 0.75rem;
      }
      
      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }
    
    @media (max-width: 1024px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeeProfileComponent implements OnInit {
  employee: Employee = {
    id: '1',
    employeeCode: 'EMP001',
    firstName: 'Ahmad',
    lastName: 'Fauzi',
    email: 'ahmad.fauzi@company.com',
    phone: '+62 812-3456-7890',
    department: 'Information Technology',
    position: 'Senior Software Developer',
    joinDate: '15 Maret 2021',
    status: 'Aktif',
    birthDate: '10 Januari 1990',
    address: 'Jl. Sudirman No. 123, Kelurahan Menteng, Kecamatan Menteng, Jakarta Pusat, DKI Jakarta 10310',
    gender: 'Laki-laki',
    religion: 'Islam',
    maritalStatus: 'Menikah',
    education: 'S1 Teknik Informatika',
    leaveBalance: 10,
    attendanceRate: 98
  };
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    // In real app, fetch employee by id from route params
  }
  
  getInitials(): string {
    return `${this.employee.firstName.charAt(0)}${this.employee.lastName.charAt(0)}`;
  }
  
  getTenure(): string {
    return '2 Thn';
  }
}
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
