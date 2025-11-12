import { apiClient } from './client';
import {
  PayPeriodsResponse,
  PayPeriodCreateRequest,
  PayPeriodResponse,
} from './types';

/**
 * Payroll API Service
 * Handles all payroll related API calls
 */
export const payrollApi = {
  /**
   * Get pay periods for a user
   * GET /api/payroll/pay-period?userId={id}
   */
  getPayPeriods: async (userId: string): Promise<PayPeriodsResponse> => {
    return apiClient.get<PayPeriodsResponse>('/api/payroll/pay-period', {
      userId,
    });
  },

  /**
   * Create a new pay period
   * POST /api/payroll/pay-period
   */
  createPayPeriod: async (
    data: PayPeriodCreateRequest
  ): Promise<PayPeriodResponse> => {
    return apiClient.post<PayPeriodResponse>('/api/payroll/pay-period', data);
  },
};








