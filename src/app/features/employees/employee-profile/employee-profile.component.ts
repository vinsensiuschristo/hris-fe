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

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonDirective, Tag, Avatar, Divider, TabsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Profil Karyawan</h1>
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
