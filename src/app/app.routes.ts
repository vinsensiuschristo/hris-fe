import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  
  // Protected routes with main layout
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      
      // Leave Requests
      {
        path: 'leave-requests',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/leave-requests/leave-request-list/leave-request-list.component')
              .then(m => m.LeaveRequestListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/leave-requests/leave-request-form/leave-request-form.component')
              .then(m => m.LeaveRequestFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/leave-requests/leave-request-detail/leave-request-detail.component')
              .then(m => m.LeaveRequestDetailComponent)
          }
        ]
      },
      
      // Overtime Requests
      {
        path: 'overtime-requests',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/overtime-requests/overtime-request-list/overtime-request-list.component')
              .then(m => m.OvertimeRequestListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/overtime-requests/overtime-request-form/overtime-request-form.component')
              .then(m => m.OvertimeRequestFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/overtime-requests/overtime-request-detail/overtime-request-detail.component')
              .then(m => m.OvertimeRequestDetailComponent)
          }
        ]
      },
      
      // Attendance
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance-list/attendance-list.component')
          .then(m => m.AttendanceListComponent)
      },
      
      // Approvals (HR/Manager)
      {
        path: 'approvals',
        children: [
          {
            path: 'leave',
            loadComponent: () => import('./features/approvals/leave-approval/leave-approval.component')
              .then(m => m.LeaveApprovalComponent)
          },
          {
            path: 'leave/:id',
            loadComponent: () => import('./features/approvals/leave-approval-detail/leave-approval-detail.component')
              .then(m => m.LeaveApprovalDetailComponent)
          },
          {
            path: 'overtime',
            loadComponent: () => import('./features/approvals/overtime-approval/overtime-approval.component')
              .then(m => m.OvertimeApprovalComponent)
          },
          {
            path: 'overtime/:id',
            loadComponent: () => import('./features/approvals/overtime-approval-detail/overtime-approval-detail.component')
              .then(m => m.OvertimeApprovalDetailComponent)
          }
        ]
      },
      
      // Employees
      {
        path: 'employees',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/employees/employee-list/employee-list.component')
              .then(m => m.EmployeeListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/employees/employee-form/employee-form.component')
              .then(m => m.EmployeeFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/employees/employee-profile/employee-profile.component')
              .then(m => m.EmployeeProfileComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/employees/employee-form/employee-form.component')
              .then(m => m.EmployeeFormComponent)
          }
        ]
      },
      
      // Master Data
      {
        path: 'master',
        children: [
          {
            path: 'departments',
            loadComponent: () => import('./features/master-data/departments/department-list/department-list.component')
              .then(m => m.DepartmentListComponent)
          },
          {
            path: 'positions',
            loadComponent: () => import('./features/master-data/positions/position-list/position-list.component')
              .then(m => m.PositionListComponent)
          },
          {
            path: 'leave-types',
            loadComponent: () => import('./features/master-data/leave-types/leave-type-list/leave-type-list.component')
              .then(m => m.LeaveTypeListComponent)
          },
          {
            path: 'roles',
            loadComponent: () => import('./features/master-data/roles/role-list/role-list.component')
              .then(m => m.RoleListComponent)
          }
        ]
      },
      
      // Users
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/users/user-list/user-list.component')
              .then(m => m.UserListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/users/user-form/user-form.component')
              .then(m => m.UserFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/users/user-form/user-form.component')
              .then(m => m.UserFormComponent)
          }
        ]
      },
      
      // Reports
      {
        path: 'reports',
        children: [
          {
            path: '',
            redirectTo: 'employees',
            pathMatch: 'full'
          },
          {
            path: 'employees',
            loadComponent: () => import('./features/reports/employee-reports/employee-reports.component')
              .then(m => m.EmployeeReportsComponent)
          },
          {
            path: 'employees/:id',
            loadComponent: () => import('./features/reports/employee-report-detail/employee-report-detail.component')
              .then(m => m.EmployeeReportDetailComponent)
          }
        ]
      },
      
      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component')
          .then(m => m.ProfileComponent)
      }
    ]
  },
  
  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
