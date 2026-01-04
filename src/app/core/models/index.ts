// Core Entity Models for HRIS Application
// Updated to match Backend API Response format

// ===================== Master Data Models =====================

export interface Department {
  id: string;
  namaDepartment: string;
}

export interface Position {
  id: string;
  namaJabatan: string;
}

export interface Role {
  id: string;
  namaRole: string;
}

export interface LeaveType {
  id: string;
  namaJenis: string;
}

export interface RequestStatus {
  id: string;
  namaStatus: string;
}

// ===================== User & Auth Models =====================

export interface User {
  id: string;
  username: string;
  email?: string;
  roles: Role[];
  employee?: Employee;
}

// Backend returns simple auth response
export interface AuthResponse {
  token: string;
  username: string;
}

// Frontend extended auth (for storage)
export interface AuthData {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

// ===================== Employee Models =====================

export interface Employee {
  id: string;
  nama: string;
  nik: string;
  email: string;
  jabatan?: Position;
  departemen?: Department;
  sisaCuti: number;
  createdAt?: string;
  updatedAt?: string;
}

// API Response type (matches BE response structure)
export interface EmployeeResponse {
  id: string;
  nama: string;
  nik: string;
  email: string;
  jabatan?: { id: string; namaJabatan: string };
  departemen?: { id: string; namaDepartment: string };
  sisaCuti: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeCreateRequest {
  nama: string;
  nik: string;
  email: string;
  jabatanId?: string;
  departemenId?: string;
  sisaCuti?: number;
}

export interface EmployeeUpdateRequest {
  nama?: string;
  email?: string;
  jabatanId?: string;
  departemenId?: string;
  sisaCuti?: number;
}

// ===================== Leave Request Models =====================

export interface LeaveRequest {
  id: string;
  karyawan: LeaveRequestEmployee;
  jenisCuti: LeaveType;
  status: RequestStatus;
  tglMulai: string;
  tglSelesai: string;
  alasan?: string;
  jumlahHari: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRequestEmployee {
  id: string;
  nama: string;
  nik: string;
  email: string;
  sisaCuti: number;
}

export interface LeaveRequestCreateRequest {
  karyawanId: string;
  jenisCutiId: string;
  tglMulai: string;
  tglSelesai: string;
  alasan?: string;
}

// ===================== Overtime Request Models =====================

export interface OvertimeRequest {
  id: string;
  karyawan: OvertimeEmployee;
  tglLembur: string;
  jamMulai: string;
  jamSelesai: string;
  durasi: number;
  estimasiBiaya: number;
  status: RequestStatus;
  evidences?: OvertimeEvidence[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OvertimeEmployee {
  id: string;
  nama: string;
  nik: string;
  email: string;
}

export interface OvertimeRequestCreateRequest {
  karyawanId: string;
  tglLembur: string;
  jamMulai: string;
  jamSelesai: string;
}

export interface OvertimeEvidence {
  id: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
}

// ===================== Overtime Payment Models =====================

export interface OvertimePayment {
  id: string;
  pengajuanLembur: OvertimePaymentRequest;
  finance?: OvertimeEmployee;
  tglPembayaran?: string;
  status: RequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface OvertimePaymentRequest {
  id: string;
  karyawan: OvertimeEmployee;
  tglLembur: string;
  durasi: number;
  estimasiBiaya: number;
  statusLembur: string;
}

export interface OvertimePaymentCreateRequest {
  overtimeRequestId: string;
  financeId?: string;
}

// ===================== Attendance Models =====================

export interface Attendance {
  id: string;
  karyawan: AttendanceEmployee;
  tanggal: string;
  jamMasuk?: string;
  jamKeluar?: string;
  status: string; // HADIR, TERLAMBAT, IZIN, SAKIT, ALPHA
  keterlambatanMenit: number;
  keterangan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceEmployee {
  id: string;
  nama: string;
  nik: string;
  email: string;
  departemen?: string;
  jabatan?: string;
}

export interface CheckInRequest {
  karyawanId: string;
  jamMasuk?: string;
  keterangan?: string;
}

export interface CheckOutRequest {
  karyawanId: string;
  jamKeluar?: string;
}

// ===================== Dashboard Models =====================

export interface DashboardStats {
  totalKaryawan: number;
  attendanceSummary: AttendanceSummary;
  leaveSummary: LeaveSummary;
  overtimeSummary: OvertimeSummary;
  topLateEmployees: LateEmployee[];
  topOvertimeEmployees: OvertimeEmployeeRanking[];
  topLeaveEmployees: LeaveEmployee[];
}

export interface AttendanceSummary {
  totalHadir: number;
  totalTerlambat: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpha: number;
  totalKeterlambatanMenit: number;
}

export interface LeaveSummary {
  totalPengajuan: number;
  disetujui: number;
  ditolak: number;
  menunggu: number;
}

export interface OvertimeSummary {
  totalPengajuan: number;
  disetujui: number;
  ditolak: number;
  menunggu: number;
  totalBiaya: number;
  totalJamLembur: number;
}

export interface LateEmployee {
  id: string;
  nama: string;
  nik: string;
  departemen: string;
  jumlahTerlambat: number;
  totalMenitTerlambat: number;
}

export interface OvertimeEmployeeRanking {
  id: string;
  nama: string;
  nik: string;
  departemen: string;
  jumlahHariLembur: number;
  totalJamLembur: number;
  totalBiayaLembur: number;
}

export interface LeaveEmployee {
  id: string;
  nama: string;
  nik: string;
  departemen: string;
  jumlahCuti: number;
  totalHariCuti: number;
}

// ===================== API Response Models =====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
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

// ===================== Notification & Menu Models =====================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

export interface NavMenuItem {
  label?: string;
  icon?: string;
  routerLink?: string;
  children?: NavMenuItem[];
  roles?: string[];
  badge?: number;
  separator?: boolean;
}
