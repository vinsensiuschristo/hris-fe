import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveRequest } from '../../../core/models';

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-leave-approval-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonDirective, Tag, Divider, Dialog, Textarea, ToastModule, ProgressSpinner],
  providers: [MessageService],
  template: `
    <p-toast />
    @if (loading) {
      <div class="loading-container">
        <p-progressSpinner />
      </div>
    } @else if (request) {
      <div class="page-header">
        <div>
          <h1 class="page-title">Detail Persetujuan Cuti</h1>
          <p class="page-subtitle">Nomor Pengajuan: #LV-{{ request.id.substring(0, 8).toUpperCase() }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/approvals/leave" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
          @if (request.status?.namaStatus === 'MENUNGGU_PERSETUJUAN') {
            <button pButton label="Setujui" icon="pi pi-check" severity="success" (click)="approveRequest()" [loading]="processing"></button>
            <button pButton label="Tolak" icon="pi pi-times" severity="danger" [outlined]="true" (click)="showRejectDialog = true"></button>
          }
        </div>
      </div>
      
      <div class="detail-grid">
        <!-- Main Info Card -->
        <div class="hris-card main-card">
          <div class="card-header">
            <h3>Informasi Pengajuan Cuti</h3>
            <p-tag [value]="getStatusLabel(request.status?.namaStatus)" [severity]="getStatusSeverity(request.status?.namaStatus)" [style]="{'font-size': '0.875rem', 'padding': '0.5rem 1rem'}" />
          </div>
          
          <div class="card-body">
            <!-- Leave Type Badge -->
            <div class="type-badge leave">
              <i class="pi pi-calendar-plus"></i>
              <span>{{ request.jenisCuti?.namaJenis || '-' }}</span>
            </div>
            
            <!-- Date Info -->
            <div class="date-section">
              <div class="date-card start">
                <div class="date-icon"><i class="pi pi-calendar"></i></div>
                <div class="date-info">
                  <span class="date-label">Tanggal Mulai</span>
                  <span class="date-value">{{ request.tglMulai }}</span>
                </div>
              </div>
              
              <div class="date-connector">
                <div class="connector-line"></div>
                <div class="connector-badge">{{ request.jumlahHari }} Hari</div>
                <div class="connector-line"></div>
              </div>
              
              <div class="date-card end">
                <div class="date-icon"><i class="pi pi-calendar-times"></i></div>
                <div class="date-info">
                  <span class="date-label">Tanggal Selesai</span>
                  <span class="date-value">{{ request.tglSelesai }}</span>
                </div>
              </div>
            </div>
            
            <p-divider />
            
            <!-- Reason Card -->
            <div class="reason-card">
              <div class="reason-header">
                <div class="reason-icon"><i class="pi pi-file-edit"></i></div>
                <h4>Alasan Cuti</h4>
              </div>
              <div class="reason-body">
                <i class="pi pi-quote-left quote-icon"></i>
                <p>{{ request.alasan || '-' }}</p>
              </div>
            </div>

            <!-- Rejection Reason (if rejected) -->
            @if (request.status?.namaStatus === 'DITOLAK' && request.alasanPenolakan) {
              <div class="rejection-card">
                <div class="reason-header">
                  <div class="reason-icon reject"><i class="pi pi-times-circle"></i></div>
                  <h4>Alasan Penolakan</h4>
                </div>
                <div class="reason-body">
                  <p class="reject-text">{{ request.alasanPenolakan }}</p>
                </div>
              </div>
            }
          </div>
        </div>
        
        <!-- Right Sidebar -->
        <div class="sidebar-cards">
          <!-- Employee Info -->
          <div class="hris-card employee-card">
            <div class="card-header"><h3>Pengaju</h3></div>
            <div class="card-body">
              <div class="employee-profile">
                <div class="employee-info">
                  <span class="employee-name">{{ request.karyawan?.nama || '-' }}</span>
                  <span class="employee-code"><i class="pi pi-id-card"></i> {{ request.karyawan?.nik || '-' }}</span>
                  <div class="employee-tags">
                    <span class="dept-tag">{{ request.karyawan?.departemen?.namaDepartement || '-' }}</span>
                    <span class="pos-tag">{{ request.karyawan?.jabatan?.namaJabatan || '-' }}</span>
                  </div>
                  <span class="leave-balance"><i class="pi pi-calendar"></i> Sisa Cuti: {{ request.karyawan?.sisaCuti || 0 }} hari</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Timeline -->
          <div class="hris-card">
            <div class="card-header"><h3>Riwayat Status</h3></div>
            <div class="card-body timeline-body">
              @for (event of timeline; track $index) {
                <div class="timeline-item" [class.active]="$index === 0">
                  <div class="timeline-icon" [style.background]="event.color">
                    <i [class]="'pi ' + event.icon"></i>
                  </div>
                  <div class="timeline-content">
                    <span class="timeline-status">{{ event.status }}</span>
                    <span class="timeline-desc">{{ event.description }}</span>
                    <span class="timeline-date"><i class="pi pi-clock"></i> {{ event.date }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
          
          <!-- Action Card for Pending -->
          @if (request.status?.namaStatus === 'MENUNGGU_PERSETUJUAN') {
            <div class="hris-card action-card">
              <div class="card-body">
                <h4><i class="pi pi-info-circle"></i> Menunggu Persetujuan Anda</h4>
                <p>Silakan tinjau pengajuan ini dan berikan keputusan.</p>
                <div class="action-buttons">
                  <button pButton label="Setujui" icon="pi pi-check" severity="success" (click)="approveRequest()" [loading]="processing"></button>
                  <button pButton label="Tolak" icon="pi pi-times" severity="danger" [outlined]="true" (click)="showRejectDialog = true"></button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      
      <!-- Reject Dialog -->
      <p-dialog header="Tolak Pengajuan Cuti" [(visible)]="showRejectDialog" [modal]="true" [style]="{'width': '450px'}">
        <div class="reject-form">
          <label>Alasan Penolakan <span class="required">*</span></label>
          <textarea pTextarea [(ngModel)]="rejectReason" rows="4" placeholder="Masukkan alasan penolakan..."></textarea>
        </div>
        <ng-template pTemplate="footer">
          <button pButton label="Batal" [text]="true" (click)="showRejectDialog = false"></button>
          <button pButton label="Tolak Pengajuan" severity="danger" icon="pi pi-times" (click)="rejectRequest()" [loading]="processing"></button>
        </ng-template>
      </p-dialog>
    } @else {
      <div class="error-container">
        <i class="pi pi-exclamation-triangle"></i>
        <p>Pengajuan tidak ditemukan</p>
        <a routerLink="/approvals/leave" pButton label="Kembali" icon="pi pi-arrow-left"></a>
      </div>
    }
  `,
  styles: [`
    .loading-container { display: flex; align-items: center; justify-content: center; min-height: 400px; }
    .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1rem; color: #64748B; i { font-size: 3rem; color: #F59E0B; } }
    .header-actions { display: flex; gap: 0.75rem; }
    
    .type-badge {
      display: inline-flex; align-items: center; gap: 0.625rem;
      padding: 0.625rem 1.25rem; border-radius: 50px;
      font-weight: 600; font-size: 0.9375rem; margin-bottom: 1.5rem;
      i { font-size: 1.125rem; }
      &.leave { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }
    }
    
    .date-section { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius: 16px; border: 1px solid #E2E8F0; }
    .date-card { display: flex; align-items: center; gap: 1rem; flex: 1; padding: 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
    .date-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); i { color: white; font-size: 1.25rem; } }
    .date-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .date-label { font-size: 0.75rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
    .date-value { font-size: 1.125rem; font-weight: 600; color: #1E293B; }
    .date-connector { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .connector-line { width: 2px; height: 20px; background: linear-gradient(180deg, #CBD5E1, #94A3B8); border-radius: 1px; }
    .connector-badge { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 0.375rem 0.875rem; border-radius: 50px; font-size: 0.8125rem; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3); }
    
    .reason-card, .rejection-card { background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; margin-top: 1rem; }
    .rejection-card { border-color: #FECACA; background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); }
    .reason-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: white; border-bottom: 1px solid #E2E8F0; }
    .rejection-card .reason-header { background: #FEF2F2; border-bottom-color: #FECACA; }
    .reason-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #3B82F6, #2563EB); display: flex; align-items: center; justify-content: center; i { color: white; font-size: 1rem; } }
    .reason-icon.reject { background: linear-gradient(135deg, #EF4444, #DC2626); }
    .reason-header h4 { margin: 0; font-size: 1rem; font-weight: 600; color: #1E293B; }
    .reason-body { padding: 1.25rem; position: relative; }
    .quote-icon { position: absolute; top: 0.75rem; left: 1rem; font-size: 1.5rem; color: #CBD5E1; opacity: 0.6; }
    .reason-body p { margin: 0; padding-left: 1.5rem; color: #334155; font-size: 0.9375rem; line-height: 1.75; font-style: normal; }
    .reject-text { color: #DC2626 !important; padding-left: 0 !important; }
    
    .employee-card .card-body { padding: 1.5rem; }
    .employee-profile { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; }
    .employee-info { display: flex; flex-direction: column; gap: 0.375rem; }
    .employee-name { font-size: 1.125rem; font-weight: 600; color: #1E293B; }
    .employee-code { display: flex; align-items: center; justify-content: center; gap: 0.375rem; font-size: 0.8125rem; color: #64748B; i { font-size: 0.75rem; } }
    .employee-tags { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .dept-tag, .pos-tag { padding: 0.25rem 0.625rem; border-radius: 50px; font-size: 0.6875rem; font-weight: 500; }
    .dept-tag { background: #DBEAFE; color: #1D4ED8; }
    .pos-tag { background: #F3E8FF; color: #7C3AED; }
    .leave-balance { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: #059669; margin-top: 0.5rem; i { font-size: 0.75rem; } }
    
    .action-card .card-body {
      h4 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.5rem; font-size: 1rem; color: #1E293B; i { color: #F59E0B; } }
      p { margin: 0 0 1rem; font-size: 0.875rem; color: #64748B; }
      .action-buttons { display: flex; gap: 0.5rem; }
    }
    
    .reject-form {
      label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #475569; .required { color: #EF4444; } }
      textarea { width: 100%; }
    }
    
    .timeline-body { padding: 1rem; }
    .timeline-item { display: flex; gap: 1rem; padding: 0.75rem 0; border-left: 2px solid #E2E8F0; margin-left: 1rem; padding-left: 1.5rem; position: relative; }
    .timeline-item.active { border-left-color: #3B82F6; }
    .timeline-icon { position: absolute; left: -0.75rem; width: 1.5rem; height: 1.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; i { font-size: 0.625rem; color: white; } }
    .timeline-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .timeline-status { font-weight: 600; font-size: 0.875rem; color: #1E293B; }
    .timeline-desc { font-size: 0.75rem; color: #64748B; }
    .timeline-date { display: flex; align-items: center; gap: 0.25rem; font-size: 0.6875rem; color: #94A3B8; i { font-size: 0.625rem; } }
    
    @media (max-width: 768px) {
      .date-section { flex-direction: column; }
      .date-card { width: 100%; }
      .date-connector { flex-direction: row; width: 100%; .connector-line { width: 100%; height: 2px; } }
    }
  `]
})
export class LeaveApprovalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leaveService = inject(LeaveRequestService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  
  loading = true;
  processing = false;
  showRejectDialog = false;
  rejectReason = '';
  
  request: LeaveRequest | null = null;
  timeline: TimelineEvent[] = [];
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRequest(id);
    } else {
      this.loading = false;
    }
  }
  
  loadRequest(id: string): void {
    this.leaveService.getById(id).subscribe({
      next: (data) => {
        this.request = data;
        this.buildTimeline();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading request:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data pengajuan' });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  buildTimeline(): void {
    if (!this.request) return;
    
    const createdDate = this.request.createdAt ? new Date(this.request.createdAt).toLocaleString('id-ID') : '-';
    const updatedDate = this.request.updatedAt ? new Date(this.request.updatedAt).toLocaleString('id-ID') : createdDate;
    
    this.timeline = [];
    
    if (this.request.status?.namaStatus === 'DISETUJUI') {
      this.timeline.push({ status: 'Disetujui', date: updatedDate, icon: 'pi-check', color: '#22C55E', description: 'Pengajuan telah disetujui' });
    } else if (this.request.status?.namaStatus === 'DITOLAK') {
      this.timeline.push({ status: 'Ditolak', date: updatedDate, icon: 'pi-times', color: '#EF4444', description: this.request.alasanPenolakan || 'Pengajuan ditolak' });
    } else {
      this.timeline.push({ status: 'Menunggu Persetujuan', date: createdDate, icon: 'pi-clock', color: '#F59E0B', description: 'Pengajuan dalam proses review' });
    }
    
    this.timeline.push({ status: 'Pengajuan Dibuat', date: createdDate, icon: 'pi-plus', color: '#3B82F6', description: `Oleh ${this.request.karyawan?.nama || '-'}` });
  }
  
  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  
  getStatusLabel(status?: string): string {
    switch (status) { 
      case 'DISETUJUI': return 'Disetujui'; 
      case 'MENUNGGU_PERSETUJUAN': return 'Menunggu'; 
      case 'DITOLAK': return 'Ditolak'; 
      default: return status || '-'; 
    }
  }
  
  getStatusSeverity(status?: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (status) { 
      case 'DISETUJUI': return 'success'; 
      case 'MENUNGGU_PERSETUJUAN': return 'warn'; 
      case 'DITOLAK': return 'danger'; 
      default: return 'info'; 
    }
  }
  
  approveRequest(): void {
    if (!this.request) return;
    this.processing = true;
    
    this.leaveService.approve(this.request.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengajuan cuti disetujui' });
        this.processing = false;
        setTimeout(() => this.router.navigate(['/approvals/leave']), 1500);
      },
      error: (err) => {
        console.error('Error approving:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal menyetujui pengajuan' });
        this.processing = false;
      }
    });
  }
  
  rejectRequest(): void {
    if (!this.request || !this.rejectReason.trim()) return;
    this.processing = true;
    
    this.leaveService.reject(this.request.id, this.rejectReason).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengajuan cuti ditolak' });
        this.showRejectDialog = false;
        this.processing = false;
        setTimeout(() => this.router.navigate(['/approvals/leave']), 1500);
      },
      error: (err) => {
        console.error('Error rejecting:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Gagal menolak pengajuan' });
        this.processing = false;
      }
    });
  }
}
