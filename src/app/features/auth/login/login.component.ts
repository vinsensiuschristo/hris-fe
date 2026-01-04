import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { Toast } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    Toast
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.notificationService.success('Login Berhasil', `Selamat datang, ${response.user?.employee?.nama?.split(' ')[0] || response.user?.username || 'User'}!`);
        
        // Redirect to return URL or dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.isLoading.set(false);
        
        // Check if it's a network error (ProgressEvent) or server unreachable
        if (error.error instanceof ProgressEvent || error.status === 0) {
          this.notificationService.error('Kesalahan Jaringan', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        } else if (error.status === 401) {
          this.notificationService.error('Login Gagal', 'Username atau password salah');
        } else {
          const message = error?.error?.message || 'Terjadi kesalahan saat login';
          this.notificationService.error('Login Gagal', message);
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  // Getter untuk validasi
  get usernameInvalid(): boolean {
    const control = this.loginForm.get('username');
    return !!(control?.invalid && control?.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.get('password');
    return !!(control?.invalid && control?.touched);
  }
}
