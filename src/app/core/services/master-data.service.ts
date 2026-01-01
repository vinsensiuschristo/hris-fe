import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Department, Position, LeaveType, Role } from '../models';

// ===================== Department Service =====================
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

  create(request: { namaDepartment: string }): Observable<Department> {
    return this.api.post<Department>(this.endpoint, request);
  }

  update(id: string, request: { namaDepartment: string }): Observable<Department> {
    return this.api.put<Department>(this.endpoint, id, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(this.endpoint, id);
  }
}

// ===================== Position Service =====================
@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private api = inject(ApiService);
  private endpoint = '/positions';

  getAll(): Observable<Position[]> {
    return this.api.get<Position[]>(this.endpoint);
  }

  getById(id: string): Observable<Position> {
    return this.api.getOne<Position>(this.endpoint, id);
  }

  create(request: { namaJabatan: string }): Observable<Position> {
    return this.api.post<Position>(this.endpoint, request);
  }

  update(id: string, request: { namaJabatan: string }): Observable<Position> {
    return this.api.put<Position>(this.endpoint, id, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(this.endpoint, id);
  }
}

// ===================== Leave Type Service =====================
@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {
  private api = inject(ApiService);
  private endpoint = '/leave-types';

  getAll(): Observable<LeaveType[]> {
    return this.api.get<LeaveType[]>(this.endpoint);
  }

  getById(id: string): Observable<LeaveType> {
    return this.api.getOne<LeaveType>(this.endpoint, id);
  }

  create(request: { namaJenis: string }): Observable<LeaveType> {
    return this.api.post<LeaveType>(this.endpoint, request);
  }

  update(id: string, request: { namaJenis: string }): Observable<LeaveType> {
    return this.api.put<LeaveType>(this.endpoint, id, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(this.endpoint, id);
  }
}

// ===================== Role Service =====================
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private api = inject(ApiService);
  private endpoint = '/roles';

  getAll(): Observable<Role[]> {
    return this.api.get<Role[]>(this.endpoint);
  }

  getById(id: string): Observable<Role> {
    return this.api.getOne<Role>(this.endpoint, id);
  }

  create(request: { namaRole: string }): Observable<Role> {
    return this.api.post<Role>(this.endpoint, request);
  }

  update(id: string, request: { namaRole: string }): Observable<Role> {
    return this.api.put<Role>(this.endpoint, id, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(this.endpoint, id);
  }
}
