import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { OvertimeRequest, OvertimeRequestCreateRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OvertimeRequestService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
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

  uploadEvidence(overtimeRequestId: string, file: File): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filePath: string }>(
      `${environment.apiUrl}/files/overtime/${overtimeRequestId}/evidence`,
      formData
    );
  }

  approve(id: string, komentar?: string): Observable<OvertimeRequest> {
    return this.api.put<OvertimeRequest>(`${this.endpoint}`, `${id}/approve`, { komentar });
  }

  reject(id: string, komentar?: string): Observable<OvertimeRequest> {
    return this.api.put<OvertimeRequest>(`${this.endpoint}`, `${id}/reject`, { komentar });
  }
}

