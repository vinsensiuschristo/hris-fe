import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OvertimeRequest } from '../../../core/models';

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
  imports: [CommonModule, RouterModule, ButtonDirective, Tag, Divider, ProgressSpinner],
  template: `
    @if (loading()) {
      <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
        <p-progressSpinner strokeWidth="4" />
      </div>
    } @else if (request()) {
      <div class="page-header">
        <div>
          <h1 class="page-title">Detail Pengajuan Lembur</h1>
          <p class="page-subtitle">ID: {{ request()!.id }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/overtime-requests" pButton label="Kembali" icon="pi pi-arrow-left" [outlined]="true"></a>
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
            <h3>Informasi Pengajuan Lembur</h3>
            <p-tag [value]="getStatusLabel(request()!.status?.namaStatus)" [severity]="getStatusSeverity(request()!.status?.namaStatus)" [style]="{'font-size': '0.875rem', 'padding': '0.5rem 1rem'}" />
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
                  <span class="date-value">{{ formatDate(request()!.tglLembur) }}</span>
                </div>
              </div>
              
              <!-- Time Range -->
              <div class="time-range-card">
                <div class="time-box">
                  <span class="time-label">Mulai</span>
                  <span class="time-value">{{ request()!.jamMulai }}</span>
                </div>
                
                <div class="time-connector">
                  <i class="pi pi-arrow-right"></i>
                </div>
                
                <div class="time-box">
                  <span class="time-label">Selesai</span>
                  <span class="time-value">{{ request()!.jamSelesai }}</span>
                </div>
                
                <div class="hours-badge">
                  <span class="hours-value">{{ request()!.durasi }}</span>
                  <span class="hours-label">Jam</span>
                </div>
              </div>
            </div>
            
            <p-divider />
            
            <!-- Cost Info -->
            <div class="cost-section">
              <span class="cost-label">Estimasi Biaya</span>
              <span class="cost-value">{{ formatCurrency(request()!.estimasiBiaya) }}</span>
            </div>
            
            <!-- Evidence Section -->
            @if (request()!.evidences && request()!.evidences!.length > 0) {
              <p-divider />
              <div class="evidence-section">
                <h4><i class="pi pi-images"></i> Bukti Lembur</h4>
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
        <a routerLink="/overtime-requests" pButton label="Kembali" icon="pi pi-arrow-left"></a>
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
    
    .cost-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
      border-radius: 12px;
      
      .cost-label {
        font-size: 0.875rem;
        color: #065F46;
      }
      
      .cost-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #059669;
      }
    }
    
    .evidence-section {
      margin-top: 1.5rem;
      
      h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1.25rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1E293B;
        
        i { color: #8B5CF6; font-size: 1.25rem; }
      }
    }
    
    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }
    
    .evidence-item {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid #E2E8F0;
      background: #F8FAFC;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #8B5CF6;
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(139, 92, 246, 0.2);
      }
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
      height: 140px;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
      
      .evidence-link:hover & {
        transform: scale(1.05);
      }
    }
    
    .view-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(124, 58, 237, 0.9));
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      i {
        color: white;
        font-size: 2rem;
      }
      
      &::after {
        content: 'Lihat Gambar';
        color: white;
        font-size: 0.75rem;
        font-weight: 500;
      }
    }
    
    .evidence-file {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
      background: linear-gradient(135deg, #FEF2F2, #FECACA);
      text-decoration: none;
      gap: 0.75rem;
      height: 140px;
      transition: all 0.3s ease;
      
      i {
        font-size: 2.5rem;
        color: #DC2626;
      }
      
      span {
        font-size: 0.8125rem;
        color: #991B1B;
        font-weight: 500;
      }
      
      &:hover {
        background: linear-gradient(135deg, #FEE2E2, #FECACA);
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(220, 38, 38, 0.2);
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
        background: #EDE9FE;
        color: #7C3AED;
      }
      
      .pos-tag {
        background: #DBEAFE;
        color: #1D4ED8;
      }
    }
    
    .timeline-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 0.5rem 0;
    }
    
    .timeline-item {
      display: flex;
      gap: 0.875rem;
      align-items: flex-start;
      
      .timeline-icon {
        width: 28px;
        height: 28px;
        min-width: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 0.125rem;
        
        i { color: white; font-size: 0.75rem; }
      }
      
      .timeline-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
        min-width: 0;
        
        .timeline-status {
          font-weight: 600;
          font-size: 0.875rem;
          color: #1E293B;
          line-height: 1.3;
        }
        
        .timeline-desc {
          font-size: 0.8125rem;
          color: #64748B;
          line-height: 1.4;
          word-wrap: break-word;
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
export class OvertimeRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private overtimeRequestService = inject(OvertimeRequestService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  loading = signal<boolean>(true);
  processing = signal<boolean>(false);
  request = signal<OvertimeRequest | null>(null);
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
    this.overtimeRequestService.getById(id).subscribe({
      next: (data) => {
        this.request.set(data);
        this.buildTimeline();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading overtime request:', err);
        this.loading.set(false);
      }
    });
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
        { status: 'Pengajuan Dibuat', date: createdDate, icon: 'pi-plus', color: '#8B5CF6', description: `Oleh ${karyawanName}` }
      ];
    } else if (statusName === 'DITOLAK') {
      this.timeline = [
        { status: 'Ditolak', date: createdDate, icon: 'pi-times', color: '#EF4444', description: 'Pengajuan telah ditolak' },
        { status: 'Pengajuan Dibuat', date: createdDate, icon: 'pi-plus', color: '#8B5CF6', description: `Oleh ${karyawanName}` }
      ];
    } else {
      this.timeline = [
        { status: 'Menunggu Persetujuan', date: createdDate, icon: 'pi-clock', color: '#F59E0B', description: 'Pengajuan dalam proses review HR' },
        { status: 'Pengajuan Dibuat', date: createdDate, icon: 'pi-plus', color: '#8B5CF6', description: `Oleh ${karyawanName}` }
      ];
    }
  }

  approve(): void {
    const req = this.request();
    if (!req) return;

    this.processing.set(true);
    this.overtimeRequestService.approve(req.id).subscribe({
      next: () => {
        this.notificationService.success('Pengajuan lembur berhasil disetujui');
        this.router.navigate(['/overtime-requests']);
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
    this.overtimeRequestService.reject(req.id).subscribe({
      next: () => {
        this.notificationService.success('Pengajuan lembur berhasil ditolak');
        this.router.navigate(['/overtime-requests']);
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

  formatCurrency(amount: number): string {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
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
