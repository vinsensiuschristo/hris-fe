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

interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
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
  selector: 'app-leave-approval-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonDirective, Tag, Avatar, Divider, Dialog, Textarea],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Detail Persetujuan Cuti</h1>
        <p class="page-subtitle">Nomor Pengajuan: #LV-{{ request.id.toString().padStart(5, '0') }}</p>
      </div>
      <div class="header-actions">
        <a routerLink="/approvals/leave" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
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
          <h3>Informasi Pengajuan Cuti</h3>
          <p-tag [value]="getStatusLabel(request.status)" [severity]="getStatusSeverity(request.status)" [style]="{'font-size': '0.875rem', 'padding': '0.5rem 1rem'}" />
        </div>
        
        <div class="card-body">
          <!-- Leave Type Badge -->
          <div class="type-badge leave">
            <i class="pi pi-calendar-plus"></i>
            <span>{{ request.leaveType }}</span>
          </div>
          
          <!-- Date Info -->
          <div class="date-section">
            <div class="date-card start">
              <div class="date-icon"><i class="pi pi-calendar"></i></div>
              <div class="date-info">
                <span class="date-label">Tanggal Mulai</span>
                <span class="date-value">{{ request.startDate }}</span>
              </div>
            </div>
            
            <div class="date-connector">
              <div class="connector-line"></div>
              <div class="connector-badge">{{ request.totalDays }} Hari</div>
              <div class="connector-line"></div>
            </div>
            
            <div class="date-card end">
              <div class="date-icon"><i class="pi pi-calendar-times"></i></div>
              <div class="date-info">
                <span class="date-label">Tanggal Selesai</span>
                <span class="date-value">{{ request.endDate }}</span>
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
                <p-avatar [label]="getInitials(request.employeeName)" size="xlarge" shape="circle" [style]="{'background': 'linear-gradient(135deg, #3B82F6, #2563EB)', 'color': 'white', 'font-size': '1.25rem', 'font-weight': '600'}" />
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
    <p-dialog header="Tolak Pengajuan Cuti" [(visible)]="showRejectDialog" [modal]="true" [style]="{'width': '450px'}">
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
    
    .reason-card { background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
    .reason-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: white; border-bottom: 1px solid #E2E8F0; }
    .reason-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #3B82F6, #2563EB); display: flex; align-items: center; justify-content: center; i { color: white; font-size: 1rem; } }
    .reason-header h4 { margin: 0; font-size: 1rem; font-weight: 600; color: #1E293B; }
    .reason-body { padding: 1.25rem; position: relative; }
    .quote-icon { position: absolute; top: 0.75rem; left: 1rem; font-size: 1.5rem; color: #CBD5E1; opacity: 0.6; }
    .reason-body p { margin: 0; padding-left: 1.5rem; color: #334155; font-size: 0.9375rem; line-height: 1.75; font-style: normal; }
    
    .employee-card .card-body { padding: 1.5rem; }
    .employee-profile { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; }
    .employee-info { display: flex; flex-direction: column; gap: 0.375rem; }
    .employee-name { font-size: 1.125rem; font-weight: 600; color: #1E293B; }
    .employee-code { display: flex; align-items: center; justify-content: center; gap: 0.375rem; font-size: 0.8125rem; color: #64748B; i { font-size: 0.75rem; } }
    .employee-tags { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .dept-tag, .pos-tag { padding: 0.25rem 0.625rem; border-radius: 50px; font-size: 0.6875rem; font-weight: 500; }
    .dept-tag { background: #DBEAFE; color: #1D4ED8; }
    .pos-tag { background: #F3E8FF; color: #7C3AED; }
    
    .action-card .card-body {
      h4 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.5rem; font-size: 1rem; color: #1E293B; i { color: #F59E0B; } }
      p { margin: 0 0 1rem; font-size: 0.875rem; color: #64748B; }
      .action-buttons { display: flex; gap: 0.5rem; }
    }
    
    .reject-form {
      label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #475569; .required { color: #EF4444; } }
      textarea { width: 100%; }
    }
    
    @media (max-width: 768px) {
      .date-section { flex-direction: column; }
      .date-card { width: 100%; }
      .date-connector { flex-direction: row; width: 100%; .connector-line { width: 100%; height: 2px; } }
    }
  `]
})
export class LeaveApprovalDetailComponent implements OnInit {
  showRejectDialog = false;
  rejectReason = '';
  
  request: LeaveRequest = {
    id: 1,
    employeeName: 'Ahmad Fauzi',
    employeeCode: 'EMP001',
    department: 'IT',
    position: 'Senior Developer',
    leaveType: 'Cuti Tahunan',
    startDate: '20 Jan 2024',
    endDate: '22 Jan 2024',
    totalDays: 3,
    reason: 'Liburan keluarga ke Bali untuk merayakan ulang tahun pernikahan. Sudah merencanakan perjalanan ini dari beberapa bulan yang lalu dan tiket penerbangan serta hotel sudah dibooking.',
    status: 'PENDING',
    createdAt: '15 Jan 2024, 09:30'
  };
  
  timeline: TimelineEvent[] = [];
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.buildTimeline();
  }
  
  buildTimeline(): void {
    this.timeline = [
      { status: 'Menunggu Persetujuan', date: this.request.createdAt, icon: 'pi-clock', color: '#F59E0B', description: 'Pengajuan dalam proses review' },
      { status: 'Pengajuan Dibuat', date: this.request.createdAt, icon: 'pi-plus', color: '#3B82F6', description: `Oleh ${this.request.employeeName}` }
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
    // Call API to approve
    console.log('Approving request...');
  }
  
  rejectRequest(): void {
    if (!this.rejectReason.trim()) return;
    console.log('Rejecting with reason:', this.rejectReason);
    this.showRejectDialog = false;
  }
}
