import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, delay, map } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, AuthData, LoginRequest, User, Role } from '../models';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'hris_access_token';
const REFRESH_TOKEN_KEY = 'hris_refresh_token';
const USER_KEY = 'hris_user';

// Mock data for development fallback
const MOCK_USERS: { [key: string]: { password: string; user: User } } = {
  'admin': {
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@hris.com',
      roles: [{ id: '1', namaRole: 'ADMIN' }]
    }
  },
  'karyawan': {
    password: 'karyawan123',
    user: {
      id: '2',
      username: 'karyawan',
      email: 'karyawan@hris.com',
      roles: [{ id: '2', namaRole: 'KARYAWAN' }]
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

  // Set to FALSE to use real backend API
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

  login(credentials: LoginRequest): Observable<AuthData> {
    if (this.useMockAuth) {
      return this.mockLogin(credentials);
    }
    
    // Real API call to backend
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      username: credentials.username,
      password: credentials.password
    }).pipe(
      map(response => {
        // Transform backend response to frontend AuthData format
        const authData: AuthData = {
          accessToken: response.token,
          tokenType: 'Bearer',
          user: {
            id: '',
            username: response.username,
            roles: []
          }
        };
        return authData;
      }),
      tap(authData => {
        this.storeAuthData(authData, credentials.rememberMe);
        // Fetch user details after login
        this.fetchUserDetails();
      }),
      catchError(error => {
        console.error('Login error:', error);
        const errorMessage = error.error?.message || error.error || 'Login gagal. Periksa username dan password.';
        return throwError(() => ({ status: error.status, error: { message: errorMessage } }));
      })
    );
  }

  private fetchUserDetails(): void {
    // Decode JWT to get user info (or call /auth/me endpoint if available)
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.sub || '',
          username: payload.sub || '',
          roles: payload.roles ? payload.roles.split(',').map((r: string) => ({ id: '', namaRole: r.replace('ROLE_', '') })) : []
        };
        this.currentUserSubject.next(user);
        this.storageService.set(USER_KEY, user);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }

  register(request: { username: string; password: string }): Observable<AuthData> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request).pipe(
      map(response => {
        const authData: AuthData = {
          accessToken: response.token,
          tokenType: 'Bearer',
          user: {
            id: '',
            username: response.username,
            roles: [{ id: '', namaRole: 'KARYAWAN' }]
          }
        };
        return authData;
      }),
      tap(authData => {
        this.storeAuthData(authData, true);
      }),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  private mockLogin(credentials: LoginRequest): Observable<AuthData> {
    const mockUser = MOCK_USERS[credentials.username.toLowerCase()];
    
    if (!mockUser || mockUser.password !== credentials.password) {
      return throwError(() => ({
        status: 401,
        error: { message: 'Username atau password salah' }
      })).pipe(delay(500));
    }

    const authData: AuthData = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: mockUser.user
    };

    return of(authData).pipe(
      delay(800),
      tap(data => {
        this.storeAuthData(data, credentials.rememberMe);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
  }

  refreshToken(): Observable<AuthData> {
    const refreshToken = this.getRefreshToken();
    
    if (this.useMockAuth) {
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
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      map(response => ({
        accessToken: response.token,
        tokenType: 'Bearer',
        user: this.currentUser!
      })),
      tap(authData => {
        this.storeAuthData(authData, true);
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
    
    // If backend has /auth/me endpoint, use it
    // For now, return stored user
    if (this.currentUser) {
      return of(this.currentUser);
    }
    
    return throwError(() => new Error('No user logged in'));
  }

  private storeAuthData(authData: AuthData, rememberMe?: boolean): void {
    const storage = rememberMe ? 'local' : 'session';
    
    this.storageService.set(TOKEN_KEY, authData.accessToken, storage);
    if (authData.refreshToken) {
      this.storageService.set(REFRESH_TOKEN_KEY, authData.refreshToken, storage);
    }
    this.storageService.set(USER_KEY, authData.user, storage);
    
    this.currentUserSubject.next(authData.user);
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
    return user.roles.some(r => r.namaRole === role || r.namaRole === `ROLE_${role}`);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
}
