import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  DashboardStats, 
  AttendanceSummary, 
  LateEmployee, 
  OvertimeEmployeeRanking, 
  LeaveEmployee 
} from '../models';

export interface MyDashboardStats {
  attendanceThisMonth: number;
  lateThisMonth: number;
  totalLateMenit: number;
  sisaCuti: number;
  todayStatus: 'HADIR' | 'TERLAMBAT' | 'BELUM_CHECKIN' | 'SUDAH_CHECKOUT' | null;
  todayCheckIn: string | null;
  todayCheckOut: string | null;
  pendingLeaveRequests: number;
  pendingOvertimeRequests: number;
  approvedLeaveThisMonth: number;
  approvedOvertimeThisMonth: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);
  private endpoint = '/dashboard';

  getStats(params?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Observable<DashboardStats> {
    return this.api.get<DashboardStats>(`${this.endpoint}/stats`, params);
  }

  getMyStats(karyawanId: string): Observable<MyDashboardStats> {
    return this.api.get<MyDashboardStats>(`${this.endpoint}/my-stats`, { karyawanId });
  }

  getMonthlyStats(year: number, month: number, departmentId?: string): Observable<DashboardStats> {
    const params: any = { year, month };
    if (departmentId) params.departmentId = departmentId;
    return this.api.get<DashboardStats>(`${this.endpoint}/stats/monthly`, params);
  }

  getTodayStats(departmentId?: string): Observable<DashboardStats> {
    const params = departmentId ? { departmentId } : undefined;
    return this.api.get<DashboardStats>(`${this.endpoint}/stats/today`, params);
  }

  getAttendanceSummary(params?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Observable<AttendanceSummary> {
    return this.api.get<AttendanceSummary>(`${this.endpoint}/attendance-summary`, params);
  }

  getLateRanking(params?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Observable<LateEmployee[]> {
    return this.api.get<LateEmployee[]>(`${this.endpoint}/late-ranking`, params);
  }

  getOvertimeRanking(params?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Observable<OvertimeEmployeeRanking[]> {
    return this.api.get<OvertimeEmployeeRanking[]>(`${this.endpoint}/overtime-ranking`, params);
  }

  getLeaveRanking(params?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Observable<LeaveEmployee[]> {
    return this.api.get<LeaveEmployee[]>(`${this.endpoint}/leave-ranking`, params);
  }
}
