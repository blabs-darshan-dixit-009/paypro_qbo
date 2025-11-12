// src/lib/quickbooks/employee-create.ts

import { EmployeeSeedData } from '@/types/employee';

/**
 * QuickBooks Employee Creation Service
 * Handles creating employees in QuickBooks Online
 */

interface QuickBooksEmployee {
  GivenName: string;
  FamilyName: string;
  DisplayName: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  PrimaryPhone?: {
    FreeFormNumber: string;
  };
  PrimaryAddr: {
    Line1: string;
    City: string;
    CountrySubDivisionCode: string;
    PostalCode: string;
    Country?: string;
  };
  HiredDate?: string;
  BillRate?: number;
  Active: boolean;
}

interface QuickBooksEmployeeResponse {
  Employee: {
    Id: string;
    DisplayName: string;
    GivenName: string;
    FamilyName: string;
    Active: boolean;
    SyncToken: string;
  };
}

/**
 * Check if employee exists in QuickBooks by DisplayName
 * @param accessToken - Valid QuickBooks access token
 * @param realmId - QuickBooks company realm ID
 * @param displayName - Employee display name to search
 * @returns Employee object if found, null otherwise
 */
export async function checkEmployeeExists(
  accessToken: string,
  realmId: string,
  displayName: string
): Promise<QuickBooksEmployeeResponse['Employee'] | null> {
  try {
    // Query employees by DisplayName
    const query = `SELECT * FROM Employee WHERE DisplayName = '${displayName}'`;
    const encodedQuery = encodeURIComponent(query);
    
    const response = await fetch(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodedQuery}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error checking employee existence:', errorText);
      return null;
    }

    const data = await response.json();
    
    // Check if employee exists in query results
    if (data.QueryResponse && data.QueryResponse.Employee && data.QueryResponse.Employee.length > 0) {
      return data.QueryResponse.Employee[0];
    }

    return null;
  } catch (error: any) {
    console.error('❌ Error in checkEmployeeExists:', error.message);
    return null;
  }
}

/**
 * Create employee in QuickBooks Online
 * @param accessToken - Valid QuickBooks access token
 * @param realmId - QuickBooks company realm ID
 * @param employeeData - Employee data to create
 * @returns Created employee object
 */
export async function createEmployeeInQuickBooks(
  accessToken: string,
  realmId: string,
  employeeData: EmployeeSeedData
): Promise<QuickBooksEmployeeResponse['Employee']> {
  // Prepare QuickBooks employee object
  const qbEmployee: QuickBooksEmployee = {
    GivenName: employeeData.GivenName,
    FamilyName: employeeData.FamilyName,
    DisplayName: employeeData.DisplayName,
    PrimaryEmailAddr: employeeData.PrimaryEmailAddr,
    PrimaryPhone: employeeData.PrimaryPhone,
    PrimaryAddr: {
      Line1: employeeData.PrimaryAddr.Line1,
      City: employeeData.PrimaryAddr.City,
      CountrySubDivisionCode: employeeData.PrimaryAddr.CountrySubDivisionCode,
      PostalCode: employeeData.PrimaryAddr.PostalCode,
      Country: employeeData.PrimaryAddr.Country,
    },
    Active: employeeData.Active,
  };

  // Add optional fields if present
  if (employeeData.HiredDate) {
    qbEmployee.HiredDate = employeeData.HiredDate;
  }

  if (employeeData.BillRate) {
    qbEmployee.BillRate = employeeData.BillRate;
  }

  console.log('📤 Creating employee in QuickBooks:', employeeData.DisplayName);

  const response = await fetch(
    `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/employee`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(qbEmployee),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ QuickBooks API error:', errorText);
    throw new Error(`Failed to create employee: ${errorText}`);
  }

  const data: QuickBooksEmployeeResponse = await response.json();
  console.log('✅ Employee created successfully:', data.Employee.DisplayName);

  return data.Employee;
}

/**
 * Create multiple employees from seed data
 * @param accessToken - Valid QuickBooks access token
 * @param realmId - QuickBooks company realm ID
 * @param employees - Array of employee seed data
 * @returns Summary of created and skipped employees
 */
export async function createEmployeesFromSeed(
  accessToken: string,
  realmId: string,
  employees: EmployeeSeedData[]
): Promise<{
  created: Array<{ name: string; id: string; title: string }>;
  skipped: Array<{ name: string; reason: string }>;
  errors: Array<{ name: string; error: string }>;
}> {
  const results = {
    created: [] as Array<{ name: string; id: string; title: string }>,
    skipped: [] as Array<{ name: string; reason: string }>,
    errors: [] as Array<{ name: string; error: string }>,
  };

  for (const employee of employees) {
    try {
      // Check if employee already exists
      console.log(`🔍 Checking if employee exists: ${employee.DisplayName}`);
      const existingEmployee = await checkEmployeeExists(
        accessToken,
        realmId,
        employee.DisplayName
      );

      if (existingEmployee) {
        console.log(`⏭️  Employee already exists: ${employee.DisplayName}`);
        results.skipped.push({
          name: employee.DisplayName,
          reason: `Already exists in QuickBooks (ID: ${existingEmployee.Id})`,
        });
        continue;
      }

      // Create employee
      const createdEmployee = await createEmployeeInQuickBooks(
        accessToken,
        realmId,
        employee
      );

      results.created.push({
        name: createdEmployee.DisplayName,
        id: createdEmployee.Id,
        title: employee.jobTitle,
      });

      // Add small delay between API calls to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`❌ Error creating employee ${employee.DisplayName}:`, error.message);
      results.errors.push({
        name: employee.DisplayName,
        error: error.message,
      });
    }
  }

  return results;
}