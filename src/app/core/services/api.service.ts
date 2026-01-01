import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // ===================== GET Methods =====================

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  getOne<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}/${id}`);
  }

  getPaginated<T>(
    endpoint: string, 
    pagination: { page: number; size: number; sort?: string; direction?: 'asc' | 'desc' },
    filters?: Record<string, any>
  ): Observable<PaginatedResponse<T>> {
    const params = {
      page: pagination.page.toString(),
      size: pagination.size.toString(),
      ...(pagination.sort && { sort: `${pagination.sort},${pagination.direction || 'asc'}` }),
      ...filters
    };
    const httpParams = this.buildParams(params);
    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  // ===================== POST Methods =====================

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData);
  }

  // ===================== PUT Methods =====================

  put<T>(endpoint: string, id: number | string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}/${id}`, body);
  }

  patch<T>(endpoint: string, id: number | string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}/${id}`, body);
  }

  // ===================== DELETE Methods =====================

  delete<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}/${id}`);
  }

  // ===================== File Upload =====================

  uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }
    
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData);
  }

  uploadFiles<T>(endpoint: string, files: File[], fieldName: string = 'files'): Observable<T> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(fieldName, file);
    });
    
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData);
  }

  // ===================== Helper Methods =====================

  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return httpParams;
  }
}
