export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'HRIS - Sistem Informasi SDM',
  appVersion: '1.0.0',
  
  // JWT Configuration
  tokenRefreshThreshold: 300, // Refresh token 5 menit sebelum expired (dalam detik)
  
  // Pagination defaults
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  
  // File upload limits
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  
  // Date format
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
};
