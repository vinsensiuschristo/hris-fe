import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DepartmentService } from '../../../../core/services/master-data.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Department } from '../../../../core/models';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TableModule, 
    ButtonDirective, 
    InputText, 
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
              <th>Nama Departemen</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-dept let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>
                <span class="dept-name">{{ dept.namaDepartment }}</span>
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
              <td colspan="3" class="text-center p-4">
                <div class="empty-state">
                  <i class="pi pi-building empty-icon"></i>
                  <p>Tidak ada data departemen</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
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
          <input type="text" pInputText [(ngModel)]="formData.namaDepartment" placeholder="Contoh: Human Resources" class="w-full" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="saveDepartment()" [loading]="saving"></button>
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
    
    .dept-name {
      font-weight: 500;
      color: #1E293B;
    }
    
    .text-center { text-align: center; }
    
    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }
    
    .dialog-content {
      padding: 0.5rem 0;
    }
    
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
      
      .empty-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }
    }
    
    .w-full { width: 100%; }
  `]
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private confirmationService = inject(ConfirmationService);
  private notificationService = inject(NotificationService);

  searchText = '';
  dialogVisible = false;
  isEditMode = false;
  loading = false;
  saving = false;
  
  departments: Department[] = [];
  filteredData: Department[] = [];
  
  formData = {
    id: null as string | null,
    namaDepartment: ''
  };

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
        this.filteredData = [...data];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error('Error', 'Gagal memuat data departemen');
        console.error('Load departments error:', err);
      }
    });
  }
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredData = this.departments.filter(d => 
      d.namaDepartment.toLowerCase().includes(term)
    );
  }
  
  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, namaDepartment: '' };
    this.dialogVisible = true;
  }
  
  editDepartment(dept: Department): void {
    this.isEditMode = true;
    this.formData = { id: dept.id, namaDepartment: dept.namaDepartment };
    this.dialogVisible = true;
  }
  
  saveDepartment(): void {
    if (!this.formData.namaDepartment) {
      this.notificationService.warn('Peringatan', 'Nama departemen harus diisi');
      return;
    }
    
    this.saving = true;
    const request = { namaDepartment: this.formData.namaDepartment };
    
    if (this.isEditMode && this.formData.id) {
      this.departmentService.update(this.formData.id, request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'Departemen berhasil diperbarui');
          this.dialogVisible = false;
          this.saving = false;
          this.loadDepartments();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error('Error', 'Gagal memperbarui departemen');
          console.error('Update error:', err);
        }
      });
    } else {
      this.departmentService.create(request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'Departemen berhasil ditambahkan');
          this.dialogVisible = false;
          this.saving = false;
          this.loadDepartments();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error('Error', 'Gagal menambahkan departemen');
          console.error('Create error:', err);
        }
      });
    }
  }
  
  confirmDelete(dept: Department): void {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus departemen "${dept.namaDepartment}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.departmentService.delete(dept.id).subscribe({
          next: () => {
            this.notificationService.success('Berhasil', 'Departemen berhasil dihapus');
            this.loadDepartments();
          },
          error: (err) => {
            this.notificationService.error('Error', 'Gagal menghapus departemen');
            console.error('Delete error:', err);
          }
        });
      }
    });
  }
}
