import { apiClient } from './client';
import {
  QuickBooksAuthResponse,
  EmployeesSyncResponse,
  EmployeesResponse,
  EmployeeResponse,
  TimeEntriesResponse,
  TimeImportResponse,
  EmployeeTimeEntriesResponse,
} from './types';

/**
 * QuickBooks API Service
 * Handles all QuickBooks related API calls
 */
export const quickbooksApi = {
  /**
   * Get QuickBooks OAuth authorization URL
   * GET /api/quickbooks/connect?userId={id}
   */
  getAuthUrl: async (userId: string): Promise<QuickBooksAuthResponse> => {
    return apiClient.get<QuickBooksAuthResponse>('/api/quickbooks/connect', {
      userId,
    });
  },

  /**
   * Get all employees from database
   * GET /api/quickbooks/employees?userId={id}
   */
  getEmployees: async (userId: string): Promise<EmployeesResponse> => {
    return apiClient.get<EmployeesResponse>('/api/quickbooks/employees', {
      userId,
    });
  },

  /**
   * Get single employee by ID
   * GET /api/quickbooks/employees/{id}
   */
  getEmployee: async (employeeId: string): Promise<EmployeeResponse> => {
    return apiClient.get<EmployeeResponse>(`/api/quickbooks/employees/${employeeId}`);
  },

  /**
   * Sync employees from QuickBooks
   * POST /api/quickbooks/employees/sync
   */
  syncEmployees: async (userId: string): Promise<EmployeesSyncResponse> => {
    return apiClient.post<EmployeesSyncResponse>(
      '/api/quickbooks/employees/sync',
      { userId }
    );
  },

  /**
   * Get time entries for a pay period
   * GET /api/quickbooks/time?payPeriodId={id}
   */
  getTimeEntries: async (payPeriodId: string): Promise<TimeEntriesResponse> => {
    return apiClient.get<TimeEntriesResponse>('/api/quickbooks/time', {
      payPeriodId,
    });
  },

  /**
   * Import time entries from QuickBooks
   * POST /api/quickbooks/time/import
   */
  importTimeEntries: async (
    userId: string,
    payPeriodId: string
  ): Promise<TimeImportResponse> => {
    return apiClient.post<TimeImportResponse>('/api/quickbooks/time/import', {
      userId,
      payPeriodId,
    });
  },

  /**
   * Get time entries for a specific employee
   * GET /api/quickbooks/time/employee/{employeeId}?limit={limit}
   */
  getEmployeeTimeEntries: async (
    employeeId: string,
    limit: number = 20
  ): Promise<EmployeeTimeEntriesResponse> => {
    return apiClient.get<EmployeeTimeEntriesResponse>(
      `/api/quickbooks/time/employee/${employeeId}`,
      { limit: limit.toString() }
    );
  },
};




