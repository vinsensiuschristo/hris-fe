<<<<<<< HEAD
<div class="page-container"><div class="page-content">import { Component } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Divider } from 'primeng/divider';

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
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-overtime-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonDirective, Tag, Avatar, Divider],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Detail Pengajuan Lembur</h1>
        <p class="page-subtitle">Nomor Pengajuan: #OT-{{ request.id.toString().padStart(5, '0') }}</p>
      </div>
      <div class="header-actions">
        <a routerLink="/overtime-requests" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
        @if (request.status === 'PENDING') {
          <button pButton label="Setujui" icon="pi pi-check" severity="success"></button>
          <button pButton label="Tolak" icon="pi pi-times" severity="danger" [outlined]="true"></button>
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
          
          <!-- Date & Time Info -->
          <div class="datetime-section">
            <!-- Date Card -->
            <div class="date-card">
              <div class="date-icon">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="date-info">
                <span class="date-label">Tanggal Lembur</span>
                <span class="date-value">{{ request.date }}</span>
              </div>
            </div>
            
            <!-- Time Range -->
            <div class="time-range-card">
              <div class="time-box">
                <span class="time-label">Mulai</span>
                <span class="time-value">{{ request.startTime }}</span>
              </div>
              
              <div class="time-connector">
                <i class="pi pi-arrow-right"></i>
              </div>
              
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
          
          <!-- Reason Card - Modern Design -->
          <div class="reason-card">
            <div class="reason-header">
              <div class="reason-icon">
                <i class="pi pi-file-edit"></i>
              </div>
              <h4>Alasan Lembur</h4>
            </div>
            <div class="reason-body">
              <i class="pi pi-quote-left quote-icon"></i>
              <p>{{ request.reason }}</p>
            </div>
          </div>
          
          @if (request.status === 'REJECTED' && request.rejectionReason) {
            <div class="rejection-alert">
              <div class="alert-icon">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
              <div class="alert-content">
                <span class="alert-title">Alasan Penolakan</span>
                <p class="alert-text">{{ request.rejectionReason }}</p>
              </div>
            </div>
          }
        </div>
      </div>
      
      <!-- Right Sidebar -->
      <div class="sidebar-cards">
        <!-- Employee Info -->
        <div class="hris-card employee-card">
          <div class="card-header">
            <h3>Pengaju</h3>
          </div>
          <div class="card-body">
            <div class="employee-profile">
              <div class="avatar-wrapper">
                <p-avatar [label]="getInitials(request.employeeName)" size="xlarge" shape="circle" [style]="{'background': 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 'color': 'white', 'font-size': '1.25rem', 'font-weight': '600'}" />
                <span class="status-dot online"></span>
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
          <div class="card-header">
            <h3>Riwayat Status</h3>
          </div>
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
        
        <!-- Approval Info -->
        @if (request.status !== 'PENDING') {
          <div class="hris-card approval-card" [class.approved]="request.status === 'APPROVED'" [class.rejected]="request.status === 'REJECTED'">
            <div class="card-body">
              <div class="approval-icon">
                <i class="pi" [ngClass]="request.status === 'APPROVED' ? 'pi-check-circle' : 'pi-times-circle'"></i>
              </div>
              <div class="approval-info">
                <span class="approval-status">{{ request.status === 'APPROVED' ? 'Disetujui' : 'Ditolak' }} oleh</span>
                <span class="approval-by">{{ request.status === 'APPROVED' ? request.approvedBy : request.rejectedBy }}</span>
                <span class="approval-date"><i class="pi pi-calendar"></i> {{ request.status === 'APPROVED' ? request.approvedAt : request.rejectedAt }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 1.25rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.9375rem;
      margin-bottom: 1.5rem;
      
      i { font-size: 1.125rem; }
      
      &.overtime {
        background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
      }
    }
    
    .datetime-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .date-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      
      .date-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
        
        i { color: white; font-size: 1.125rem; }
      }
      
      .date-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .date-label {
        font-size: 0.75rem;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .date-value {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1E293B;
      }
    }
    
    .time-range-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: white;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    
    .time-box {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      
      .time-label {
        font-size: 0.75rem;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .time-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1E293B;
        font-family: 'JetBrains Mono', monospace;
      }
    }
    
    .time-connector {
      color: #94A3B8;
      font-size: 1.25rem;
      padding: 0 0.5rem;
    }
    
    .hours-badge {
      margin-left: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
      color: white;
      padding: 0.875rem 1.5rem;
      border-radius: 14px;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.35);
      
      .hours-value {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
      }
      
      .hours-label {
        font-size: 0.75rem;
        opacity: 0.9;
        margin-top: 0.125rem;
      }
    }
    
    .reason-card {
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      overflow: hidden;
      
      .reason-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: white;
        border-bottom: 1px solid #E2E8F0;
        
        .reason-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
          display: flex;
          align-items: center;
          justify-content: center;
          
          i { color: white; font-size: 1rem; }
        }
        
        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1E293B;
        }
      }
      
      .reason-body {
        padding: 1.25rem;
        position: relative;
        
        .quote-icon {
          position: absolute;
          top: 0.75rem;
          left: 1rem;
          font-size: 1.5rem;
          color: #C4B5FD;
          opacity: 0.6;
        }
        
        p {
          margin: 0;
          padding-left: 1.5rem;
          color: #334155;
          font-size: 0.9375rem;
          line-height: 1.75;
          font-style: normal;
        }
      }
    }
    
    .rejection-alert {
      display: flex;
      gap: 1rem;
      background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
      border: 1px solid #FECACA;
      border-radius: 12px;
      padding: 1.25rem;
      margin-top: 1.5rem;
      
      .alert-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #FEE2E2;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        i { color: #DC2626; font-size: 1.25rem; }
      }
      
      .alert-content {
        .alert-title {
          font-weight: 600;
          color: #DC2626;
          display: block;
          margin-bottom: 0.375rem;
        }
        
        .alert-text {
          color: #7F1D1D;
          margin: 0;
          line-height: 1.5;
        }
      }
    }
    
    .employee-card .card-body {
      padding: 1.5rem;
    }
    
    .employee-profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
    }
    
    .avatar-wrapper {
      position: relative;
      
      .status-dot {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        
        &.online { background: #22C55E; }
      }
    }
    
    .employee-info {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      
      .employee-name {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1E293B;
      }
      
      .employee-code {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: #64748B;
        
        i { font-size: 0.75rem; }
      }
    }
    
    .employee-tags {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      
      .dept-tag, .pos-tag {
        padding: 0.25rem 0.625rem;
        border-radius: 50px;
        font-size: 0.6875rem;
        font-weight: 500;
      }
      
      .dept-tag {
        background: #EDE9FE;
        color: #7C3AED;
      }
      
      .pos-tag {
        background: #DBEAFE;
        color: #1D4ED8;
      }
    }
    
    .approval-card {
      .card-body {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
      }
      
      .approval-icon i {
        font-size: 2.5rem;
      }
      
      &.approved .approval-icon i { color: #059669; }
      &.rejected .approval-icon i { color: #DC2626; }
      
      .approval-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        
        .approval-status {
          font-size: 0.75rem;
          font-weight: 500;
          color: inherit;
          opacity: 0.8;
        }
        
        .approval-by {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1E293B;
        }
        
        .approval-date {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: #64748B;
          
          i { font-size: 0.75rem; }
        }
      }
    }
    
    @media (max-width: 768px) {
      .time-range-card {
        flex-wrap: wrap;
        
        .hours-badge {
          width: 100%;
          margin-top: 0.5rem;
        }
      }
    }
  `]
})
<<<<<<< HEAD
export class OvertimeRequestDetailComponent {}
</div></div>
=======
export class OvertimeRequestDetailComponent implements OnInit {
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
    if (this.request.status === 'APPROVED') {
      this.timeline = [
        { status: 'Disetujui', date: this.request.approvedAt || '', icon: 'pi-check', color: '#22C55E', description: `Oleh ${this.request.approvedBy}` },
        { status: 'Menunggu Persetujuan', date: this.request.createdAt, icon: 'pi-clock', color: '#F59E0B', description: 'Pengajuan dalam proses review' },
        { status: 'Pengajuan Dibuat', date: this.request.createdAt, icon: 'pi-plus', color: '#8B5CF6', description: `Oleh ${this.request.employeeName}` }
      ];
    } else if (this.request.status === 'REJECTED') {
      this.timeline = [
        { status: 'Ditolak', date: this.request.rejectedAt || '', icon: 'pi-times', color: '#EF4444', description: `Oleh ${this.request.rejectedBy}` },
        { status: 'Menunggu Persetujuan', date: this.request.createdAt, icon: 'pi-clock', color: '#F59E0B', description: 'Pengajuan dalam proses review' },
        { status: 'Pengajuan Dibuat', date: this.request.createdAt, icon: 'pi-plus', color: '#8B5CF6', description: `Oleh ${this.request.employeeName}` }
      ];
    } else {
      this.timeline = [
        { status: 'Menunggu Persetujuan', date: this.request.createdAt, icon: 'pi-clock', color: '#F59E0B', description: 'Pengajuan dalam proses review HR' },
        { status: 'Pengajuan Dibuat', date: this.request.createdAt, icon: 'pi-plus', color: '#8B5CF6', description: `Oleh ${this.request.employeeName}` }
      ];
    }
  }
  
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  
  getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Disetujui';
      case 'PENDING': return 'Menunggu';
      case 'REJECTED': return 'Ditolak';
      default: return status;
    }
  }
  
  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warn';
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }
}
>>>>>>> 1614761 (feat: add detail pages, fix select dropdown, add dialogs)
