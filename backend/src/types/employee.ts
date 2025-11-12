// src/types/employee.ts

/**
 * TypeScript interface for employee seed data
 * Matches the structure in employees.json
 */

export interface EmployeeSeedData {
    GivenName: string;
    FamilyName: string;
    DisplayName: string;
    PrimaryEmailAddr: {
      Address: string;
    };
    PrimaryPhone: {
      FreeFormNumber: string;
    };
    PrimaryAddr: {
      Line1: string;
      City: string;
      CountrySubDivisionCode: string;
      PostalCode: string;
      Country: string;
    };
    HiredDate: string;
    BillRate: number;
    Active: boolean;
    filingStatus: 'single' | 'married' | 'head_of_household';
    allowances: number;
    additionalWithholding: number;
    department: string;
    jobTitle: string;
    paymentMethod: 'direct_deposit' | 'check';
  }
  
  export interface EmployeeSeedFile {
    employees: EmployeeSeedData[];
  }