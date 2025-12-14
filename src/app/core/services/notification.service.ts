import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastConfig {
  severity: ToastSeverity;
  summary: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageService = inject(MessageService);
  
  private defaultLife = 3000;

  show(config: ToastConfig): void {
    this.messageService.add({
      severity: config.severity,
      summary: config.summary,
      detail: config.detail,
      life: config.life || this.defaultLife,
      sticky: config.sticky || false
    });
  }

  success(summary: string, detail?: string): void {
    this.show({ severity: 'success', summary, detail });
  }

  info(summary: string, detail?: string): void {
    this.show({ severity: 'info', summary, detail });
  }

  warn(summary: string, detail?: string): void {
    this.show({ severity: 'warn', summary, detail });
  }

  error(summary: string, detail?: string): void {
    this.show({ severity: 'error', summary, detail, life: 5000 });
  }

  // Notifikasi untuk operasi CRUD
  createSuccess(entityName: string): void {
    this.success('Berhasil', `${entityName} berhasil dibuat`);
  }

  updateSuccess(entityName: string): void {
    this.success('Berhasil', `${entityName} berhasil diperbarui`);
  }

  deleteSuccess(entityName: string): void {
    this.success('Berhasil', `${entityName} berhasil dihapus`);
  }

  // Notifikasi untuk approval workflow
  approvalSuccess(type: 'leave' | 'overtime'): void {
    const label = type === 'leave' ? 'Pengajuan cuti' : 'Pengajuan lembur';
    this.success('Disetujui', `${label} telah disetujui`);
  }

  rejectionSuccess(type: 'leave' | 'overtime'): void {
    const label = type === 'leave' ? 'Pengajuan cuti' : 'Pengajuan lembur';
    this.success('Ditolak', `${label} telah ditolak`);
  }

  // Notifikasi untuk error handling
  serverError(): void {
    this.error('Kesalahan Server', 'Terjadi kesalahan pada server. Silakan coba lagi.');
  }

  networkError(): void {
    this.error('Kesalahan Jaringan', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
  }

  validationError(message: string): void {
    this.warn('Validasi Gagal', message);
  }

  unauthorizedError(): void {
    this.error('Tidak Diizinkan', 'Anda tidak memiliki akses untuk melakukan aksi ini.');
  }

  sessionExpired(): void {
    this.warn('Sesi Berakhir', 'Sesi Anda telah berakhir. Silakan login kembali.');
  }

  clear(): void {
    this.messageService.clear();
  }
}
