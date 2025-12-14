// Core Entity Models for HRIS Application

// ===================== Master Data Models =====================

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Position {
  id: number;
  name: string;
  level: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaveType {
  id: number;
  name: string;
  maxDays: number;
  description?: string;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequestStatus {
  id: number;
  name: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  description?: string;
}

// ===================== User & Auth Models =====================

export interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  roles: Role[];
  employee?: Employee;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// ===================== Employee Models =====================

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE';
  photoUrl?: string;
  department: Department;
  position: Position;
  user?: User;
  managerId?: number;
  manager?: Employee;
  hireDate: Date;
  leaveBalance: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeFilter {
  search?: string;
  departmentId?: number;
  positionId?: number;
  isActive?: boolean;
}

// ===================== Leave Request Models =====================

export interface LeaveRequest {
  id: number;
  employee: Employee;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: RequestStatus;
  approvedBy?: Employee;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LeaveRequestCreate {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveBalance {
  employeeId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  totalEntitlement: number;
  used: number;
  remaining: number;
}

// ===================== Overtime Request Models =====================

export interface OvertimeRequest {
  id: number;
  employee: Employee;
  date: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  description: string;
  status: RequestStatus;
  evidences: OvertimeEvidence[];
  approvedBy?: Employee;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface OvertimeRequestCreate {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface OvertimeEvidence {
  id: number;
  overtimeRequestId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface OvertimePayment {
  id: number;
  overtimeRequest: OvertimeRequest;
  amount: number;
  paymentDate: Date;
  notes?: string;
  paidAt: Date;
  createdAt: Date;
}

// ===================== API Response Models =====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

// ===================== Notification Models =====================

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

// ===================== Menu & Navigation Models =====================

export interface NavMenuItem {
  label?: string;
  icon?: string;
  routerLink?: string;
  children?: NavMenuItem[];
  roles?: string[];
  badge?: number;
  separator?: boolean;
}

