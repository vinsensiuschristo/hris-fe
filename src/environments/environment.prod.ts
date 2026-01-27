export const environment = {
  production: true,
  apiUrl: 'https://hris-be-production-74c0.up.railway.app',
  appName: 'HRIS - Sistem Informasi SDM',
  appVersion: '1.0.0',
  
  // JWT Configuration
  tokenRefreshThreshold: 300,
  
  // Pagination defaults
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  
  // File upload limits
  maxFileSize: 5 * 1024 * 1024,
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  
  // Date format
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
};
