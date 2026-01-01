import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LeaveRequest, LeaveRequestCreateRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private api = inject(ApiService);
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

  approve(id: string, komentar?: string): Observable<LeaveRequest> {
    return this.api.put<LeaveRequest>(`${this.endpoint}`, `${id}/approve`, { komentar });
  }

  reject(id: string, komentar?: string): Observable<LeaveRequest> {
    return this.api.put<LeaveRequest>(`${this.endpoint}`, `${id}/reject`, { komentar });
  }
}
