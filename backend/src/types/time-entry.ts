// src/types/time-entry.ts

/**
 * Time Entry seed data interface
 */
export interface TimeEntrySeed {
    qbEmployeeId: string;
    employeeDisplayName: string;
    weeklySchedule: Array<{
      date: string; // YYYY-MM-DD
      hours: number;
    }>;
  }
  
  export interface TimeEntrySeedFile {
    timeEntries: TimeEntrySeed[];
    summary: {
      totalDays: number;
      dateRange: string;
      weeklyHours: Record<string, string>;
    };
  }
  
  /**
   * QuickBooks TimeActivity object structure
   */
  export interface QBTimeActivity {
    Id?: string;
    TxnDate: string; // YYYY-MM-DD
    NameOf: 'Employee' | 'Vendor';
    EmployeeRef: {
      value: string; // Employee ID
      name?: string; // Employee display name
    };
    CustomerRef?: {
      value: string; // Customer ID
      name?: string; // Customer name
    };
    Hours: number;
    Minutes?: number;
    HourlyRate?: number;
    Description?: string;
    Billable?: boolean;
    BillableStatus?: 'Billable' | 'NotBillable' | 'HasBeenBilled';
    SyncToken?: string;
    MetaData?: {
      CreateTime: string;
      LastUpdatedTime: string;
    };
  }
  
  /**
   * MongoDB TimeEntry document interface
   */
  export interface ITimeEntry {
    userId: string;
    employeeId: string; // MongoDB Employee _id
    qbEmployeeId?: string; // QuickBooks Employee ID
    qbTimeActivityId?: string; // QuickBooks TimeActivity ID
    payPeriodId?: string; // MongoDB PayPeriod _id
    date: Date;
    hours: number;
    minutes?: number;
    type: 'regular' | 'overtime' | 'pto' | 'sick';
    source: 'quickbooks' | 'manual';
    description?: string;
    hourlyRate?: number;
    billable?: boolean;
    customerId?: string;
    createdAt: Date;
    updatedAt: Date;
  }