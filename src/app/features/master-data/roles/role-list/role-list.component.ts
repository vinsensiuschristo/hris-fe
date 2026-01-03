import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { Textarea } from 'primeng/textarea';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
    Textarea,
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
            <th>Deskripsi</th>
            <th style="width: 120px">Jumlah User</th>
            <th style="width: 100px">Status</th>
            <th style="width: 120px">Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-role let-i="rowIndex">
          <tr>
            <td>{{ i + 1 }}</td>
            <td>
              <div class="role-info">
                <div class="role-icon" [style.background]="role.color">
                  <i class="pi pi-shield"></i>
                </div>
                <span class="role-name">{{ role.name }}</span>
              </div>
            </td>
            <td class="text-muted">{{ role.description }}</td>
            <td class="text-center">
              <span class="user-count">{{ role.userCount }} user</span>
            </td>
            <td>
              <p-tag [value]="role.isActive ? 'Aktif' : 'Nonaktif'" [severity]="role.isActive ? 'success' : 'secondary'" />
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" pTooltip="Edit" (click)="editRole(role)"></button>
                <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Hapus" (click)="confirmDelete(role)" [disabled]="role.isSystem"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-shield empty-icon"></i>
                <p>Tidak ada data role</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
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
          <input type="text" pInputText [(ngModel)]="formData.name" placeholder="Contoh: Manager" class="w-full" />
        </div>
        
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea pTextarea [(ngModel)]="formData.description" placeholder="Deskripsi role dan hak akses" rows="3" class="w-full"></textarea>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="saveRole()"></button>
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
      
      i { color: white; font-size: 0.875rem; }
    }
    
    .role-name { font-weight: 500; color: #1E293B; }
    
    .user-count {
      background: #F1F5F9;
      color: #475569;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
    }
    
    .text-center { text-align: center; }
    .text-muted { color: #64748B; font-size: 0.875rem; }
    .action-buttons { display: flex; gap: 0.25rem; }
    .dialog-content { padding: 0.5rem 0; }
    
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #94A3B8;
      
      .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    }
    
    .w-full { width: 100%; }
  `]
})
export class RoleListComponent {
  searchText = '';
  dialogVisible = false;
  isEditMode = false;
  
  roles = [
    { id: 1, name: 'Super Admin', description: 'Akses penuh ke semua fitur sistem', userCount: 1, color: '#DC2626', isActive: true, isSystem: true },
    { id: 2, name: 'Admin', description: 'Mengelola data karyawan dan pengaturan', userCount: 3, color: '#2563EB', isActive: true, isSystem: true },
    { id: 3, name: 'HR Manager', description: 'Mengelola SDM dan persetujuan cuti', userCount: 2, color: '#7C3AED', isActive: true, isSystem: false },
    { id: 4, name: 'Manager', description: 'Persetujuan cuti dan lembur tim', userCount: 8, color: '#059669', isActive: true, isSystem: false },
    { id: 5, name: 'Employee', description: 'Akses dasar untuk karyawan', userCount: 150, color: '#64748B', isActive: true, isSystem: true },
  ];
  
  filteredData = [...this.roles];
  
  formData = {
    id: null as number | null,
    name: '',
    description: ''
  };
  
  constructor(private confirmationService: ConfirmationService) {}
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredData = this.roles.filter(r => 
      r.name.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term)
    );
  }
  
  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, name: '', description: '' };
    this.dialogVisible = true;
  }
  
  editRole(role: any): void {
    this.isEditMode = true;
    this.formData = { ...role };
    this.dialogVisible = true;
  }
  
  saveRole(): void {
    if (!this.formData.name) return;
    
    if (this.isEditMode) {
      const index = this.roles.findIndex(r => r.id === this.formData.id);
      if (index > -1) {
        this.roles[index].name = this.formData.name;
        this.roles[index].description = this.formData.description;
      }
    } else {
      const newId = Math.max(...this.roles.map(r => r.id)) + 1;
      this.roles.push({
        id: newId,
        name: this.formData.name,
        description: this.formData.description,
        userCount: 0,
        color: '#3B82F6',
        isActive: true,
        isSystem: false
      });
    }
    
    this.filteredData = [...this.roles];
    this.dialogVisible = false;
  }
  
  confirmDelete(role: any): void {
    if (role.isSystem) return;
    
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus role "${role.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.roles = this.roles.filter(r => r.id !== role.id);
        this.filteredData = [...this.roles];
      }
    });
  }
}
