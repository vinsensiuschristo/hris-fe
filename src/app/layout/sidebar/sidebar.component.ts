import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavMenuItem } from '../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();
  @Output() expandSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  menuItems: NavMenuItem[] = [];

  ngOnInit(): void {
    this.buildMenu();
  }

  private buildMenu(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      },
      {
        label: 'Pengajuan Cuti',
        icon: 'pi pi-calendar',
        routerLink: '/leave-requests',
        roles: ['EMPLOYEE', 'HR', 'ADMIN']
      },
      {
        label: 'Pengajuan Lembur',
        icon: 'pi pi-clock',
        routerLink: '/overtime-requests',
        roles: ['EMPLOYEE', 'HR', 'ADMIN']
      },
      {
        label: 'Persetujuan',
        icon: 'pi pi-check-square',
        roles: ['MANAGER', 'HR', 'ADMIN'],
        children: [
          {
            label: 'Persetujuan Cuti',
            icon: 'pi pi-calendar-plus',
            routerLink: '/approvals/leave'
          },
          {
            label: 'Persetujuan Lembur',
            icon: 'pi pi-clock',
            routerLink: '/approvals/overtime'
          }
        ]
      },
      {
        label: 'Kehadiran',
        icon: 'pi pi-calendar-times',
        routerLink: '/attendance',
        roles: ['EMPLOYEE', 'HR', 'ADMIN']
      },
      { separator: true },
      {
        label: 'Karyawan',
        icon: 'pi pi-users',
        routerLink: '/employees',
        roles: ['HR', 'ADMIN']
      },
      {
        label: 'Laporan',
        icon: 'pi pi-chart-bar',
        routerLink: '/reports',
        roles: ['HR', 'ADMIN']
      },
      {
        label: 'Data Master',
        icon: 'pi pi-database',
        roles: ['ADMIN'],
        children: [
          {
            label: 'Departemen',
            icon: 'pi pi-building',
            routerLink: '/master/departments'
          },
          {
            label: 'Jabatan',
            icon: 'pi pi-id-card',
            routerLink: '/master/positions'
          },
          {
            label: 'Tipe Cuti',
            icon: 'pi pi-calendar-minus',
            routerLink: '/master/leave-types'
          },
          {
            label: 'Role',
            icon: 'pi pi-shield',
            routerLink: '/master/roles'
          }
        ]
      },
      {
        label: 'Manajemen User',
        icon: 'pi pi-user-edit',
        routerLink: '/users',
        roles: ['ADMIN']
      }
    ];
  }

  isMenuVisible(item: NavMenuItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return this.authService.hasAnyRole(item.roles);
  }

  isActiveRoute(routerLink: string | undefined): boolean {
    if (!routerLink) return false;
    return this.router.url.startsWith(routerLink);
  }

  onMenuClick(): void {
    // Close mobile menu on navigation
    this.closeMobile.emit();
  }

  expandedMenus: Set<string> = new Set();

  toggleSubmenu(label: string): void {
    // If sidebar is collapsed, expand it first
    if (this.isCollapsed && !this.isMobileOpen) {
      this.expandSidebar.emit();
      // Always expand the submenu when coming from collapsed state
      this.expandedMenus.add(label);
      return;
    }
    
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
    } else {
      this.expandedMenus.add(label);
    }
  }

  isSubmenuExpanded(label: string): boolean {
    return this.expandedMenus.has(label);
  }
}
