import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee } from '../../../core/models';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonDirective, Tag, ToastModule],
  providers: [MessageService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Profil Karyawan</h1>
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
