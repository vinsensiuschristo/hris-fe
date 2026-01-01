import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Employee, EmployeeCreateRequest, EmployeeUpdateRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private api = inject(ApiService);
  private endpoint = '/employees';

  getAll(): Observable<Employee[]> {
    return this.api.get<Employee[]>(this.endpoint);
  }

  getById(id: string): Observable<Employee> {
    return this.api.getOne<Employee>(this.endpoint, id);
  }

  getByNik(nik: string): Observable<Employee> {
    return this.api.get<Employee>(`${this.endpoint}/nik/${nik}`);
  }

  create(request: EmployeeCreateRequest): Observable<Employee> {
    return this.api.post<Employee>(this.endpoint, request);
  }

  update(id: string, request: EmployeeUpdateRequest): Observable<Employee> {
    return this.api.put<Employee>(this.endpoint, id, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(this.endpoint, id);
  }
}
