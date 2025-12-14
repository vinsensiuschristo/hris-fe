import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Form User</h1>
    </div>
    <div class="hris-card">
      <p>Form user akan diimplementasikan di sini.</p>
      <a routerLink="/users" class="p-button p-button-text">Kembali</a>
    </div>
  `
})
export class UserFormComponent {}
