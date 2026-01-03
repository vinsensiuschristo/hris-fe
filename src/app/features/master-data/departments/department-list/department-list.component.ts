import { Component } from '@angular/core';
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

@Component({
  selector: 'app-department-list',
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
        <h1 class="page-title">Data Departemen</h1>
        <p class="page-subtitle">Kelola data departemen perusahaan</p>
      </div>
      <button pButton label="Tambah Departemen" icon="pi pi-plus" (click)="openDialog()"></button>
    </div>
    
    <div class="hris-card">
      <!-- Search Bar -->
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari departemen..." [(ngModel)]="searchText" (input)="onSearch()" />
        </div>
        <span class="data-count">Total: {{ filteredData.length }} departemen</span>
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
            <th>Nama Departemen</th>
            <th style="width: 120px">Kode</th>
            <th style="width: 100px">Jumlah Staff</th>
            <th style="width: 100px">Status</th>
            <th style="width: 120px">Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-dept let-i="rowIndex">
          <tr>
            <td>{{ i + 1 }}</td>
            <td>
              <div class="dept-info">
                <span class="dept-name">{{ dept.name }}</span>
                @if (dept.description) {
                  <span class="dept-desc">{{ dept.description }}</span>
                }
              </div>
            </td>
            <td><code class="code-badge">{{ dept.code }}</code></td>
            <td class="text-center">{{ dept.staffCount }}</td>
            <td>
              <p-tag [value]="dept.isActive ? 'Aktif' : 'Nonaktif'" [severity]="dept.isActive ? 'success' : 'secondary'" />
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" pTooltip="Edit" (click)="editDepartment(dept)"></button>
                <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Hapus" (click)="confirmDelete(dept)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-building empty-icon"></i>
                <p>Tidak ada data departemen</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    
    <!-- Add/Edit Dialog -->
    <p-dialog 
      [(visible)]="dialogVisible" 
      [header]="isEditMode ? 'Edit Departemen' : 'Tambah Departemen'" 
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
    >
      <div class="dialog-content">
        <div class="form-group">
          <label>Nama Departemen <span class="required">*</span></label>
          <input type="text" pInputText [(ngModel)]="formData.name" placeholder="Contoh: Human Resources" class="w-full" />
        </div>
        
        <div class="form-group">
          <label>Kode <span class="required">*</span></label>
          <input type="text" pInputText [(ngModel)]="formData.code" placeholder="Contoh: HR" class="w-full" style="text-transform: uppercase" />
        </div>
        
        <div class="form-group">
          <label>Deskripsi</label>
          <input type="text" pInputText [(ngModel)]="formData.description" placeholder="Deskripsi singkat departemen" class="w-full" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="saveDepartment()"></button>
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
      
      input {
        padding-left: 2.5rem;
        width: 280px;
      }
    }
    
    .data-count {
      font-size: 0.875rem;
      color: #64748B;
    }
    
    .dept-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .dept-name {
      font-weight: 500;
      color: #1E293B;
    }
    
    .dept-desc {
      font-size: 0.75rem;
      color: #64748B;
    }
    
    .code-badge {
      background: #F1F5F9;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-family: monospace;
      color: #3B82F6;
    }
    
    .text-center { text-align: center; }
    
    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }
    
    .dialog-content {
      padding: 0.5rem 0;
    }
    
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #94A3B8;
      
      .empty-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }
    }
    
    .w-full { width: 100%; }
  `]
})
export class DepartmentListComponent {
  searchText = '';
  dialogVisible = false;
  isEditMode = false;
  
  departments = [
    { id: 1, name: 'Human Resources', code: 'HR', description: 'Manajemen sumber daya manusia', staffCount: 12, isActive: true },
    { id: 2, name: 'Information Technology', code: 'IT', description: 'Teknologi informasi dan sistem', staffCount: 25, isActive: true },
    { id: 3, name: 'Finance', code: 'FIN', description: 'Keuangan dan akuntansi', staffCount: 8, isActive: true },
    { id: 4, name: 'Marketing', code: 'MKT', description: 'Pemasaran dan promosi', staffCount: 15, isActive: true },
    { id: 5, name: 'Operations', code: 'OPS', description: 'Operasional dan logistik', staffCount: 30, isActive: false },
  ];
  
  filteredData = [...this.departments];
  
  formData = {
    id: null as number | null,
    name: '',
    code: '',
    description: ''
  };
  
  constructor(private confirmationService: ConfirmationService) {}
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredData = this.departments.filter(d => 
      d.name.toLowerCase().includes(term) || 
      d.code.toLowerCase().includes(term)
    );
  }
  
  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, name: '', code: '', description: '' };
    this.dialogVisible = true;
  }
  
  editDepartment(dept: any): void {
    this.isEditMode = true;
    this.formData = { ...dept };
    this.dialogVisible = true;
  }
  
  saveDepartment(): void {
    if (!this.formData.name || !this.formData.code) return;
    
    if (this.isEditMode) {
      const index = this.departments.findIndex(d => d.id === this.formData.id);
      if (index > -1) {
        this.departments[index].name = this.formData.name;
        this.departments[index].code = this.formData.code;
        this.departments[index].description = this.formData.description;
      }
    } else {
      const newId = Math.max(...this.departments.map(d => d.id)) + 1;
      this.departments.push({
        id: newId,
        name: this.formData.name,
        code: this.formData.code.toUpperCase(),
        description: this.formData.description,
        staffCount: 0,
        isActive: true
      });
    }
    
    this.filteredData = [...this.departments];
    this.dialogVisible = false;
  }
  
  confirmDelete(dept: any): void {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus departemen "${dept.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.departments = this.departments.filter(d => d.id !== dept.id);
        this.filteredData = [...this.departments];
      }
    });
  }
}
