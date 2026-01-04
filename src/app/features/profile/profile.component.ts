import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { EmployeeResponse } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Profil Saya</h1>
    </div>
    
    @if (loading()) {
      <div class="hris-card">
        <div style="text-align: center; padding: 2rem;">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
          <p>Memuat data...</p>
        </div>
      </div>
    } @else {
      <div class="hris-card">
        <div class="profile-header">
          <div class="avatar">
            {{ userInitials }}
          </div>
          <div class="profile-info">
            <h2>{{ displayName }}</h2>
            <p class="text-muted">{{ employee()?.email || currentUser?.email || '-' }}</p>
          </div>
        </div>
        
        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--hris-gray-200);">
        
        <div class="profile-section">
          <h3>Informasi Akun</h3>
          <div class="profile-details">
            <div class="detail-item">
              <label>Username</label>
              <span>{{ currentUser?.username }}</span>
            </div>
            <div class="detail-item">
              <label>Role</label>
              <span>{{ userRole }}</span>
            </div>
          </div>
        </div>

        @if (employee()) {
          <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--hris-gray-200);">
          
          <div class="profile-section">
            <h3>Informasi Karyawan</h3>
            <div class="profile-details">
              <div class="detail-item">
                <label>NIK</label>
                <span>{{ employee()?.nik || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Nama Lengkap</label>
                <span>{{ employee()?.nama || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Email</label>
                <span>{{ employee()?.email || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Departemen</label>
                <span>{{ employee()?.departemen?.namaDepartment || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Jabatan</label>
                <span>{{ employee()?.jabatan?.namaJabatan || '-' }}</span>
              </div>
              <div class="detail-item highlight">
                <label>Sisa Cuti</label>
                <span class="cuti-value">{{ employee()?.sisaCuti || 0 }} hari</span>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--hris-primary) 0%, var(--hris-accent) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 700;
    }
    
    .profile-info h2 {
      margin: 0 0 0.25rem;
    }

    .profile-section h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--hris-gray-700);
    }
    
    .profile-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .detail-item label {
      font-size: 0.75rem;
      color: var(--hris-gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .detail-item span {
      font-size: 1rem;
      color: var(--hris-gray-900);
    }

    .detail-item.highlight {
      background: linear-gradient(135deg, var(--hris-primary-light) 0%, var(--hris-accent-light) 100%);
      padding: 1rem;
      border-radius: 8px;
    }

    .cuti-value {
      font-size: 1.5rem !important;
      font-weight: 700;
      color: var(--hris-primary) !important;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);

  loading = signal<boolean>(false);
  employee = signal<EmployeeResponse | null>(null);

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  private loadEmployeeData(): void {
    const karyawanId = this.currentUser?.employee?.id;
    if (karyawanId) {
      this.loading.set(true);
      this.employeeService.getById(karyawanId).subscribe({
        next: (data) => {
          this.employee.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading employee data:', err);
          this.loading.set(false);
        }
      });
    }
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';
    
    const emp = this.employee();
    if (emp) {
      const parts = emp.nama.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return emp.nama.substring(0, 2).toUpperCase();
    }
    
    if (user.employee) {
      const parts = user.employee.nama.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return user.employee.nama.substring(0, 2).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }

  get displayName(): string {
    const emp = this.employee();
    if (emp) return emp.nama;
    
    const user = this.currentUser;
    if (!user) return 'Pengguna';
    
    if (user.employee) {
      return user.employee.nama;
    }
    return user.username;
  }

  get userRole(): string {
    const user = this.currentUser;
    if (!user || !user.roles || user.roles.length === 0) return '-';
    return user.roles.map(r => r.namaRole).join(', ');
  }
}
