export interface Employee {
  id: string;
  qbEmployeeId?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string;
  hourlyRate: number;
  filingStatus: 'single' | 'married' | 'head_of_household';
  allowances: number;
  additionalWithholding: number;
  isActive: boolean;
  hiredDate: string;
  releasedDate?: string | null;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  type: 'regular' | 'overtime' | 'pto' | 'sick';
}

export interface PayrollRun {
  id: string;
  startDate: string;
  endDate: string;
  processDate: string;
  status: 'draft' | 'ready' | 'processing' | 'processed' | 'synced';
  employeeCount: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalFederalTax: number;
  totalStateTax: number;
  totalSocialSecurity: number;
  totalMedicare: number;
}

export interface PayStub {
  id: string;
  employeeId: string;
  payrollRunId: string;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalDeductions: number;
  netPay: number;
}

export interface QuickBooksConnection {
  isConnected: boolean;
  companyName?: string;
  connectedSince?: string;
  lastSync?: string;
  realmId?: string;
}

export interface Activity {
  id: string;
  type: 'payroll_processed' | 'employee_added' | 'sync_completed' | 'settings_updated';
  description: string;
  timestamp: string;
  user: string;
}

export interface ChartOfAccount {
  id: string;
  name: string;
  type: string;
  number?: string;
}

