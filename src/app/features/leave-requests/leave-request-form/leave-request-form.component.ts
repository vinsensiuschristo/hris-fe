<div class="page-container"><div class="page-content">import { Component, inject } from '@angular/core';
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
              [options]="leaveTypes"
              optionLabel="name"
              optionValue="id"
              placeholder="Pilih tipe cuti"
              (onChange)="onLeaveTypeChange($event)"
              [style]="{'width': '100%'}"
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
            <label>Lampiran (Opsional)</label>
            <div class="upload-area">
              <i class="pi pi-cloud-upload"></i>
              <p>Seret file ke sini atau <span class="upload-link">pilih file</span></p>
              <small>Format: PDF, JPG, PNG (Maks. 5MB)</small>
            </div>
          </div>
          
          <div class="form-actions">
            <a routerLink="/leave-requests" class="p-button p-button-outlined">Batal</a>
            <button pButton type="submit" label="Ajukan Cuti" icon="pi pi-send" [loading]="isLoading"></button>
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
    
    .upload-area {
      border: 2px dashed #E2E8F0;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: #3B82F6;
        background: #F8FAFC;
      }
      
      i {
        font-size: 2rem;
        color: #94A3B8;
        margin-bottom: 0.5rem;
      }
      
      p {
        margin: 0 0 0.25rem;
        color: #64748B;
      }
      
      .upload-link {
        color: #3B82F6;
        font-weight: 500;
      }
      
      small {
        color: #94A3B8;
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
export class LeaveRequestFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = false;
  totalDays = 0;
  minDate = new Date();
  
  leaveTypes = [
    { id: 1, name: 'Cuti Tahunan', maxDays: 12 },
    { id: 2, name: 'Cuti Sakit', maxDays: 14 },
    { id: 3, name: 'Cuti Melahirkan', maxDays: 90 },
    { id: 4, name: 'Cuti Khusus', maxDays: 7 },
  ];
  
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

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => { c.markAsTouched(); c.markAsDirty(); });
      return;
    }
    
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.notificationService.success('Berhasil', 'Pengajuan cuti berhasil dikirim');
      this.router.navigate(['/leave-requests']);
    }, 1000);
  }
}
</div></div>
