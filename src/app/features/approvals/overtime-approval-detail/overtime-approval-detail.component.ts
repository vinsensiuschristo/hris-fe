import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Divider } from 'primeng/divider';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

interface OvertimeRequest {
  id: number;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-overtime-approval-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonDirective, Tag, Avatar, Divider, Dialog, Textarea],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Detail Persetujuan Lembur</h1>
        <p class="page-subtitle">Nomor Pengajuan: #OT-{{ request.id.toString().padStart(5, '0') }}</p>
      </div>
      <div class="header-actions">
        <a routerLink="/approvals/overtime" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
        @if (request.status === 'PENDING') {
          <button pButton label="Setujui" icon="pi pi-check" severity="success" (click)="approveRequest()"></button>
          <button pButton label="Tolak" icon="pi pi-times" severity="danger" [outlined]="true" (click)="showRejectDialog = true"></button>
        }
      </div>
    </div>
    
    <div class="detail-grid">
      <!-- Main Info Card -->
      <div class="hris-card main-card">
        <div class="card-header">
          <h3>Informasi Pengajuan Lembur</h3>
          <p-tag [value]="getStatusLabel(request.status)" [severity]="getStatusSeverity(request.status)" [style]="{'font-size': '0.875rem', 'padding': '0.5rem 1rem'}" />
        </div>
        
        <div class="card-body">
          <!-- Overtime Badge -->
          <div class="type-badge overtime">
            <i class="pi pi-stopwatch"></i>
            <span>Lembur</span>
          </div>
          
          <!-- DateTime Info -->
          <div class="datetime-section">
            <div class="date-card">
              <div class="date-icon"><i class="pi pi-calendar"></i></div>
              <div class="date-info">
                <span class="date-label">Tanggal Lembur</span>
                <span class="date-value">{{ request.date }}</span>
              </div>
            </div>
            
            <div class="time-range-card">
              <div class="time-box">
                <span class="time-label">Mulai</span>
                <span class="time-value">{{ request.startTime }}</span>
              </div>
              <div class="time-connector"><i class="pi pi-arrow-right"></i></div>
              <div class="time-box">
                <span class="time-label">Selesai</span>
                <span class="time-value">{{ request.endTime }}</span>
              </div>
              <div class="hours-badge">
                <span class="hours-value">{{ request.totalHours }}</span>
                <span class="hours-label">Jam</span>
              </div>
            </div>
          </div>
          
          <p-divider />
          
          <!-- Reason Card -->
          <div class="reason-card">
            <div class="reason-header">
              <div class="reason-icon"><i class="pi pi-file-edit"></i></div>
              <h4>Alasan Lembur</h4>
            </div>
            <div class="reason-body">
              <i class="pi pi-quote-left quote-icon"></i>
              <p>{{ request.reason }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Sidebar -->
      <div class="sidebar-cards">
        <!-- Employee Info -->
        <div class="hris-card employee-card">
          <div class="card-header"><h3>Pengaju</h3></div>
          <div class="card-body">
            <div class="employee-profile">
              <div class="avatar-wrapper">
                <p-avatar [label]="getInitials(request.employeeName)" size="xlarge" shape="circle" [style]="{'background': 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 'color': 'white', 'font-size': '1.25rem', 'font-weight': '600'}" />
              </div>
              <div class="employee-info">
                <span class="employee-name">{{ request.employeeName }}</span>
                <span class="employee-code"><i class="pi pi-id-card"></i> {{ request.employeeCode }}</span>
                <div class="employee-tags">
                  <span class="dept-tag">{{ request.department }}</span>
                  <span class="pos-tag">{{ request.position }}</span>
                </div>
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
        @if (request.status === 'PENDING') {
          <div class="hris-card action-card">
            <div class="card-body">
              <h4><i class="pi pi-info-circle"></i> Menunggu Persetujuan Anda</h4>
              <p>Silakan tinjau pengajuan ini dan berikan keputusan.</p>
              <div class="action-buttons">
                <button pButton label="Setujui" icon="pi pi-check" severity="success" (click)="approveRequest()"></button>
                <button pButton label="Tolak" icon="pi pi-times" severity="danger" [outlined]="true" (click)="showRejectDialog = true"></button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
    
    <!-- Reject Dialog -->
    <p-dialog header="Tolak Pengajuan Lembur" [(visible)]="showRejectDialog" [modal]="true" [style]="{'width': '450px'}">
      <div class="reject-form">
        <label>Alasan Penolakan <span class="required">*</span></label>
        <textarea pTextarea [(ngModel)]="rejectReason" rows="4" placeholder="Masukkan alasan penolakan..."></textarea>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="showRejectDialog = false"></button>
        <button pButton label="Tolak Pengajuan" severity="danger" icon="pi pi-times" (click)="rejectRequest()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .header-actions { display: flex; gap: 0.75rem; }
    
    .type-badge {
      display: inline-flex; align-items: center; gap: 0.625rem;
      padding: 0.625rem 1.25rem; border-radius: 50px;
      font-weight: 600; font-size: 0.9375rem; margin-bottom: 1.5rem;
      i { font-size: 1.125rem; }
      &.overtime { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
    }
    
    .datetime-section { display: flex; flex-direction: column; gap: 1rem; }
    .date-card { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius: 12px; border: 1px solid #E2E8F0; }
    .date-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); i { color: white; font-size: 1.125rem; } }
    .date-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .date-label { font-size: 0.75rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
    .date-value { font-size: 1.125rem; font-weight: 600; color: #1E293B; }
    
    .time-range-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: white; border-radius: 12px; border: 1px solid #E2E8F0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
    .time-box { display: flex; flex-direction: column; gap: 0.25rem; }
    .time-label { font-size: 0.75rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
    .time-value { font-size: 1.75rem; font-weight: 700; color: #1E293B; font-family: 'JetBrains Mono', monospace; }
    .time-connector { color: #94A3B8; font-size: 1.25rem; padding: 0 0.5rem; }
    .hours-badge { margin-left: auto; display: flex; flex-direction: column; align-items: center; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 0.875rem 1.5rem; border-radius: 14px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.35); }
    .hours-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .hours-label { font-size: 0.75rem; opacity: 0.9; margin-top: 0.125rem; }
    
    .reason-card { background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
    .reason-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: white; border-bottom: 1px solid #E2E8F0; }
    .reason-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #8B5CF6, #7C3AED); display: flex; align-items: center; justify-content: center; i { color: white; font-size: 1rem; } }
    .reason-header h4 { margin: 0; font-size: 1rem; font-weight: 600; color: #1E293B; }
    .reason-body { padding: 1.25rem; position: relative; }
    .quote-icon { position: absolute; top: 0.75rem; left: 1rem; font-size: 1.5rem; color: #C4B5FD; opacity: 0.6; }
    .reason-body p { margin: 0; padding-left: 1.5rem; color: #334155; font-size: 0.9375rem; line-height: 1.75; font-style: normal; }
    
    .employee-card .card-body { padding: 1.5rem; }
    .employee-profile { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; }
    .employee-info { display: flex; flex-direction: column; gap: 0.375rem; }
    .employee-name { font-size: 1.125rem; font-weight: 600; color: #1E293B; }
    .employee-code { display: flex; align-items: center; justify-content: center; gap: 0.375rem; font-size: 0.8125rem; color: #64748B; i { font-size: 0.75rem; } }
    .employee-tags { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .dept-tag, .pos-tag { padding: 0.25rem 0.625rem; border-radius: 50px; font-size: 0.6875rem; font-weight: 500; }
    .dept-tag { background: #EDE9FE; color: #7C3AED; }
    .pos-tag { background: #DBEAFE; color: #1D4ED8; }
    
    .action-card .card-body {
      h4 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.5rem; font-size: 1rem; color: #1E293B; i { color: #8B5CF6; } }
      p { margin: 0 0 1rem; font-size: 0.875rem; color: #64748B; }
      .action-buttons { display: flex; gap: 0.5rem; }
    }
    
    .reject-form {
      label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #475569; .required { color: #EF4444; } }
      textarea { width: 100%; }
    }
    
    @media (max-width: 768px) {
      .time-range-card { flex-wrap: wrap; .hours-badge { width: 100%; margin-top: 0.5rem; } }
    }
  `]
})
export class OvertimeApprovalDetailComponent implements OnInit {
  showRejectDialog = false;
  rejectReason = '';
  
  request: OvertimeRequest = {
    id: 1,
    employeeName: 'Ahmad Fauzi',
    employeeCode: 'EMP001',
    department: 'IT',
    position: 'Senior Developer',
    date: '15 Jan 2024',
    startTime: '18:00',
    endTime: '21:00',
    totalHours: 3,
    reason: 'Deadline proyek sistem inventory yang harus selesai besok. Perlu menyelesaikan modul laporan stok dan integrasi dengan sistem akuntansi agar dapat di-deploy sesuai jadwal.',
    status: 'PENDING',
    createdAt: '15 Jan 2024, 16:30'
  };
  
  timeline: TimelineEvent[] = [];
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.buildTimeline();
  }
  
  buildTimeline(): void {
    this.timeline = [
      { status: 'Menunggu Persetujuan', date: this.request.createdAt, icon: 'pi-clock', color: '#F59E0B', description: 'Pengajuan dalam proses review HR' },
      { status: 'Pengajuan Dibuat', date: this.request.createdAt, icon: 'pi-plus', color: '#8B5CF6', description: `Oleh ${this.request.employeeName}` }
    ];
  }
  
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  
  getStatusLabel(status: string): string {
    switch (status) { case 'APPROVED': return 'Disetujui'; case 'PENDING': return 'Menunggu'; case 'REJECTED': return 'Ditolak'; default: return status; }
  }
  
  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (status) { case 'APPROVED': return 'success'; case 'PENDING': return 'warn'; case 'REJECTED': return 'danger'; default: return 'info'; }
  }
  
  approveRequest(): void {
    console.log('Approving request...');
  }
  
  rejectRequest(): void {
    if (!this.rejectReason.trim()) return;
    console.log('Rejecting with reason:', this.rejectReason);
    this.showRejectDialog = false;
  }
}
