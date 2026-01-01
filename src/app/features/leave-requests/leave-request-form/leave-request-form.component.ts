<div class="page-container"><div class="page-content">import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Card } from 'primeng/card';
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
    Card
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Ajukan Cuti</h1>
        <p class="page-subtitle">Isi formulir untuk mengajukan cuti</p>
      </div>
    </div>
    
    <div class="hris-card" style="max-width: 600px;">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Tipe Cuti <span class="required">*</span></label>
          <p-select 
            formControlName="leaveTypeId"
            [options]="leaveTypes"
            optionLabel="name"
            optionValue="id"
            placeholder="Pilih tipe cuti"
            styleClass="w-full"
          />
        </div>
        
        <div class="form-group">
          <label>Tanggal Mulai <span class="required">*</span></label>
          <p-datepicker 
            formControlName="startDate"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            placeholder="Pilih tanggal mulai"
            styleClass="w-full"
          />
        </div>
        
        <div class="form-group">
          <label>Tanggal Selesai <span class="required">*</span></label>
          <p-datepicker 
            formControlName="endDate"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            placeholder="Pilih tanggal selesai"
            styleClass="w-full"
          />
        </div>
        
        <div class="form-group">
          <label>Alasan <span class="required">*</span></label>
          <textarea 
            pTextarea
            formControlName="reason"
            rows="4"
            placeholder="Tulis alasan pengajuan cuti"
            class="w-full"
          ></textarea>
        </div>
        
        <div class="form-group d-flex gap-2" style="justify-content: flex-end;">
          <a routerLink="/leave-requests" class="p-button p-button-outlined">Batal</a>
          <button pButton type="submit" label="Ajukan Cuti" icon="pi pi-send" [loading]="isLoading"></button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .w-full { width: 100%; }
    :host ::ng-deep .p-datepicker, :host ::ng-deep .p-select { width: 100%; }
  `]
})
export class LeaveRequestFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = false;
  
  leaveTypes = [
    { id: 1, name: 'Cuti Tahunan' },
    { id: 2, name: 'Cuti Sakit' },
    { id: 3, name: 'Cuti Melahirkan' },
    { id: 4, name: 'Cuti Khusus' },
  ];

  form: FormGroup = this.fb.group({
    leaveTypeId: [null, Validators.required],
    startDate: [null, Validators.required],
    endDate: [null, Validators.required],
    reason: ['', [Validators.required, Validators.minLength(10)]]
  });

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
