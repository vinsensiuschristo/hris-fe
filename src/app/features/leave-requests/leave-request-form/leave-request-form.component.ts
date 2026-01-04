import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';

import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Card } from 'primeng/card';
import { FileUpload } from 'primeng/fileupload';
import { NotificationService } from '../../../core/services/notification.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveTypeService } from '../../../core/services/master-data.service';

@Component({
  selector: 'app-leave-request-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    ButtonModule, 
    DatePicker, 
    Select, 
    Textarea,
    Card,
    FileUpload
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Ajukan Cuti</h1>
        <p class="page-subtitle">Isi formulir untuk mengajukan cuti</p>
      </div>
    </div>
    
    <div class="form-layout">
      <!-- Main Form -->
      <div class="hris-card form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Tipe Cuti <span class="required">*</span></label>
            <p-select 
              formControlName="leaveTypeId"
              [options]="leaveTypes()"
              optionLabel="namaJenis"
              optionValue="id"
              placeholder="Pilih tipe cuti"
              (onChange)="onLeaveTypeChange($event)"
              [style]="{'width': '100%'}"
              [loading]="loadingTypes()"
            />
            @if (form.get('leaveTypeId')?.invalid && form.get('leaveTypeId')?.touched) {
              <small class="error-text">Tipe cuti wajib dipilih</small>
            }
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Tanggal Mulai <span class="required">*</span></label>
              <p-datepicker 
                formControlName="startDate"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                placeholder="Pilih tanggal mulai"
                [minDate]="minDate"
                (onSelect)="calculateDays()"
                appendTo="body"
                [baseZIndex]="10000"
                [style]="{'width': '100%'}"
              />
              @if (form.get('startDate')?.invalid && form.get('startDate')?.touched) {
                <small class="error-text">Tanggal mulai wajib diisi</small>
              }
            </div>
            
            <div class="form-group">
              <label>Tanggal Selesai <span class="required">*</span></label>
              <p-datepicker 
                formControlName="endDate"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                placeholder="Pilih tanggal selesai"
                [minDate]="form.get('startDate')?.value || minDate"
                (onSelect)="calculateDays()"
                appendTo="body"
                [baseZIndex]="10000"
                [style]="{'width': '100%'}"
              />
              @if (form.get('endDate')?.invalid && form.get('endDate')?.touched) {
                <small class="error-text">Tanggal selesai wajib diisi</small>
              }
            </div>
          </div>
          
          @if (totalDays > 0) {
            <div class="days-summary">
              <i class="pi pi-calendar"></i>
              <span>Total: <strong>{{ totalDays }} hari kerja</strong></span>
            </div>
          }

          <div class="form-group">
            <label>Alasan <span class="required">*</span></label>
            <textarea 
              pTextarea
              formControlName="reason"
              rows="4"
              placeholder="Jelaskan alasan pengajuan cuti Anda (minimal 10 karakter)"
              class="w-full"
            ></textarea>
            @if (form.get('reason')?.invalid && form.get('reason')?.touched) {
              <small class="error-text">Alasan wajib diisi (minimal 10 karakter)</small>
            }
          </div>
          
          <div class="form-group">
            <label>Lampiran (Gambar atau PDF, maks 5MB)</label>
            <p-fileupload 
              mode="basic" 
              name="attachment" 
              accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
              [maxFileSize]="5000000"
              chooseLabel="Pilih File"
              [auto]="false"
              (onSelect)="onFileSelect($event)"
              styleClass="w-full"
            />
            @if (selectedFile()) {
              <div class="selected-file">
                <i [class]="selectedFile()?.type?.includes('pdf') ? 'pi pi-file-pdf' : 'pi pi-image'"></i>
                <span>{{ selectedFile()?.name }}</span>
                <span class="file-size">({{ formatFileSize(selectedFile()?.size || 0) }})</span>
                <button type="button" class="remove-file" (click)="removeFile()">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            }
            <small class="form-help">Upload surat dokter atau bukti pendukung (JPG, PNG, PDF, maks 5MB)</small>
          </div>
          
          <div class="form-actions">
            <a routerLink="/leave-requests" class="p-button p-button-outlined">Batal</a>
            <button pButton type="submit" label="Ajukan Cuti" icon="pi pi-send" [loading]="isLoading" [disabled]="form.invalid"></button>
          </div>
        </form>
      </div>
      
      <!-- Sidebar Info -->
      <div class="sidebar-info">
        <!-- Leave Balance Card -->
        <div class="hris-card info-card">
          <div class="info-header">
            <i class="pi pi-chart-pie"></i>
            <h4>Sisa Cuti Anda</h4>
          </div>
          
          <div class="balance-list">
            @for (balance of leaveBalances; track balance.type) {
              <div class="balance-item">
                <div class="balance-info">
                  <span class="balance-type">{{ balance.type }}</span>
                  <span class="balance-detail">{{ balance.used }} dari {{ balance.total }} digunakan</span>
                </div>
                <div class="balance-value" [class.low]="balance.remaining <= 2">
                  {{ balance.remaining }} hari
                </div>
              </div>
            }
          </div>
        </div>
        
        <!-- Tips Card -->
        <div class="hris-card info-card tips-card">
          <div class="info-header">
            <i class="pi pi-info-circle"></i>
            <h4>Informasi</h4>
          </div>
          
          <ul class="tips-list">
            <li><i class="pi pi-check-circle"></i> Pengajuan akan direview oleh atasan langsung</li>
            <li><i class="pi pi-check-circle"></i> Proses persetujuan maksimal 3 hari kerja</li>
            <li><i class="pi pi-check-circle"></i> Cuti minimal diajukan 3 hari sebelumnya</li>
            <li><i class="pi pi-check-circle"></i> Lampirkan surat dokter untuk cuti sakit</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
      align-items: start;
    }
    
    .form-card {
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
      span { font-size: 0.875rem; color: #475569; }
      .file-size { color: #94A3B8; font-size: 0.75rem; }
      
      .remove-file {
        background: none;
        border: none;
        color: #DC2626;
        cursor: pointer;
        padding: 0.25rem;
        margin-left: auto;
        
        &:hover { background: #FEE2E2; border-radius: 4px; }
      }
    }
    
    .days-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #DBEAFE;
      border-radius: 8px;
      color: #1D4ED8;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
      
      i { font-size: 1rem; }
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
    
    /* Sidebar */
    .sidebar-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .info-card {
      padding: 1.25rem !important;
    }
    
    .info-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #E2E8F0;
      
      i {
        color: #3B82F6;
        font-size: 1.125rem;
      }
      
      h4 {
        margin: 0;
        font-size: 0.9375rem;
        font-weight: 600;
        color: #1E293B;
      }
    }
    
    .balance-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .balance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #F1F5F9;
      
      &:last-child { border-bottom: none; }
    }
    
    .balance-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    
    .balance-type {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1E293B;
    }
    
    .balance-detail {
      font-size: 0.75rem;
      color: #94A3B8;
    }
    
    .balance-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #059669;
      
      &.low {
        color: #DC2626;
      }
    }
    
    .tips-card {
      background: linear-gradient(135deg, #EFF6FF, #DBEAFE) !important;
    }
    
    .tips-list {
      margin: 0;
      padding: 0;
      list-style: none;
      
      li {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: 0.8125rem;
        color: #475569;
        margin-bottom: 0.625rem;
        
        &:last-child { margin-bottom: 0; }
        
        i {
          color: #3B82F6;
          font-size: 0.75rem;
          margin-top: 0.125rem;
        }
      }
    }
    
    @media (max-width: 992px) {
      .form-layout {
        grid-template-columns: 1fr;
      }
      
      .sidebar-info {
        order: -1;
      }
    }
    
    @media (max-width: 576px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LeaveRequestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private leaveRequestService = inject(LeaveRequestService);
  private leaveTypeService = inject(LeaveTypeService);
  private authService = inject(AuthService);

  isLoading = false;
  totalDays = 0;
  minDate = new Date();
  
  leaveTypes = signal<any[]>([]);
  loadingTypes = signal<boolean>(true);
  selectedFile = signal<File | null>(null);
  
  leaveBalances = [
    { type: 'Cuti Tahunan', total: 12, used: 5, remaining: 7 },
    { type: 'Cuti Sakit', total: 14, used: 2, remaining: 12 },
    { type: 'Cuti Khusus', total: 7, used: 6, remaining: 1 },
  ];

  form: FormGroup = this.fb.group({
    leaveTypeId: [null, Validators.required],
    startDate: [null, Validators.required],
    endDate: [null, Validators.required],
    reason: ['', [Validators.required, Validators.minLength(10)]]
  });

  get currentKaryawanId(): string | null {
    return this.authService.currentUser?.employee?.id || null;
  }

  ngOnInit(): void {
    this.loadLeaveTypes();

    if (!this.currentKaryawanId) {
      this.notificationService.error('Error', 'Anda harus login sebagai karyawan untuk mengajukan cuti');
      this.router.navigate(['/leave-requests']);
    }
  }

  private loadLeaveTypes(): void {
    this.loadingTypes.set(true);
    this.leaveTypeService.getAll().subscribe({
      next: (types) => {
        this.leaveTypes.set(types);
        this.loadingTypes.set(false);
      },
      error: (err) => {
        console.error('Error loading leave types:', err);
        this.loadingTypes.set(false);
      }
    });
  }
  
  onLeaveTypeChange(event: any): void {
    // Could update maxDays validation here
  }
  
  calculateDays(): void {
    const start = this.form.get('startDate')?.value;
    const end = this.form.get('endDate')?.value;
    
    if (start && end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Error', 'File harus berupa gambar (JPG, PNG, WEBP) atau PDF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('Error', 'Ukuran file maksimal 5MB');
        return;
      }
      this.selectedFile.set(file);
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    const startDate = formValue.startDate as Date;
    const endDate = formValue.endDate as Date;

    const request = {
      karyawanId: this.currentKaryawanId,
      jenisCutiId: formValue.leaveTypeId,
      tglMulai: startDate.toISOString().split('T')[0],
      tglSelesai: endDate.toISOString().split('T')[0],
      alasan: formValue.reason
    };

    this.leaveRequestService.create(request).subscribe({
      next: (result) => {
        console.log('=== Leave request created ===', result);
        console.log('Result ID:', result?.id);
        // If file selected, upload it
        const file = this.selectedFile();
        console.log('Selected file:', file);
        if (file && result.id) {
          console.log('=== Starting evidence upload ===');
          this.leaveRequestService.uploadEvidence(result.id, file).subscribe({
            next: (uploadResult) => {
              console.log('=== Evidence upload success ===', uploadResult);
              this.isLoading = false;
              this.notificationService.success('Berhasil', 'Pengajuan cuti dan bukti berhasil dikirim');
              this.router.navigate(['/leave-requests']);
            },
            error: (uploadErr) => {
              console.error('=== Evidence upload error ===', uploadErr);
              this.isLoading = false;
              // Request created but evidence failed - still navigate but warn
              this.notificationService.warn('Perhatian', 'Pengajuan berhasil tapi upload bukti gagal. Anda dapat upload ulang nanti.');
              this.router.navigate(['/leave-requests']);
            }
          });
        } else {
          console.log('=== No file to upload or no result ID ===');
          this.isLoading = false;
          this.notificationService.success('Berhasil', 'Pengajuan cuti berhasil dikirim');
          this.router.navigate(['/leave-requests']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating leave request:', err);
        const errorMsg = err.error?.message || err.message || 'Gagal mengirim pengajuan cuti';
        this.notificationService.error('Error', errorMsg);
      }
    });
  }
}
