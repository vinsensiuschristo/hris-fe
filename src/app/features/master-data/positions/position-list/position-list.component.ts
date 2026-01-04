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
import { PositionService } from '../../../../core/services/master-data.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Position } from '../../../../core/models';

@Component({
  selector: 'app-position-list',
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
              <th>Nama Jabatan</th>
              <th style="width: 120px">Aksi</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-pos let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>
                <div class="pos-info">
                  <div class="pos-icon">
                    <i class="pi pi-briefcase"></i>
                  </div>
                  <span class="pos-name">{{ pos.namaJabatan }}</span>
                </div>
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
              <td colspan="3" class="text-center p-4">
                <div class="empty-state">
                  <i class="pi pi-briefcase empty-icon"></i>
                  <p>Tidak ada data jabatan</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
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
          <input type="text" pInputText [(ngModel)]="formData.namaJabatan" placeholder="Contoh: Senior Developer" class="w-full" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-check" (click)="savePosition()" [loading]="saving"></button>
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
      align-items: center;
      gap: 0.75rem;
    }
    
    .pos-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #8B5CF6;
      
      i { color: white; font-size: 0.875rem; }
    }
    
    .pos-name { font-weight: 500; color: #1E293B; }
    
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
export class PositionListComponent implements OnInit {
  private positionService = inject(PositionService);
  private confirmationService = inject(ConfirmationService);
  private notificationService = inject(NotificationService);

  searchText = '';
  dialogVisible = false;
  isEditMode = false;
  loading = false;
  saving = false;
  
  positions: Position[] = [];
  filteredData: Position[] = [];
  
  formData = {
    id: null as string | null,
    namaJabatan: ''
  };

  ngOnInit(): void {
    this.loadPositions();
  }

  loadPositions(): void {
    this.loading = true;
    this.positionService.getAll().subscribe({
      next: (data) => {
        this.positions = data;
        this.filteredData = [...data];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error('Error', 'Gagal memuat data jabatan');
        console.error('Load positions error:', err);
      }
    });
  }
  
  onSearch(): void {
    const term = this.searchText.toLowerCase();
    this.filteredData = this.positions.filter(p => 
      p.namaJabatan.toLowerCase().includes(term)
    );
  }
  
  openDialog(): void {
    this.isEditMode = false;
    this.formData = { id: null, namaJabatan: '' };
    this.dialogVisible = true;
  }
  
  editPosition(pos: Position): void {
    this.isEditMode = true;
    this.formData = { id: pos.id, namaJabatan: pos.namaJabatan };
    this.dialogVisible = true;
  }
  
  savePosition(): void {
    if (!this.formData.namaJabatan) {
      this.notificationService.warn('Peringatan', 'Nama jabatan harus diisi');
      return;
    }
    
    this.saving = true;
    const request = { namaJabatan: this.formData.namaJabatan };
    
    if (this.isEditMode && this.formData.id) {
      this.positionService.update(this.formData.id, request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'Jabatan berhasil diperbarui');
          this.dialogVisible = false;
          this.saving = false;
          this.loadPositions();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error('Error', 'Gagal memperbarui jabatan');
          console.error('Update error:', err);
        }
      });
    } else {
      this.positionService.create(request).subscribe({
        next: () => {
          this.notificationService.success('Berhasil', 'Jabatan berhasil ditambahkan');
          this.dialogVisible = false;
          this.saving = false;
          this.loadPositions();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error('Error', 'Gagal menambahkan jabatan');
          console.error('Create error:', err);
        }
      });
    }
  }
  
  confirmDelete(pos: Position): void {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus jabatan "${pos.namaJabatan}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      accept: () => {
        this.positionService.delete(pos.id).subscribe({
          next: () => {
            this.notificationService.success('Berhasil', 'Jabatan berhasil dihapus');
            this.loadPositions();
          },
          error: (err) => {
            this.notificationService.error('Error', 'Gagal menghapus jabatan');
            console.error('Delete error:', err);
          }
        });
      }
    });
  }
}
