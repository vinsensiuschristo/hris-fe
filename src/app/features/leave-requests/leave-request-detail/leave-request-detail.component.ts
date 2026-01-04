import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Divider } from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LeaveRequest } from '../../../core/models';

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-leave-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonDirective, Tag, Avatar, Divider, ProgressSpinner],
  template: `
    @if (loading()) {
      <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
        <p-progressSpinner strokeWidth="4" />
      </div>
    } @else if (request()) {
      <div class="page-header">
        <div>
          <h1 class="page-title">Detail Pengajuan Cuti</h1>
          <p class="page-subtitle">ID: {{ request()!.id }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/leave-requests" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
          @if (isAdminOrHR && isPending()) {
            <button pButton label="Setujui" icon="pi pi-check" severity="success" (click)="approve()" [loading]="processing()"></button>
            <button pButton label="Tolak" icon="pi pi-times" severity="danger" [outlined]="true" (click)="reject()" [loading]="processing()"></button>
          }
        </div>
      </div>
      
      <div class="detail-grid">
        <!-- Main Info Card -->
        <div class="hris-card main-card">
          <div class="card-header">
            <h3>Informasi Pengajuan Cuti</h3>
            <p-tag [value]="getStatusLabel(request()!.status?.namaStatus)" [severity]="getStatusSeverity(request()!.status?.namaStatus)" [style]="{'font-size': '0.875rem', 'padding': '0.5rem 1rem'}" />
          </div>
          
          <div class="card-body">
            <!-- Leave Type Badge -->
            <div class="type-badge leave">
              <i class="pi pi-calendar-plus"></i>
              <span>{{ request()!.jenisCuti?.namaJenis || 'Cuti' }}</span>
            </div>
            
            <!-- Date Info -->
            <div class="date-section">
              <div class="date-card start">
                <div class="date-icon">
                  <i class="pi pi-calendar"></i>
                </div>
                <div class="date-info">
                  <span class="date-label">Tanggal Mulai</span>
                  <span class="date-value">{{ formatDate(request()!.tglMulai) }}</span>
                </div>
              </div>
              
              <div class="date-connector">
                <div class="connector-line"></div>
                <div class="connector-badge">{{ calculateDays() }} Hari</div>
                <div class="connector-line"></div>
              </div>
              
              <div class="date-card end">
                <div class="date-icon">
                  <i class="pi pi-calendar-times"></i>
                </div>
                <div class="date-info">
                  <span class="date-label">Tanggal Selesai</span>
                  <span class="date-value">{{ formatDate(request()!.tglSelesai) }}</span>
                </div>
              </div>
            </div>
            
            <p-divider />
            
            <!-- Reason Card -->
            <div class="reason-card">
              <div class="reason-header">
                <div class="reason-icon">
                  <i class="pi pi-file-edit"></i>
                </div>
                <h4>Alasan Cuti</h4>
              </div>
              <div class="reason-body">
                <i class="pi pi-quote-left quote-icon"></i>
                <p>{{ request()!.alasan || '-' }}</p>
              </div>
            </div>
            
            <!-- Evidence Section -->
            @if (request()!.evidences && request()!.evidences!.length > 0) {
              <p-divider />
              <div class="evidence-section">
                <h4><i class="pi pi-images"></i> Bukti Pendukung</h4>
                <div class="evidence-grid">
                  @for (evidence of request()!.evidences; track evidence.id) {
                    <div class="evidence-item">
                      @if (isImage(evidence.fileType)) {
                        <a [href]="evidence.filePath" target="_blank" class="evidence-link">
                          <img [src]="evidence.filePath" [alt]="'Evidence'" class="evidence-image" />
                          <span class="view-overlay"><i class="pi pi-eye"></i></span>
                        </a>
                      } @else {
                        <a [href]="evidence.filePath" target="_blank" class="evidence-file">
                          <i class="pi pi-file-pdf"></i>
                          <span>Lihat File</span>
                        </a>
                      }
                    </div>
                  }
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
                  <p-avatar [label]="getInitials(request()!.karyawan?.nama || '-')" size="xlarge" shape="circle" [style]="{'background': 'linear-gradient(135deg, #3B82F6, #2563EB)', 'color': 'white', 'font-size': '1.25rem', 'font-weight': '600'}" />
                </div>
                <div class="employee-info">
                  <span class="employee-name">{{ request()!.karyawan?.nama || '-' }}</span>
                  <span class="employee-code"><i class="pi pi-id-card"></i> {{ request()!.karyawan?.nik || '-' }}</span>
                  <div class="employee-tags">
                    <span class="dept-tag">{{ request()!.karyawan?.departemen?.namaDepartement || '-' }}</span>
                    <span class="pos-tag">{{ request()!.karyawan?.jabatan?.namaJabatan || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Leave Balance -->
          <div class="hris-card">
            <div class="card-header">
              <h3>Sisa Cuti</h3>
            </div>
            <div class="card-body" style="text-align: center; padding: 1.5rem;">
              <div class="balance-display">
                <span class="balance-value">{{ request()!.karyawan?.sisaCuti || 0 }}</span>
                <span class="balance-label">Hari Tersisa</span>
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
        </div>
      </div>
    } @else {
      <div style="text-align: center; padding: 3rem;">
        <p>Data tidak ditemukan</p>
        <a routerLink="/leave-requests" pButton label="Kembali" icon="pi pi-arrow-left"></a>
      </div>
    }
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
      
      &.leave {
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
      }
    }
    
    .date-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border-radius: 16px;
      border: 1px solid #E2E8F0;
    }
    
    .date-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      
      .date-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        
        i { color: white; font-size: 1.25rem; }
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
    
    .date-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      
      .connector-line {
        width: 2px;
        height: 20px;
        background: linear-gradient(180deg, #CBD5E1, #94A3B8);
        border-radius: 1px;
      }
      
      .connector-badge {
        background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
        color: white;
        padding: 0.375rem 0.875rem;
        border-radius: 50px;
        font-size: 0.8125rem;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
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
          background: linear-gradient(135deg, #3B82F6, #2563EB);
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
          color: #CBD5E1;
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
    
    .balance-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      
      .balance-value {
        font-size: 3rem;
        font-weight: 700;
        color: #3B82F6;
      }
      
      .balance-label {
        font-size: 0.875rem;
        color: #64748B;
      }
    }
    
    .evidence-section {
      h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: #1E293B;
        
        i { color: #3B82F6; }
      }
    }
    
    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }
    
    .evidence-item {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
    }
    
    .evidence-link {
      display: block;
      position: relative;
      
      &:hover .view-overlay {
        opacity: 1;
      }
    }
    
    .evidence-image {
      width: 100%;
      height: 120px;
      object-fit: cover;
      display: block;
    }
    
    .view-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      
      i {
        color: white;
        font-size: 1.5rem;
      }
    }
    
    .evidence-file {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: #F8FAFC;
      text-decoration: none;
      gap: 0.5rem;
      
      i {
        font-size: 2rem;
        color: #DC2626;
      }
      
      span {
        font-size: 0.75rem;
        color: #64748B;
      }
      
      &:hover {
        background: #F1F5F9;
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
        background: #DBEAFE;
        color: #1D4ED8;
      }
      
      .pos-tag {
        background: #F3E8FF;
        color: #7C3AED;
      }
    }
    
    .timeline-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .timeline-item {
      display: flex;
      gap: 1rem;
      
      .timeline-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        i { color: white; font-size: 0.875rem; }
      }
      
      .timeline-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        
        .timeline-status {
          font-weight: 600;
          color: #1E293B;
        }
        
        .timeline-desc {
          font-size: 0.8125rem;
          color: #64748B;
        }
        
        .timeline-date {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: #94A3B8;
          
          i { font-size: 0.625rem; }
        }
      }
    }
    
    @media (max-width: 768px) {
      .date-section {
        flex-direction: column;
      }
      
      .date-card {
        width: 100%;
      }
      
      .date-connector {
        flex-direction: row;
        width: 100%;
        
        .connector-line {
          width: 100%;
          height: 2px;
        }
      }
    }
  `]
})
export class LeaveRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leaveRequestService = inject(LeaveRequestService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  loading = signal<boolean>(true);
  processing = signal<boolean>(false);
  request = signal<LeaveRequest | null>(null);
  timeline: TimelineEvent[] = [];
  
  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'HR']);
  }

  isPending(): boolean {
    return this.request()?.status?.namaStatus === 'MENUNGGU_PERSETUJUAN';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRequest(id);
    } else {
      this.loading.set(false);
    }
  }

  private loadRequest(id: string): void {
    this.leaveRequestService.getById(id).subscribe({
      next: (data) => {
        this.request.set(data);
        this.buildTimeline();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading leave request:', err);
        this.loading.set(false);
      }
    });
  }

  calculateDays(): number {
    const req = this.request();
    if (!req?.tglMulai || !req?.tglSelesai) return 0;
    const start = new Date(req.tglMulai);
    const end = new Date(req.tglSelesai);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  buildTimeline(): void {
    const req = this.request();
    if (!req) return;

    const statusName = req.status?.namaStatus || '';
    const createdDate = this.formatDateTime(req.createdAt || '');
    const karyawanName = req.karyawan?.nama || 'Karyawan';

    if (statusName === 'DISETUJUI') {
      this.timeline = [
        { status: 'Disetujui', date: createdDate, icon: 'pi-check', color: '#22C55E', description: 'Pengajuan telah disetujui' },
        { status: 'Pengajuan Dibuat', date: createdDate, icon: 'pi-plus', color: '#3B82F6', description: `Oleh ${karyawanName}` }
      ];
    } else if (statusName === 'DITOLAK') {
      this.timeline = [
        { status: 'Ditolak', date: createdDate, icon: 'pi-times', color: '#EF4444', description: 'Pengajuan telah ditolak' },
        { status: 'Pengajuan Dibuat', date: createdDate, icon: 'pi-plus', color: '#3B82F6', description: `Oleh ${karyawanName}` }
      ];
    } else {
      this.timeline = [
        { status: 'Menunggu Persetujuan', date: createdDate, icon: 'pi-clock', color: '#F59E0B', description: 'Pengajuan dalam proses review HR' },
        { status: 'Pengajuan Dibuat', date: createdDate, icon: 'pi-plus', color: '#3B82F6', description: `Oleh ${karyawanName}` }
      ];
    }
  }

  approve(): void {
    const req = this.request();
    if (!req) return;

    this.processing.set(true);
    this.leaveRequestService.approve(req.id).subscribe({
      next: () => {
        this.notificationService.success('Pengajuan cuti berhasil disetujui');
        this.router.navigate(['/leave-requests']);
      },
      error: (err) => {
        console.error('Error approving:', err);
        this.notificationService.error('Gagal menyetujui pengajuan');
        this.processing.set(false);
      }
    });
  }

  reject(): void {
    const req = this.request();
    if (!req) return;

    this.processing.set(true);
    this.leaveRequestService.reject(req.id).subscribe({
      next: () => {
        this.notificationService.success('Pengajuan cuti berhasil ditolak');
        this.router.navigate(['/leave-requests']);
      },
      error: (err) => {
        console.error('Error rejecting:', err);
        this.notificationService.error('Gagal menolak pengajuan');
        this.processing.set(false);
      }
    });
  }
  
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  
  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'DISETUJUI': return 'Disetujui';
      case 'MENUNGGU_PERSETUJUAN': return 'Menunggu';
      case 'DITOLAK': return 'Ditolak';
      default: return status || '-';
    }
  }
  
  getStatusSeverity(status: string | undefined): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'DISETUJUI': return 'success';
      case 'MENUNGGU_PERSETUJUAN': return 'warn';
      case 'DITOLAK': return 'danger';
      default: return 'info';
    }
  }

  isImage(fileType: string): boolean {
    return fileType?.startsWith('image/');
  }
}
