import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EmployeeCreateRequest, EmployeeUpdateRequest, EmployeeResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private api = inject(ApiService);
  private endpoint = '/employees';

  getAll(): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(this.endpoint);
  }

  getById(id: string): Observable<EmployeeResponse> {
    return this.api.getOne<EmployeeResponse>(this.endpoint, id);
  }

  getByNik(nik: string): Observable<EmployeeResponse> {
    return this.api.get<EmployeeResponse>(`${this.endpoint}/nik/${nik}`);
  }

  create(request: EmployeeCreateRequest): Observable<EmployeeResponse> {
    return this.api.post<EmployeeResponse>(this.endpoint, request);
  }

  update(id: string, request: EmployeeUpdateRequest): Observable<EmployeeResponse> {
    return this.api.put<EmployeeResponse>(this.endpoint, id, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(this.endpoint, id);
  }
}
