import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { OvertimeRequest, OvertimeRequestCreateRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OvertimeRequestService {
  private api = inject(ApiService);
  private endpoint = '/overtime-requests';

  getAll(): Observable<OvertimeRequest[]> {
    return this.api.get<OvertimeRequest[]>(this.endpoint);
  }

  getById(id: string): Observable<OvertimeRequest> {
    return this.api.getOne<OvertimeRequest>(this.endpoint, id);
  }

  getByKaryawanId(karyawanId: string): Observable<OvertimeRequest[]> {
    return this.api.get<OvertimeRequest[]>(`${this.endpoint}/karyawan/${karyawanId}`);
  }

  getPending(): Observable<OvertimeRequest[]> {
    return this.api.get<OvertimeRequest[]>(`${this.endpoint}/pending`);
  }

  getApproved(): Observable<OvertimeRequest[]> {
    return this.api.get<OvertimeRequest[]>(`${this.endpoint}/approved`);
  }

  create(request: OvertimeRequestCreateRequest): Observable<OvertimeRequest> {
    return this.api.post<OvertimeRequest>(this.endpoint, request);
  }

  approve(id: string, komentar?: string): Observable<OvertimeRequest> {
    return this.api.put<OvertimeRequest>(`${this.endpoint}`, `${id}/approve`, { komentar });
  }

  reject(id: string, komentar?: string): Observable<OvertimeRequest> {
    return this.api.put<OvertimeRequest>(`${this.endpoint}`, `${id}/reject`, { komentar });
  }
}
