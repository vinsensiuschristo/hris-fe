import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { NotificationService } from '../../../core/services/notification.service';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-overtime-request-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    ButtonModule, 
    DatePicker, 
    Textarea,
    FileUpload
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Ajukan Lembur</h1>
      <p class="page-subtitle">Isi formulir untuk mengajukan lembur</p>
    </div>
    
    <div class="hris-card form-card-lg">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Tanggal Lembur <span class="required">*</span></label>
          <p-datepicker 
            formControlName="date"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            placeholder="Pilih tanggal"
            [style]="{'width': '100%'}"
            appendTo="body"
            [baseZIndex]="10000"
          />
          @if (form.get('date')?.invalid && form.get('date')?.touched) {
            <small class="error-text">Tanggal wajib dipilih</small>
          }
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jam Mulai <span class="required">*</span></label>
            <p-datepicker 
              formControlName="startTime"
              [timeOnly]="true"
              [showIcon]="true"
              placeholder="Jam mulai"
              [style]="{'width': '100%'}"
              appendTo="body"
              [baseZIndex]="10000"
            />
            @if (form.get('startTime')?.invalid && form.get('startTime')?.touched) {
              <small class="error-text">Jam mulai wajib diisi</small>
            }
          </div>
          
          <div class="form-group">
            <label>Jam Selesai <span class="required">*</span></label>
            <p-datepicker 
              formControlName="endTime"
              [timeOnly]="true"
              [showIcon]="true"
              placeholder="Jam selesai"
              [style]="{'width': '100%'}"
              appendTo="body"
              [baseZIndex]="10000"
            />
            @if (form.get('endTime')?.invalid && form.get('endTime')?.touched) {
              <small class="error-text">Jam selesai wajib diisi</small>
            }
          </div>
        </div>
        
        <div class="form-group">
          <label>Deskripsi Pekerjaan <span class="required">*</span></label>
          <textarea 
            pTextarea
            formControlName="description"
            rows="4"
            placeholder="Jelaskan pekerjaan yang dilakukan saat lembur"
            class="w-full"
          ></textarea>
          @if (form.get('description')?.invalid && form.get('description')?.touched) {
            <small class="error-text">Deskripsi wajib diisi (minimal 10 karakter)</small>
          }
        </div>
        
        <div class="form-group">
          <label>Bukti Lembur (Gambar, maks 3MB)</label>
          <p-fileupload 
            mode="basic" 
            name="evidence" 
            accept="image/jpeg,image/png,image/jpg,image/webp"
            [maxFileSize]="3000000"
            chooseLabel="Pilih Gambar"
            [auto]="false"
            (onSelect)="onFileSelect($event)"
            styleClass="w-full"
          />
          @if (selectedFile()) {
            <div class="selected-file">
              <i class="pi pi-image"></i>
              <span>{{ selectedFile()?.name }}</span>
              <button type="button" class="remove-file" (click)="removeFile()">
                <i class="pi pi-times"></i>
              </button>
            </div>
          }
          <small class="form-help">Upload foto sebagai bukti lembur (JPG, PNG, maks 3MB)</small>
        </div>
        
        <div class="form-actions">
          <a routerLink="/overtime-requests" class="p-button p-button-outlined">Batal</a>
          <button pButton type="submit" label="Ajukan Lembur" icon="pi pi-send" [loading]="isLoading" [disabled]="form.invalid"></button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-card-lg {
      max-width: 600px;
      margin: 0 auto;
      padding: 1.5rem !important;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-group {
      margin-bottom: 1.25rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #475569;
      }
    }
    
    .error-text {
      color: #DC2626;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: block;
    }
    
    .form-help {
      color: #94A3B8;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: block;
    }
    
    .selected-file {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: #F1F5F9;
      border-radius: 6px;
      margin-top: 0.5rem;
      
      i { color: #3B82F6; }
      span { flex: 1; font-size: 0.875rem; color: #475569; }
      
      .remove-file {
        background: none;
        border: none;
        color: #DC2626;
        cursor: pointer;
        padding: 0.25rem;
        
        &:hover { background: #FEE2E2; border-radius: 4px; }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid #E2E8F0;
      margin-top: 1.5rem;
    }
    
    .w-full { width: 100%; }
    
    :host ::ng-deep {
      .p-datepicker { width: 100%; }
      .p-datepicker-panel { z-index: 10001 !important; }
    }
    
    @media (max-width: 576px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class OvertimeRequestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private overtimeRequestService = inject(OvertimeRequestService);
  private authService = inject(AuthService);

  isLoading = false;
  selectedFile = signal<File | null>(null);

  form: FormGroup = this.fb.group({
    date: [null, Validators.required],
    startTime: [null, Validators.required],
    endTime: [null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  get currentKaryawanId(): string | null {
    return this.authService.currentUser?.employee?.id || null;
  }

  ngOnInit(): void {
    if (!this.currentKaryawanId) {
      this.notificationService.error('Error', 'Anda harus login sebagai karyawan untuk mengajukan lembur');
      this.router.navigate(['/overtime-requests']);
    }
  }

  onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Error', 'File harus berupa gambar (JPG, PNG, WEBP)');
        return;
      }
      // Validate file size (3MB)
      if (file.size > 3 * 1024 * 1024) {
        this.notificationService.error('Error', 'Ukuran file maksimal 3MB');
        return;
      }
      this.selectedFile.set(file);
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => { c.markAsTouched(); c.markAsDirty(); });
      return;
    }

    if (!this.currentKaryawanId) {
      this.notificationService.error('Error', 'Karyawan ID tidak ditemukan');
      return;
    }
    
    this.isLoading = true;

    const formValue = this.form.value;
    const date = formValue.date as Date;
    const startTime = formValue.startTime as Date;
    const endTime = formValue.endTime as Date;

    // Validate time: start must be before end
    if (startTime >= endTime) {
      this.isLoading = false;
      this.notificationService.error('Error', 'Jam mulai harus lebih kecil dari jam selesai');
      return;
    }

    // Format date as YYYY-MM-DD
    const tglLembur = date.toISOString().split('T')[0];
    // Format time as HH:mm
    const jamMulai = startTime.toTimeString().slice(0, 5);
    const jamSelesai = endTime.toTimeString().slice(0, 5);

    const request = {
      karyawanId: this.currentKaryawanId,
      tglLembur,
      jamMulai,
      jamSelesai
    };

    this.overtimeRequestService.create(request).subscribe({
      next: (result) => {
        // If file selected, upload it
        const file = this.selectedFile();
        if (file && result.id) {
          this.overtimeRequestService.uploadEvidence(result.id, file).subscribe({
            next: () => {
              this.isLoading = false;
              this.notificationService.success('Berhasil', 'Pengajuan lembur dan bukti berhasil dikirim');
              this.router.navigate(['/overtime-requests']);
            },
            error: (uploadErr) => {
              this.isLoading = false;
              console.error('Error uploading evidence:', uploadErr);
              // Request created but evidence failed - still navigate but warn
              this.notificationService.warn('Perhatian', 'Pengajuan berhasil tapi upload bukti gagal. Anda dapat upload ulang nanti.');
              this.router.navigate(['/overtime-requests']);
            }
          });
        } else {
          this.isLoading = false;
          this.notificationService.success('Berhasil', 'Pengajuan lembur berhasil dikirim');
          this.router.navigate(['/overtime-requests']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating overtime request:', err);
        const errorMsg = err.error?.message || err.message || 'Gagal mengirim pengajuan lembur';
        this.notificationService.error('Error', errorMsg);
      }
    });
  }
}
