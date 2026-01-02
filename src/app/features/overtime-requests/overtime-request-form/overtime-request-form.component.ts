import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { FileUpload } from 'primeng/fileupload';
import { NotificationService } from '../../../core/services/notification.service';

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
<div class="page-container">
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Ajukan Lembur</h1>
      <p class="page-subtitle">Isi formulir untuk mengajukan lembur</p>
    </div>
    
    <div class="hris-card" style="max-width: 600px;">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Tanggal Lembur <span class="required">*</span></label>
          <p-datepicker 
            formControlName="date"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            placeholder="Pilih tanggal"
            styleClass="w-full"
          />
        </div>
        
        <div class="d-flex gap-3">
          <div class="form-group" style="flex:1">
            <label>Jam Mulai <span class="required">*</span></label>
            <p-datepicker 
              formControlName="startTime"
              [timeOnly]="true"
              [showIcon]="true"
              placeholder="Jam mulai"
              styleClass="w-full"
            />
          </div>
          
          <div class="form-group" style="flex:1">
            <label>Jam Selesai <span class="required">*</span></label>
            <p-datepicker 
              formControlName="endTime"
              [timeOnly]="true"
              [showIcon]="true"
              placeholder="Jam selesai"
              styleClass="w-full"
            />
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
        </div>
        
        <div class="form-group">
          <label>Bukti Lembur</label>
          <p-fileupload 
            mode="basic" 
            name="evidence[]" 
            [multiple]="true"
            accept="image/*,.pdf"
            [maxFileSize]="5000000"
            chooseLabel="Upload Bukti"
            styleClass="w-full"
          />
          <small class="form-help">Upload foto atau dokumen sebagai bukti lembur (max 5MB)</small>
        </div>
        
        <div class="form-group d-flex gap-2" style="justify-content: flex-end;">
          <a routerLink="/overtime-requests" class="p-button p-button-outlined">Batal</a>
          <button pButton type="submit" label="Ajukan Lembur" icon="pi pi-send" [loading]="isLoading"></button>
        </div>
      </form>
    </div>
    </div>
</div>
  `,
  styles: [`
    .w-full { width: 100%; }
    :host ::ng-deep .p-datepicker { width: 100%; }
  `]
})
export class OvertimeRequestFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = false;

  form: FormGroup = this.fb.group({
    date: [null, Validators.required],
    startTime: [null, Validators.required],
    endTime: [null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => { c.markAsTouched(); c.markAsDirty(); });
      return;
    }
    
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.notificationService.success('Berhasil', 'Pengajuan lembur berhasil dikirim');
      this.router.navigate(['/overtime-requests']);
    }, 1000);
  }
}
