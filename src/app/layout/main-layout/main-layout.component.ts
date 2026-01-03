import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  
  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  currentRoute = signal('');

  ngOnInit(): void {
    // Track route changes for breadcrumbs
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute.set(event.urlAfterRedirects);
      // Auto-close mobile menu on navigation
      this.isMobileMenuOpen.set(false);
    });
    
    // Check screen size on init
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  expandSidebar(): void {
    this.isSidebarCollapsed.set(false);
  }

  private checkScreenSize(): void {
    if (window.innerWidth < 992) {
      this.isSidebarCollapsed.set(true);
    }
  }
}
