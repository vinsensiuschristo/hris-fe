import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { RoleService } from '../../../../core/services/master-data.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Role } from '../../../../core/models';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TableModule, 
    ButtonDirective, 
    InputText, 
    Tag,
    Dialog,
    Tooltip,
    ConfirmDialog
  ],
  providers: [ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Role</h1>
        <p class="page-subtitle">Kelola role dan hak akses pengguna</p>
      </div>
      <button pButton label="Tambah Role" icon="pi pi-plus" (click)="openDialog()"></button>
    </div>
    
    <div class="hris-card">
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari role..." [(ngModel)]="searchText" (input)="onSearch()" />
        </div>
        <span class="data-count">Total: {{ filteredData.length }} role</span>
      </div>
      
      @if (loading) {
        <div class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Memuat data...</span>
        </div>
      } @else {
        <p-table 
          [value]="filteredData" 
          [paginator]="true" 
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords}"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 60px">No</th>
              <th>Nama Role</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-role let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>
                <div class="role-info">
                  <div class="role-icon">
                    <i class="pi pi-shield"></i>
                  </div>
                  <span class="role-name">{{ role.namaRole }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" pTooltip="Edit" (click)="editRole(role)"></button>
                  <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Hapus" (click)="confirmDelete(role)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="3" class="text-center p-4">
                <div class="empty-state">
                  <i class="pi pi-shield empty-icon"></i>
                  <p>Tidak ada data role</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
    
    <p-dialog 
      [(visible)]="dialogVisible" 
      [header]="isEditMode ? 'Edit Role' : 'Tambah Role'" 
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
    >
      <div class="dialog-content">
        <div class="form-group">
          <label>Nama Role <span class="required">*</span></label>
          <input type="text" pInputText [(ngModel)]="formData.namaRole" placeholder="Contoh: ADMIN" class="w-full" style="text-transform: uppercase" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="saveRole()" [loading]="saving"></button>
      </ng-template>
    </p-dialog>
    
    <p-confirmDialog />
  `,
  styles: [`
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .search-box {
      position: relative;
      
      i {
        position: absolute;
        left: 0.875rem;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
      }
      
      input { padding-left: 2.5rem; width: 280px; }
    }
    
    .data-count { font-size: 0.875rem; color: #64748B; }
    
    .role-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .role-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3B82F6;
      
      i { color: white; font-size: 0.875rem; }
    }
    
    .role-name { font-weight: 500; color: #1E293B; }
    
    .text-center { text-align: center; }
    .action-buttons { display: flex; gap: 0.25rem; }
    .dialog-content { padding: 0.5rem 0; }
    
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 3rem;
      color: #64748B;
      
      i { font-size: 1.5rem; }
    }
    
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #94A3B8;
      
      .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    }
    
    .w-full { width: 100%; }
  `]
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  private confirmationService = inject(ConfirmationService);
  private notificationService = inject(NotificationService);

  searchText = '';
  dialogVisible = false;
  isEditMode = false;
  loading = false;
  saving = false;
  
  roles: Role[] = [];
  filteredData: Role[] = [];
  
  formData = {
    id: null as string | null,
    namaRole: ''
  };

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
        this.filteredData = [...data];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error('Error', 'Gagal memuat data role');
        console.error('Load roles error:', err);
      }
    });
  }
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredData = this.roles.filter(r => 
      r.namaRole.toLowerCase().includes(term)
    );
  }
  
  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, namaRole: '' };
    this.dialogVisible = true;
  }
  
  editRole(role: Role): void {
    this.isEditMode = true;
    this.formData = { id: role.id, namaRole: role.namaRole };
    this.dialogVisible = true;
  }
  
  saveRole(): void {
    if (!this.formData.namaRole) {
      this.notificationService.warn('Peringatan', 'Nama role harus diisi');
      return;
    }
    
    this.saving = true;
    const request = { namaRole: this.formData.namaRole.toUpperCase() };
    
    if (this.isEditMode && this.formData.id) {
      this.roleService.update(this.formData.id, request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'Role berhasil diperbarui');
          this.dialogVisible = false;
          this.saving = false;
          this.loadRoles();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error('Error', 'Gagal memperbarui role');
          console.error('Update error:', err);
        }
      });
    } else {
      this.roleService.create(request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'Role berhasil ditambahkan');
          this.dialogVisible = false;
          this.saving = false;
          this.loadRoles();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error('Error', 'Gagal menambahkan role');
          console.error('Create error:', err);
        }
      });
    }
  }
  
  confirmDelete(role: Role): void {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus role "${role.namaRole}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.roleService.delete(role.id).subscribe({
          next: () => {
            this.notificationService.success('Berhasil', 'Role berhasil dihapus');
            this.loadRoles();
          },
          error: (err) => {
            this.notificationService.error('Error', 'Gagal menghapus role');
            console.error('Delete error:', err);
          }
        });
      }
    });
  }
}
