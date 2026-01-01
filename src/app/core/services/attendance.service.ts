import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Attendance, CheckInRequest, CheckOutRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private api = inject(ApiService);
  private endpoint = '/attendances';

  getAll(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    departmentId?: string;
  }): Observable<Attendance[]> {
    return this.api.get<Attendance[]>(this.endpoint, params);
  }

  getById(id: string): Observable<Attendance> {
    return this.api.getOne<Attendance>(this.endpoint, id);
  }

  getByKaryawanId(karyawanId: string): Observable<Attendance[]> {
    return this.api.get<Attendance[]>(`${this.endpoint}/karyawan/${karyawanId}`);
  }

  getByDate(date: string): Observable<Attendance[]> {
    return this.api.get<Attendance[]>(`${this.endpoint}/date/${date}`);
  }

  checkIn(request: CheckInRequest): Observable<Attendance> {
    return this.api.post<Attendance>(`${this.endpoint}/check-in`, request);
  }

  checkOut(request: CheckOutRequest): Observable<Attendance> {
    return this.api.post<Attendance>(`${this.endpoint}/check-out`, request);
  }

  recordAbsence(karyawanId: string, tanggal: string, status: string, keterangan?: string): Observable<Attendance> {
    const params = { karyawanId, tanggal, status, keterangan };
    return this.api.post<Attendance>(`${this.endpoint}/absence`, null);
  }
}
