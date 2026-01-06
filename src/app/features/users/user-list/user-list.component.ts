import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UserService, UserResponse, UserCreateRequest } from '../../../core/services/master-data.service';
import { RoleService } from '../../../core/services/master-data.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeResponse } from '../../../core/models';

interface UserDisplay {
  id: string;
  username: string;
  roles: { id: string; namaRole: string }[];
  karyawan?: { id: string; nama: string; nik: string } | null;
  roleLabel: string;
  initials: string;
  roleBg: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, TableModule, ButtonDirective, 
    InputText, Tag, Tooltip, Dialog, Select, ConfirmDialog
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen User</h1>
        <p class="page-subtitle">Kelola akun pengguna sistem</p>
      </div>
      <button pButton label="Tambah User" icon="pi pi-plus" (click)="openDialog()"></button>
    </div>
    
    <div class="hris-card">
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari username..." [(ngModel)]="searchText" (input)="onSearch()" />
        </div>
        <span class="data-count">Total: {{ filteredUsers.length }} user</span>
      </div>
      
      @if (loading) {
        <div class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Memuat data...</span>
        </div>
      } @else {
        <p-table 
          [value]="filteredUsers" 
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
              <th>Username</th>
              <th>Karyawan</th>
              <th style="width: 150px">Role</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>
                <span class="user-name">{{ user.username }}</span>
              </td>
              <td>{{ user.karyawan?.nama || '-' }}</td>
              <td>
                <p-tag [value]="user.roleLabel" [severity]="getRoleSeverity(user.roleLabel)" />
              </td>
              <td>
                <div class="action-buttons">
                  <button pButton icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" pTooltip="Edit" (click)="editUser(user)"></button>
                  <button pButton icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Hapus" 
                    [disabled]="user.roleLabel === 'ADMIN'" 
                    (click)="confirmDelete(user)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center p-4">
                <div class="empty-state">
                  <i class="pi pi-users empty-icon"></i>
                  <p>Tidak ada data user</p>
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
      [header]="isEditMode ? 'Edit User' : 'Tambah User'" 
      [modal]="true" 
      [style]="{'width': '450px'}"
      [draggable]="false"
    >
      <div class="dialog-content">
        <div class="form-group">
          <label>Username <span class="required">*</span></label>
          <input type="text" pInputText [(ngModel)]="formData.username" placeholder="Contoh: john_doe" class="w-full" />
        </div>
        
        <div class="form-group">
          <label>Password <span class="required" *ngIf="!isEditMode">*</span></label>
          <input type="password" pInputText [(ngModel)]="formData.password" [placeholder]="isEditMode ? 'Kosongkan jika tidak diubah' : 'Min. 6 karakter'" class="w-full" />
        </div>
        
        <div class="form-group">
          <label>Role <span class="required">*</span></label>
          <p-select 
            [options]="roles" 
            [(ngModel)]="formData.roleId"
            optionLabel="namaRole"
            optionValue="id"
            placeholder="Pilih role"
            [style]="{'width': '100%'}"
          />
        </div>
        
        @if (isAdminOrHR) {
          <div class="form-group">
            <label>Karyawan Terkait</label>
            <p-select 
              [options]="employees" 
              [(ngModel)]="formData.karyawanId"
              optionLabel="nama"
              optionValue="id"
              placeholder="Pilih karyawan (opsional)"
              [showClear]="true"
              [style]="{'width': '100%'}"
            >
              <ng-template pTemplate="selectedItem" let-item>
                {{ item?.nama }} ({{ item?.nik }})
              </ng-template>
              <ng-template pTemplate="item" let-item>
                {{ item.nama }} ({{ item.nik }})
              </ng-template>
            </p-select>
            <small class="hint">Hubungkan user dengan data karyawan</small>
          </div>
        }
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="saveUser()" [loading]="saving"></button>
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
    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-info { display: flex; flex-direction: column; gap: 0.125rem; }
    .user-name { font-weight: 500; color: #1E293B; }
    .action-buttons { display: flex; gap: 0.25rem; }
    .dialog-content { padding: 0.5rem 0; }
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
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private confirmationService = inject(ConfirmationService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  searchText = '';
  loading = false;
  saving = false;
  dialogVisible = false;
  isEditMode = false;
  isAdminOrHR = false;
  
  users: UserDisplay[] = [];
  filteredUsers: UserDisplay[] = [];
  roles: { id: string; namaRole: string }[] = [];
  employees: EmployeeResponse[] = [];
  
  formData = {
    id: null as string | null,
    username: '',
    password: '',
    roleId: '',
    karyawanId: null as string | null
  };

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadEmployees();
    this.checkUserRole();
  }

  private checkUserRole(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.roles) {
        const roleNames = user.roles.map(r => r.namaRole.toUpperCase());
        this.isAdminOrHR = roleNames.includes('ADMIN') || roleNames.includes('HR');
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => this.employees = data,
      error: (err) => console.error('Load employees error:', err)
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data.map(u => this.transformUser(u));
        this.filteredUsers = [...this.users];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notificationService.error('Error', 'Gagal memuat data user');
        console.error('Load users error:', err);
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Load roles error:', err);
      }
    });
  }

  transformUser(user: UserResponse): UserDisplay {
    const roleLabel = user.roles.length > 0 ? user.roles[0].namaRole : 'KARYAWAN';
    return {
      id: user.id,
      username: user.username,
      roles: user.roles,
      karyawan: user.karyawan,
      roleLabel,
      initials: user.username.substring(0, 2).toUpperCase(),
      roleBg: this.getRoleBg(roleLabel)
    };
  }

  getRoleBg(role: string): string {
    switch (role.toUpperCase()) {
      case 'ADMIN': return '#DC2626';
      case 'HR': return '#7C3AED';
      case 'MANAGER': return '#059669';
      default: return '#64748B';
    }
  }
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.username.toLowerCase().includes(term)
    );
  }
  
  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (role.toUpperCase()) {
      case 'ADMIN': return 'danger';
      case 'HR': return 'info';
      case 'MANAGER': return 'warn';
      default: return 'secondary';
    }
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, username: '', password: '', roleId: '', karyawanId: null };
    this.dialogVisible = true;
  }

  editUser(user: UserDisplay): void {
    this.isEditMode = true;
    this.formData = {
      id: user.id,
      username: user.username,
      password: '',
      roleId: user.roles.length > 0 ? user.roles[0].id : '',
      karyawanId: user.karyawan?.id || null
    };
    this.dialogVisible = true;
  }

  saveUser(): void {
    if (!this.formData.username || !this.formData.roleId) {
      this.notificationService.warn('Peringatan', 'Username dan role harus diisi');
      return;
    }

    if (!this.isEditMode && !this.formData.password) {
      this.notificationService.warn('Peringatan', 'Password harus diisi');
      return;
    }

    this.saving = true;

    if (this.isEditMode && this.formData.id) {
      const request: any = {
        username: this.formData.username,
        roleId: this.formData.roleId,
        karyawanId: this.formData.karyawanId || null
      };
      if (this.formData.password) {
        request.password = this.formData.password;
      }

      this.userService.update(this.formData.id, request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'User berhasil diperbarui');
          this.dialogVisible = false;
          this.saving = false;
          this.cdr.markForCheck();
          this.loadUsers();
        },
        error: (err) => {
          this.saving = false;
          this.cdr.markForCheck();
          this.notificationService.error('Error', 'Gagal memperbarui user');
          console.error('Update error:', err);
        }
      });
    } else {
      const request: UserCreateRequest = {
        username: this.formData.username,
        password: this.formData.password,
        roleId: this.formData.roleId,
        karyawanId: this.formData.karyawanId || undefined
      };

      this.userService.create(request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'User berhasil ditambahkan');
          this.dialogVisible = false;
          this.saving = false;
          this.cdr.markForCheck();
          this.loadUsers();
        },
        error: (err) => {
          this.saving = false;
          this.cdr.markForCheck();
          this.notificationService.error('Error', 'Gagal menambahkan user');
          console.error('Create error:', err);
        }
      });
    }
  }
  
  confirmDelete(user: UserDisplay): void {
    if (user.roleLabel.toUpperCase() === 'ADMIN') return;

    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus user "${user.username}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.userService.delete(user.id).subscribe({
          next: () => {
            this.notificationService.success('Berhasil', 'User berhasil dihapus');
            this.cdr.markForCheck();
            this.loadUsers();
          },
          error: (err) => {
            this.cdr.markForCheck();
            this.notificationService.error('Error', 'Gagal menghapus user');
            console.error('Delete error:', err);
          }
        });
      }
    });
  }
}
