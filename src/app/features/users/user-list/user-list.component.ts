import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Avatar } from 'primeng/avatar';
import { Dialog } from 'primeng/dialog';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  roleLabel: string;
  isActive: boolean;
  initials: string;
  roleBg: string;
  lastLogin: string;
  employeeName: string | null;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonDirective, InputText, Tag, Tooltip, Avatar, Dialog],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen User</h1>
        <p class="page-subtitle">Kelola akun pengguna sistem</p>
      </div>
      <a routerLink="new" pButton label="Tambah User" icon="pi pi-plus"></a>
    </div>
    
    <div class="hris-card">
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari username atau email..." [(ngModel)]="searchText" (input)="onSearch()" />
        </div>
        <span class="data-count">Total: {{ filteredUsers.length }} user</span>
      </div>
      
      <p-table 
        [value]="filteredUsers" 
        [paginator]="true" 
        [rows]="10" 
        [rowsPerPageOptions]="[10, 20, 50]" 
        [showCurrentPageReport]="true" 
        currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords}"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>User</th>
            <th>Email</th>
            <th style="width: 150px">Role</th>
            <th style="width: 120px">Terakhir Login</th>
            <th style="width: 100px">Status</th>
            <th style="width: 100px">Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>
              <div class="user-cell">
                <p-avatar [label]="user.initials" shape="circle" [style]="{'background': user.roleBg, 'color': 'white'}" />
                <div class="user-info">
                  <span class="user-name">{{ user.username }}</span>
                  <span class="user-employee" *ngIf="user.employeeName">{{ user.employeeName }}</span>
                </div>
              </div>
            </td>
            <td class="email-cell">{{ user.email }}</td>
            <td>
              <p-tag [value]="user.roleLabel" [severity]="getRoleSeverity(user.role)" />
            </td>
            <td class="date-cell">{{ user.lastLogin }}</td>
            <td>
              <p-tag [value]="user.isActive ? 'Aktif' : 'Nonaktif'" [severity]="user.isActive ? 'success' : 'secondary'" />
            </td>
            <td>
              <div class="action-buttons">
                <a [routerLink]="['/users', user.id, 'edit']" pButton icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" pTooltip="Edit"></a>
                <button pButton icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Hapus" 
                  [disabled]="user.role === 'ADMIN'" 
                  (click)="openDeleteDialog(user)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-users empty-icon"></i>
                <p>Tidak ada data user</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <p-dialog header="Hapus User" [(visible)]="showDeleteDialog" [modal]="true" [style]="{'width': '450px'}">
      @if (selectedUser) {
        <div class="dialog-content">
          <div class="dialog-icon delete">
            <i class="pi pi-trash"></i>
          </div>
          <p class="dialog-message">
            Apakah Anda yakin ingin <strong>menghapus</strong> user ini?
          </p>
          <div class="user-preview">
            <p-avatar [label]="selectedUser.initials" shape="circle" [style]="{'background': selectedUser.roleBg, 'color': 'white'}" />
            <div>
              <span class="name">{{ selectedUser.username }}</span>
              <span class="info">{{ selectedUser.email }}</span>
              @if (selectedUser.employeeName) {
                <span class="info">Terhubung dengan: {{ selectedUser.employeeName }}</span>
              }
            </div>
          </div>
          <p class="warning-text">
            <i class="pi pi-exclamation-triangle"></i>
            Tindakan ini tidak dapat dibatalkan. User yang dihapus tidak dapat dipulihkan.
          </p>
        </div>
      }
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="showDeleteDialog = false"></button>
        <button pButton label="Hapus User" icon="pi pi-trash" severity="danger" (click)="deleteUser()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-info { display: flex; flex-direction: column; gap: 0.125rem; }
    .user-name { font-weight: 500; color: #1E293B; }
    .user-employee { font-size: 0.75rem; color: #94A3B8; }
    .email-cell { color: #64748B; font-size: 0.875rem; }
    .date-cell { color: #94A3B8; font-size: 0.8125rem; }
    .action-buttons { display: flex; gap: 0.25rem; }
    .empty-state { padding: 2rem; text-align: center; color: #94A3B8; .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; } }
    
    .dialog-content { text-align: center; padding: 1rem 0; }
    .dialog-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;
      i { font-size: 1.75rem; }
      &.delete { background: #FEE2E2; color: #DC2626; }
    }
    .dialog-message { margin: 0 0 1rem; color: #475569; }
    .user-preview { display: flex; align-items: center; gap: 0.75rem; background: #F8FAFC; padding: 1rem; border-radius: 8px; text-align: left;
      .name { display: block; font-weight: 600; color: #1E293B; }
      .info { display: block; font-size: 0.8125rem; color: #64748B; }
    }
    .warning-text { display: flex; align-items: flex-start; gap: 0.5rem; background: #FEF2F2; color: #7F1D1D; padding: 0.75rem; border-radius: 6px; font-size: 0.8125rem; margin-top: 1rem; text-align: left;
      i { color: #DC2626; flex-shrink: 0; margin-top: 0.125rem; }
    }
  `]
})
export class UserListComponent {
  searchText = '';
  showDeleteDialog = false;
  selectedUser: User | null = null;
  
  users: User[] = [
    { id: 1, username: 'admin', email: 'admin@company.com', role: 'ADMIN', roleLabel: 'Super Admin', isActive: true, initials: 'A', roleBg: '#DC2626', lastLogin: '3 Jan 2024', employeeName: null },
    { id: 2, username: 'hr_manager', email: 'hr@company.com', role: 'HR', roleLabel: 'HR Manager', isActive: true, initials: 'HR', roleBg: '#7C3AED', lastLogin: '3 Jan 2024', employeeName: 'Siti Rahayu' },
    { id: 3, username: 'ahmfauzi', email: 'ahmad@company.com', role: 'MANAGER', roleLabel: 'Manager', isActive: true, initials: 'AF', roleBg: '#059669', lastLogin: '2 Jan 2024', employeeName: 'Ahmad Fauzi' },
    { id: 4, username: 'budisantoso', email: 'budi@company.com', role: 'EMPLOYEE', roleLabel: 'Karyawan', isActive: true, initials: 'BS', roleBg: '#64748B', lastLogin: '1 Jan 2024', employeeName: 'Budi Santoso' },
    { id: 5, username: 'dewilestari', email: 'dewi@company.com', role: 'EMPLOYEE', roleLabel: 'Karyawan', isActive: false, initials: 'DL', roleBg: '#64748B', lastLogin: '25 Des 2023', employeeName: 'Dewi Lestari' },
  ];
  
  filteredUsers = [...this.users];
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(u => 
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.employeeName && u.employeeName.toLowerCase().includes(term))
    );
  }
  
  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'HR': return 'info';
      case 'MANAGER': return 'warn';
      default: return 'secondary';
    }
  }
  
  openDeleteDialog(user: User): void {
    if (user.role === 'ADMIN') return;
    this.selectedUser = user;
    this.showDeleteDialog = true;
  }
  
  deleteUser(): void {
    if (this.selectedUser) {
      this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
      this.filteredUsers = this.filteredUsers.filter(u => u.id !== this.selectedUser!.id);
    }
    this.showDeleteDialog = false;
    this.selectedUser = null;
  }
}
