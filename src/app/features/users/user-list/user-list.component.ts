import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TableModule, 
    ButtonDirective, 
    Tag,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen User</h1>
        <p class="page-subtitle">Kelola akun pengguna sistem</p>
      </div>
      <a routerLink="new" pButton label="Tambah User" icon="pi pi-plus"></a>
    </div>

    <div class="hris-card">
      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Memuat data...</p>
        </div>
      } @else {
        <p-table
          [value]="users()"
          [paginator]="true"
          [rows]="10"
          [rowHover]="true"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} user"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr>
              <td>
                <div class="user-info">
                  <div class="avatar">{{ getInitials(user.username) }}</div>
                  <div>
                    <div class="fw-semibold">{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td>
                @for (role of user.roles; track $index) {
                  <p-tag [value]="role.namaRole" severity="info" class="me-1" />
                }
              </td>
              <td>
                <a [routerLink]="[user.id, 'edit']" pButton icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info"></a>
                <button pButton icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (click)="confirmDelete(user)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="3" class="text-center p-4">
                <i class="pi pi-users" style="font-size: 2rem; color: var(--hris-gray-400)"></i>
                <p class="text-muted mt-2">Belum ada user</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>

    <p-toast />
    <p-confirmDialog />
  `,
  styles: [`
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: var(--hris-gray-500); }
    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--hris-primary) 0%, var(--hris-accent) 100%);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.875rem;
    }
    .fw-semibold { font-weight: 600; }
    .text-muted { color: var(--hris-gray-500); }
    .mt-2 { margin-top: 0.5rem; }
    .me-1 { margin-right: 0.25rem; }
  `]
})
export class UserListComponent implements OnInit {
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  users = signal<User[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.apiService.get<User[]>('/users').subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading.set(false);
        // Fallback to mock data for now
        this.users.set([
          { id: '1', username: 'admin', roles: [{ id: '1', namaRole: 'ADMIN' }] },
          { id: '2', username: 'hr_manager', roles: [{ id: '2', namaRole: 'HR' }] },
        ]);
      }
    });
  }

  getInitials(username: string): string {
    return username.substring(0, 2).toUpperCase();
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `Hapus user "${user.username}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.apiService.delete<void>('/users', user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'User dihapus' });
            this.loadUsers();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus user' })
        });
      }
    });
  }
}
