import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { LeaveRequest, LeaveRequestCreateRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private endpoint = '/leave-requests';

  getAll(): Observable<LeaveRequest[]> {
    return this.api.get<LeaveRequest[]>(this.endpoint);
  }

  getById(id: string): Observable<LeaveRequest> {
    return this.api.getOne<LeaveRequest>(this.endpoint, id);
  }

  getByKaryawanId(karyawanId: string): Observable<LeaveRequest[]> {
    return this.api.get<LeaveRequest[]>(`${this.endpoint}/karyawan/${karyawanId}`);
  }

  getPending(): Observable<LeaveRequest[]> {
    return this.api.get<LeaveRequest[]>(`${this.endpoint}/pending`);
  }

  create(request: LeaveRequestCreateRequest): Observable<LeaveRequest> {
    return this.api.post<LeaveRequest>(this.endpoint, request);
  }

  uploadEvidence(leaveRequestId: string, file: File): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filePath: string }>(
      `${environment.apiUrl}/files/leave/${leaveRequestId}/evidence`,
      formData
    );
  }

  approve(id: string, komentar?: string): Observable<LeaveRequest> {
    return this.api.put<LeaveRequest>(`${this.endpoint}`, `${id}/approve`, { komentar });
  }

  reject(id: string, komentar?: string): Observable<LeaveRequest> {
    return this.api.put<LeaveRequest>(`${this.endpoint}`, `${id}/reject`, { komentar });
  }
}

