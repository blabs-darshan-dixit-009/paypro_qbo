// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
}

// QuickBooks API Types
export interface QuickBooksAuthResponse {
  authUrl: string;
}

export interface EmployeesSyncResponse {
  success: boolean;
  message: string;
  synced: number;
  created: number;
  updated: number;
}

export interface EmployeesResponse {
  success: boolean;
  count: number;
  employees: any[];
}

export interface EmployeeResponse {
  success: boolean;
  employee: any;
}

export interface TimeEntriesResponse {
  success: boolean;
  count: number;
  totals: {
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
  };
  entries: any[];
}

export interface TimeImportResponse {
  success: boolean;
  message: string;
  imported: number;
  regularHours: number;
  overtimeHours: number;
}

export interface EmployeeTimeEntriesResponse {
  success: boolean;
  count: number;
  entries: any[];
}

export interface PayPeriodsResponse {
  success: boolean;
  count: number;
  payPeriods: any[];
}

export interface PayPeriodCreateRequest {
  userId: string;
  startDate: string;
  endDate: string;
  processDate: string;
}

export interface PayPeriodResponse {
  success: boolean;
  payPeriod: any;
}




