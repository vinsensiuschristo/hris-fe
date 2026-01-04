import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Department } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private api = inject(ApiService);
  private endpoint = '/departments';

  getAll(): Observable<Department[]> {
    return this.api.get<Department[]>(this.endpoint);
  }

  getById(id: string): Observable<Department> {
    return this.api.getOne<Department>(this.endpoint, id);
  }

  create(data: { namaDepartment: string }): Observable<Department> {
    return this.api.post<Department>(this.endpoint, data);
  }

  update(id: string, data: { namaDepartment: string }): Observable<Department> {
    return this.api.put<Department>(this.endpoint, id, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(this.endpoint, id);
  }
}
