<div class="page-container"><div class="page-content">import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PositionService } from '../../../../core/services/master-data.service';
import { Position } from '../../../../core/models';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonDirective, InputText,
    ToastModule, ConfirmDialogModule, DialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Jabatan</h1>
        <p class="page-subtitle">Kelola data jabatan perusahaan</p>
      </div>
      <button pButton label="Tambah Jabatan" icon="pi pi-plus" (click)="openDialog()"></button>
    </div>
    
    <div class="hris-card">
      @if (loading()) {
        <div class="loading-container"><i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i><p>Memuat data...</p></div>
      } @else {
        <p-table [value]="positions()" [paginator]="true" [rows]="10" [rowHover]="true">
          <ng-template pTemplate="header"><tr><th>Nama Jabatan</th><th style="width: 120px">Aksi</th></tr></ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ item.namaJabatan }}</td>
              <td>
                <button pButton icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" (click)="editItem(item)"></button>
                <button pButton icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (click)="confirmDelete(item)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="2" class="text-center p-4"><p class="text-muted">Belum ada data</p></td></tr></ng-template>
        </p-table>
      }
    </div>

    <p-dialog [header]="isEditMode ? 'Edit Jabatan' : 'Tambah Jabatan'" [(visible)]="dialogVisible" [modal]="true" [style]="{ width: '400px' }">
      <div class="form-group">
        <label>Nama Jabatan</label>
        <input pInputText [(ngModel)]="formData.namaJabatan" placeholder="Masukkan nama jabatan" style="width: 100%" />
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Batal" [text]="true" severity="secondary" (click)="dialogVisible = false"></button>
        <button pButton [label]="isEditMode ? 'Simpan' : 'Tambah'" icon="pi pi-save" (click)="saveItem()" [loading]="submitting()"></button>
      </ng-template>
    </p-dialog>
    <p-toast /><p-confirmDialog />
  `,
  styles: [`.loading-container{display:flex;flex-direction:column;align-items:center;padding:3rem;color:var(--hris-gray-500)}.text-muted{color:var(--hris-gray-500)}.form-group{margin-bottom:1rem}.form-group label{display:block;margin-bottom:.5rem;font-weight:500}`]
})
export class PositionListComponent implements OnInit {
  private service = inject(PositionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  positions = signal<Position[]>([]);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  dialogVisible = false;
  isEditMode = false;
  editingId: string | null = null;
  formData = { namaJabatan: '' };

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.positions.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.messageService.add({severity:'error',summary:'Error',detail:'Gagal memuat data'}); }
    });
  }

  openDialog(): void { this.isEditMode = false; this.editingId = null; this.formData = { namaJabatan: '' }; this.dialogVisible = true; }

  editItem(item: Position): void { this.isEditMode = true; this.editingId = item.id; this.formData = { namaJabatan: item.namaJabatan }; this.dialogVisible = true; }

  saveItem(): void {
    if (!this.formData.namaJabatan.trim()) { this.messageService.add({severity:'warn',summary:'Peringatan',detail:'Nama wajib diisi'}); return; }
    this.submitting.set(true);
    const request$ = this.isEditMode && this.editingId ? this.service.update(this.editingId, this.formData) : this.service.create(this.formData);
    request$.subscribe({
      next: () => { this.submitting.set(false); this.dialogVisible = false; this.messageService.add({severity:'success',summary:'Berhasil',detail:this.isEditMode?'Diperbarui':'Ditambahkan'}); this.loadData(); },
      error: (err) => { this.submitting.set(false); this.messageService.add({severity:'error',summary:'Error',detail:err.error?.message||'Gagal menyimpan'}); }
    });
  }

  confirmDelete(item: Position): void {
    this.confirmationService.confirm({
      message: `Hapus jabatan "${item.namaJabatan}"?`, header: 'Konfirmasi Hapus', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus', rejectLabel: 'Batal',
      accept: () => { this.service.delete(item.id).subscribe({ next: () => { this.messageService.add({severity:'success',summary:'Berhasil',detail:'Dihapus'}); this.loadData(); }, error: () => this.messageService.add({severity:'error',summary:'Error',detail:'Gagal menghapus'}) }); }
    });
  }
}
</div></div>
