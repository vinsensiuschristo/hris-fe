<div class="page-container"><div class="page-content">import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../core/services/api.service';
import { RoleService } from '../../../core/services/master-data.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, Role } from '../../../core/models';

@Component({
  selector: 'app-user-form',
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
    <!-- Access Denied Check -->
    @if (!isAdmin) {
      <div class="access-denied">
        <i class="pi pi-lock"></i>
        <h2>Akses Ditolak</h2>
        <p>Hanya Admin yang dapat mengelola user.</p>
        <a routerLink="/dashboard" pButton label="Kembali ke Dashboard" icon="pi pi-arrow-left"></a>
      </div>
    } @else {
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEditMode ? 'Edit User' : 'Tambah User Baru' }}</h1>
          <p class="page-subtitle">{{ isEditMode ? 'Perbarui data user' : 'Buat akun user baru' }}</p>
        </div>
        <a routerLink="/users" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
      </div>

      <div class="hris-card form-card">
        @if (loading()) {
          <div class="loading-container">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <p>Memuat data...</p>
          </div>
        } @else {
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <!-- Username -->
              <div class="form-group">
                <label for="username">Username <span class="required">*</span></label>
                <input 
                  pInputText 
                  id="username" 
                  formControlName="username" 
                  placeholder="Masukkan username"
                  [class.ng-invalid]="isInvalid('username')"
                  [readonly]="isEditMode"
                />
                @if (isInvalid('username')) {
                  <small class="error-message">Username wajib diisi (min 3 karakter)</small>
                }
              </div>

              <!-- Password -->
              <div class="form-group">
                <label for="password">Password {{ isEditMode ? '(kosongkan jika tidak diubah)' : '' }} <span class="required" *ngIf="!isEditMode">*</span></label>
                <input 
                  pInputText 
                  id="password" 
                  type="password"
                  formControlName="password" 
                  placeholder="Masukkan password"
                  [class.ng-invalid]="isInvalid('password')"
                />
                @if (isInvalid('password')) {
                  <small class="error-message">Password wajib diisi (min 6 karakter)</small>
                }
              </div>

              <!-- Role Selection -->
              <div class="form-group full-width">
                <label>Role <span class="required">*</span></label>
                <div class="role-options">
                  @for (role of roles(); track role.id) {
                    <label class="role-option" [class.selected]="selectedRoleId === role.id">
                      <input 
                        type="radio" 
                        name="role" 
                        [value]="role.id"
                        [(ngModel)]="selectedRoleId"
                        [ngModelOptions]="{standalone: true}"
                      />
                      <span class="role-name">{{ role.namaRole }}</span>
                    </label>
                  }
                </div>
              </div>
            </div>

            <div class="form-actions">
              <a routerLink="/users" pButton label="Batal" [outlined]="true" severity="secondary"></a>
              <button 
                pButton 
                type="submit" 
                [label]="isEditMode ? 'Simpan Perubahan' : 'Tambah User'" 
                icon="pi pi-save"
                [loading]="submitting()"
                [disabled]="userForm.invalid || submitting() || !selectedRoleId"
              ></button>
            </div>
          </form>
        }
      </div>
    }

    <p-toast />
  `,
  styles: [`
    .access-denied {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 50vh; text-align: center;
      i { font-size: 4rem; color: var(--hris-danger); margin-bottom: 1rem; }
      h2 { color: var(--hris-gray-800); margin-bottom: 0.5rem; }
      p { color: var(--hris-gray-500); margin-bottom: 1.5rem; }
    }
    .form-card { max-width: 600px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .full-width { grid-column: 1 / -1; }
    .form-group {
      display: flex; flex-direction: column; gap: 0.5rem;
      label { font-weight: 500; color: var(--hris-gray-700); font-size: 0.875rem; }
      .required { color: var(--hris-danger); }
      input { width: 100%; }
      .error-message { color: var(--hris-danger); font-size: 0.75rem; }
    }
    .role-options { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .role-option {
      padding: 0.75rem 1.25rem; border: 2px solid var(--hris-gray-200); border-radius: var(--hris-border-radius);
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; gap: 0.5rem;
      input { display: none; }
      &:hover { border-color: var(--hris-primary); }
      &.selected { border-color: var(--hris-primary); background: rgba(59, 130, 246, 0.1); }
      .role-name { font-weight: 500; }
    }
    .form-actions {
      display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem;
      padding-top: 1.5rem; border-top: 1px solid var(--hris-gray-200);
    }
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: var(--hris-gray-500); }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  userForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  selectedRoleId: string = '';
  
  roles = signal<Role[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId && this.userId !== 'new') {
      this.isEditMode = true;
      this.loadUser(this.userId);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (data) => this.roles.set(data),
      error: () => {
        // Fallback roles
        this.roles.set([
          { id: '1', namaRole: 'ADMIN' },
          { id: '2', namaRole: 'HR' },
          { id: '3', namaRole: 'KARYAWAN' }
        ]);
      }
    });
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.apiService.getOne<User>('/users', id).subscribe({
      next: (user) => {
        this.userForm.patchValue({ username: user.username });
        if (user.roles && user.roles.length > 0) {
          this.selectedRoleId = user.roles[0].id;
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data user' });
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.userForm.invalid || !this.selectedRoleId) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formValue = this.userForm.value;
    
    const payload: any = {
      username: formValue.username,
      roleId: this.selectedRoleId
    };
    
    if (formValue.password) {
      payload.password = formValue.password;
    }

    const request$ = this.isEditMode && this.userId
      ? this.apiService.put<User>('/users', this.userId, payload)
      : this.apiService.post<User>('/users', payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: this.isEditMode ? 'User diperbarui' : 'User ditambahkan'
        });
        setTimeout(() => this.router.navigate(['/users']), 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Gagal menyimpan user'
        });
      }
    });
  }
}
</div></div>
