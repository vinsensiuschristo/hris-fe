import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { InputNumber } from 'primeng/inputnumber';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-leave-type-list',
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
    InputNumber,
    ConfirmDialog
  ],
  providers: [ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Tipe Cuti</h1>
        <p class="page-subtitle">Kelola tipe-tipe cuti karyawan</p>
      </div>
      <button pButton label="Tambah Tipe Cuti" icon="pi pi-plus" (click)="openDialog()"></button>
    </div>
    
    <div class="hris-card">
      <div class="table-header">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="Cari tipe cuti..." [(ngModel)]="searchText" (input)="onSearch()" />
        </div>
        <span class="data-count">Total: {{ filteredData.length }} tipe cuti</span>
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
            <th>Nama Tipe Cuti</th>
            <th style="width: 100px">Maks Hari</th>
            <th>Deskripsi</th>
            <th style="width: 100px">Status</th>
            <th style="width: 120px">Aksi</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-type let-i="rowIndex">
          <tr>
            <td>{{ i + 1 }}</td>
            <td>
              <div class="type-info">
                <i [class]="'pi ' + type.icon" [style.color]="type.color"></i>
                <span class="type-name">{{ type.name }}</span>
              </div>
            </td>
            <td class="text-center">
              <span class="days-badge">{{ type.maxDays }} hari</span>
            </td>
            <td class="text-muted">{{ type.description }}</td>
            <td>
              <p-tag [value]="type.isActive ? 'Aktif' : 'Nonaktif'" [severity]="type.isActive ? 'success' : 'secondary'" />
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" pTooltip="Edit" (click)="editLeaveType(type)"></button>
                <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Hapus" (click)="confirmDelete(type)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4">
              <div class="empty-state">
                <i class="pi pi-calendar empty-icon"></i>
                <p>Tidak ada data tipe cuti</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    
    <p-dialog 
      [(visible)]="dialogVisible" 
      [header]="isEditMode ? 'Edit Tipe Cuti' : 'Tambah Tipe Cuti'" 
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
    >
      <div class="dialog-content">
        <div class="form-group">
          <label>Nama Tipe Cuti <span class="required">*</span></label>
          <input type="text" pInputText [(ngModel)]="formData.name" placeholder="Contoh: Cuti Tahunan" class="w-full" />
        </div>
        
        <div class="form-group">
          <label>Maksimal Hari <span class="required">*</span></label>
          <p-inputNumber [(ngModel)]="formData.maxDays" [min]="1" [max]="365" placeholder="12" [style]="{'width': '100%'}" />
        </div>
        
        <div class="form-group">
          <label>Deskripsi</label>
          <input type="text" pInputText [(ngModel)]="formData.description" placeholder="Deskripsi tipe cuti" class="w-full" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="saveLeaveType()"></button>
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
    
    .type-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      i { font-size: 1.125rem; }
    }
    
    .type-name { font-weight: 500; color: #1E293B; }
    
    .days-badge {
      background: #DBEAFE;
      color: #1D4ED8;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
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
export class LeaveTypeListComponent {
  searchText = '';
  dialogVisible = false;
  isEditMode = false;
  
  leaveTypes = [
    { id: 1, name: 'Cuti Tahunan', maxDays: 12, description: 'Cuti tahunan yang diberikan setiap tahun', icon: 'pi-calendar', color: '#3B82F6', isActive: true },
    { id: 2, name: 'Cuti Sakit', maxDays: 14, description: 'Cuti karena alasan kesehatan', icon: 'pi-heart', color: '#EF4444', isActive: true },
    { id: 3, name: 'Cuti Melahirkan', maxDays: 90, description: 'Cuti untuk karyawan yang melahirkan', icon: 'pi-users', color: '#EC4899', isActive: true },
    { id: 4, name: 'Cuti Menikah', maxDays: 3, description: 'Cuti untuk pernikahan karyawan', icon: 'pi-heart-fill', color: '#F59E0B', isActive: true },
    { id: 5, name: 'Cuti Duka', maxDays: 3, description: 'Cuti untuk keluarga yang meninggal', icon: 'pi-star', color: '#6B7280', isActive: true },
  ];
  
  filteredData = [...this.leaveTypes];
  
  formData = {
    id: null as number | null,
    name: '',
    maxDays: null as number | null,
    description: ''
  };
  
  constructor(private confirmationService: ConfirmationService) {}
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredData = this.leaveTypes.filter(t => 
      t.name.toLowerCase().includes(term)
    );
  }
  
  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, name: '', maxDays: null, description: '' };
    this.dialogVisible = true;
  }
  
  editLeaveType(type: any): void {
    this.isEditMode = true;
    this.formData = { ...type };
    this.dialogVisible = true;
  }
  
  saveLeaveType(): void {
    if (!this.formData.name || !this.formData.maxDays) return;
    
    if (this.isEditMode) {
      const index = this.leaveTypes.findIndex(t => t.id === this.formData.id);
      if (index > -1) {
        this.leaveTypes[index].name = this.formData.name;
        this.leaveTypes[index].maxDays = this.formData.maxDays!;
        this.leaveTypes[index].description = this.formData.description;
      }
    } else {
      const newId = Math.max(...this.leaveTypes.map(t => t.id)) + 1;
      this.leaveTypes.push({
        id: newId,
        name: this.formData.name,
        maxDays: this.formData.maxDays!,
        description: this.formData.description,
        icon: 'pi-calendar',
        color: '#3B82F6',
        isActive: true
      });
    }
    
    this.filteredData = [...this.leaveTypes];
    this.dialogVisible = false;
  }
  
  confirmDelete(type: any): void {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus tipe cuti "${type.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.leaveTypes = this.leaveTypes.filter(t => t.id !== type.id);
        this.filteredData = [...this.leaveTypes];
      }
    });
  }
}
