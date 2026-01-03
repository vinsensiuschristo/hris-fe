import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-position-list',
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
    Select,
    ConfirmDialog
  ],
  providers: [ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Jabatan</h1>
        <p class="page-subtitle">Kelola data jabatan perusahaan</p>
      </div>
      <button pButton label="Tambah Jabatan" icon="pi pi-plus" (click)="openDialog()"></button>
    </div>
    
    <div class="hris-card">
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari jabatan..." [(ngModel)]="searchText" (input)="onSearch()" />
        </div>
        <span class="data-count">Total: {{ filteredData.length }} jabatan</span>
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
            <th>Nama Jabatan</th>
            <th>Departemen</th>
            <th style="width: 100px">Level</th>
            <th style="width: 100px">Status</th>
            <th style="width: 120px">Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-pos let-i="rowIndex">
          <tr>
            <td>{{ i + 1 }}</td>
            <td>
              <div class="pos-info">
                <span class="pos-name">{{ pos.name }}</span>
                @if (pos.description) {
                  <span class="pos-desc">{{ pos.description }}</span>
                }
              </div>
            </td>
            <td>{{ pos.department }}</td>
            <td>
              <p-tag [value]="'Level ' + pos.level" [severity]="getLevelSeverity(pos.level)" />
            </td>
            <td>
              <p-tag [value]="pos.isActive ? 'Aktif' : 'Nonaktif'" [severity]="pos.isActive ? 'success' : 'secondary'" />
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" pTooltip="Edit" (click)="editPosition(pos)"></button>
                <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Hapus" (click)="confirmDelete(pos)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-briefcase empty-icon"></i>
                <p>Tidak ada data jabatan</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    
    <p-dialog 
      [(visible)]="dialogVisible" 
      [header]="isEditMode ? 'Edit Jabatan' : 'Tambah Jabatan'" 
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
    >
      <div class="dialog-content">
        <div class="form-group">
          <label>Nama Jabatan <span class="required">*</span></label>
          <input type="text" pInputText [(ngModel)]="formData.name" placeholder="Contoh: Senior Developer" class="w-full" />
        </div>
        
        <div class="form-group">
          <label>Departemen <span class="required">*</span></label>
          <p-select 
            [options]="departments" 
            [(ngModel)]="formData.departmentId"
            optionLabel="name"
            optionValue="id"
            placeholder="Pilih departemen"
            [style]="{'width': '100%'}"
          />
        </div>
        
        <div class="form-group">
          <label>Level <span class="required">*</span></label>
          <p-select 
            [options]="levels" 
            [(ngModel)]="formData.level"
            optionLabel="name"
            optionValue="value"
            placeholder="Pilih level"
            [style]="{'width': '100%'}"
          />
        </div>
        
        <div class="form-group">
          <label>Deskripsi</label>
          <input type="text" pInputText [(ngModel)]="formData.description" placeholder="Deskripsi singkat jabatan" class="w-full" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="savePosition()"></button>
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
    
    .pos-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .pos-name { font-weight: 500; color: #1E293B; }
    .pos-desc { font-size: 0.75rem; color: #64748B; }
    .text-center { text-align: center; }
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
export class PositionListComponent {
  searchText = '';
  dialogVisible = false;
  isEditMode = false;
  
  departments = [
    { id: 1, name: 'Human Resources' },
    { id: 2, name: 'Information Technology' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Marketing' },
  ];
  
  levels = [
    { name: 'Level 1 - Entry', value: 1 },
    { name: 'Level 2 - Junior', value: 2 },
    { name: 'Level 3 - Mid', value: 3 },
    { name: 'Level 4 - Senior', value: 4 },
    { name: 'Level 5 - Lead', value: 5 },
  ];
  
  positions = [
    { id: 1, name: 'HR Manager', department: 'Human Resources', departmentId: 1, level: 5, description: 'Manajer SDM', isActive: true },
    { id: 2, name: 'Senior Developer', department: 'Information Technology', departmentId: 2, level: 4, description: 'Pengembang senior', isActive: true },
    { id: 3, name: 'Junior Developer', department: 'Information Technology', departmentId: 2, level: 2, description: 'Pengembang junior', isActive: true },
    { id: 4, name: 'Accountant', department: 'Finance', departmentId: 3, level: 3, description: 'Akuntan', isActive: true },
    { id: 5, name: 'Marketing Staff', department: 'Marketing', departmentId: 4, level: 2, description: 'Staff pemasaran', isActive: false },
  ];
  
  filteredData = [...this.positions];
  
  formData = {
    id: null as number | null,
    name: '',
    departmentId: null as number | null,
    level: null as number | null,
    description: ''
  };
  
  constructor(private confirmationService: ConfirmationService) {}
  
  getLevelSeverity(level: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (level >= 5) return 'danger';
    if (level >= 4) return 'warn';
    if (level >= 3) return 'info';
    return 'secondary';
  }
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredData = this.positions.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.department.toLowerCase().includes(term)
    );
  }
  
  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, name: '', departmentId: null, level: null, description: '' };
    this.dialogVisible = true;
  }
  
  editPosition(pos: any): void {
    this.isEditMode = true;
    this.formData = { ...pos };
    this.dialogVisible = true;
  }
  
  savePosition(): void {
    if (!this.formData.name || !this.formData.departmentId || !this.formData.level) return;
    
    const dept = this.departments.find(d => d.id === this.formData.departmentId);
    
    if (this.isEditMode) {
      const index = this.positions.findIndex(p => p.id === this.formData.id);
      if (index > -1) {
        this.positions[index] = { 
          ...this.positions[index], 
          id: this.formData.id!,
          name: this.formData.name,
          departmentId: this.formData.departmentId!,
          level: this.formData.level!,
          description: this.formData.description,
          department: dept?.name || ''
        };
      }
    } else {
      const newId = Math.max(...this.positions.map(p => p.id)) + 1;
      this.positions.push({
        id: newId,
        name: this.formData.name,
        department: dept?.name || '',
        departmentId: this.formData.departmentId!,
        level: this.formData.level!,
        description: this.formData.description,
        isActive: true
      });
    }
    
    this.filteredData = [...this.positions];
    this.dialogVisible = false;
  }
  
  confirmDelete(pos: any): void {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus jabatan "${pos.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.positions = this.positions.filter(p => p.id !== pos.id);
        this.filteredData = [...this.positions];
      }
    });
  }
}
