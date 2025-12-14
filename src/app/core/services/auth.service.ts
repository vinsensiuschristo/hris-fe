import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, throwError, of, delay } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, User, Role } from '../models';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'hris_access_token';
const REFRESH_TOKEN_KEY = 'hris_refresh_token';
const USER_KEY = 'hris_user';

// Mock data for development
const MOCK_USERS: { [key: string]: { password: string; user: User } } = {
  'admin': {
    password: 'admin123',
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@hris.com',
      isActive: true,
      roles: [{ id: 1, name: 'ADMIN', description: 'Administrator' }],
      employee: {
        id: 1,
        employeeCode: 'EMP001',
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@hris.com',
        department: { id: 1, name: 'IT', code: 'IT' },
        position: { id: 1, name: 'System Administrator', level: 1 },
        hireDate: new Date('2020-01-01'),
        leaveBalance: 12,
        isActive: true
      }
    }
  },
  'hr': {
    password: 'hr123',
    user: {
      id: 2,
      username: 'hr',
      email: 'hr@hris.com',
      isActive: true,
      roles: [{ id: 2, name: 'HR', description: 'Human Resources' }],
      employee: {
        id: 2,
        employeeCode: 'EMP002',
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@hris.com',
        department: { id: 2, name: 'Human Resources', code: 'HR' },
        position: { id: 2, name: 'HR Manager', level: 2 },
        hireDate: new Date('2021-03-15'),
        leaveBalance: 12,
        isActive: true
      }
    }
  },
  'employee': {
    password: 'emp123',
    user: {
      id: 3,
      username: 'employee',
      email: 'employee@hris.com',
      isActive: true,
      roles: [{ id: 3, name: 'EMPLOYEE', description: 'Employee' }],
      employee: {
        id: 3,
        employeeCode: 'EMP003',
        firstName: 'John',
        lastName: 'Doe',
        email: 'employee@hris.com',
        department: { id: 1, name: 'IT', code: 'IT' },
        position: { id: 3, name: 'Software Developer', level: 3 },
        hireDate: new Date('2022-06-01'),
        leaveBalance: 10,
        isActive: true
      }
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Enable mock mode for development (set to false when backend is ready)
  private useMockAuth = true;

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    const user = this.storageService.get<User>(USER_KEY);
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (this.useMockAuth) {
      return this.mockLogin(credentials);
    }
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.storeAuthData(response, credentials.rememberMe);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  private mockLogin(credentials: LoginRequest): Observable<AuthResponse> {
    const mockUser = MOCK_USERS[credentials.username.toLowerCase()];
    
    if (!mockUser || mockUser.password !== credentials.password) {
      return throwError(() => ({
        status: 401,
        error: { message: 'Username atau password salah' }
      })).pipe(delay(500));
    }

    const response: AuthResponse = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: mockUser.user
    };

    return of(response).pipe(
      delay(800), // Simulate network delay
      tap(res => {
        this.storeAuthData(res, credentials.rememberMe);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (this.useMockAuth) {
      // In mock mode, just return current user
      const user = this.currentUser;
      if (user) {
        return of({
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          tokenType: 'Bearer',
          expiresIn: 3600,
          user
        });
      }
      return throwError(() => new Error('No user logged in'));
    }
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.storeAuthData(response, true);
        }),
        catchError(error => {
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    if (this.useMockAuth && this.currentUser) {
      return of(this.currentUser);
    }
    
    return this.http.get<User>(`${environment.apiUrl}/auth/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.storageService.set(USER_KEY, user);
        })
      );
  }

  private storeAuthData(response: AuthResponse, rememberMe?: boolean): void {
    const storage = rememberMe ? 'local' : 'session';
    
    this.storageService.set(TOKEN_KEY, response.accessToken, storage);
    this.storageService.set(REFRESH_TOKEN_KEY, response.refreshToken, storage);
    this.storageService.set(USER_KEY, response.user, storage);
    
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    this.storageService.remove(TOKEN_KEY);
    this.storageService.remove(REFRESH_TOKEN_KEY);
    this.storageService.remove(USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.storageService.get<string>(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storageService.get<string>(REFRESH_TOKEN_KEY);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser;
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.name === role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
}
