// src/lib/quickbooks/time-create.ts

import { QBTimeActivity, TimeEntrySeed } from '@/types/time-entry';
import { BASE_URL } from './auth';

/**
 * Create a single time activity in QuickBooks
 * @param accessToken - Valid QuickBooks access token
 * @param realmId - QuickBooks company realm ID
 * @param employeeId - QuickBooks employee ID
 * @param employeeName - Employee display name
 * @param date - Date of work (YYYY-MM-DD)
 * @param hours - Hours worked
 * @param hourlyRate - Employee hourly rate
 * @param customerId - Optional customer ID
 * @returns Created TimeActivity object
 */
export async function createTimeActivity(
  accessToken: string,
  realmId: string,
  employeeId: string,
  employeeName: string,
  date: string,
  hours: number,
  hourlyRate: number,
  customerId?: string
): Promise<QBTimeActivity> {
  // Use StartTime and EndTime based on the docs
  // For historical dates, provide TxnDate + time-only StartTime/EndTime
  const startHour = 9;
  const endHour = startHour + hours;
  console.log("accessToken :: ", accessToken)
  
  const timeActivity: any = {
    TxnDate: date,
    NameOf: 'Employee',
    EmployeeRef: {
      value: employeeId,
      name: employeeName,
    },
    CustomerRef: {
      value: customerId || '1',
      name: 'Amy\'s Bird Sanctuary',
    },
    ItemRef: {
      value: '2',
      name: 'Hours',
    },
    BillableStatus: 'NotBillable',
    Taxable: false,
    HourlyRate: 0,
    Hours: hours,
    Minutes: 0,
  };

  console.log(`📤 Creating time entry: ${employeeName} - ${date} - ${hours}h`);
  console.log('📤 Request body:', JSON.stringify(timeActivity, null, 2));

  const response = await fetch(
    `${BASE_URL}/v3/company/${realmId}/timeactivity`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeActivity),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ QuickBooks API error:', errorText);
    throw new Error(`Failed to create time activity: ${errorText}`);
  }

  const data = await response.json();
  console.log(`✅ Created time entry ID: ${data.TimeActivity.Id}`);

  return data.TimeActivity;
}

/**
 * Check if time activity already exists for employee on specific date
 * @param accessToken - Valid QuickBooks access token
 * @param realmId - QuickBooks company realm ID
 * @param employeeId - QuickBooks employee ID
 * @param date - Date to check (YYYY-MM-DD)
 * @returns TimeActivity if exists, null otherwise
 */
export async function checkTimeActivityExists(
  accessToken: string,
  realmId: string,
  employeeId: string,
  date: string
): Promise<QBTimeActivity | null> {
  try {
    const query = `SELECT * FROM TimeActivity WHERE EmployeeRef = '${employeeId}' AND TxnDate = '${date}'`;
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
      `${BASE_URL}/v3/company/${realmId}/query?query=${encodedQuery}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.QueryResponse?.TimeActivity && data.QueryResponse.TimeActivity.length > 0) {
      return data.QueryResponse.TimeActivity[0];
    }

    return null;
  } catch (error: any) {
    console.error('❌ Error checking time activity:', error.message);
    return null;
  }
}

/**
 * Create multiple time entries from seed data
 * @param accessToken - Valid QuickBooks access token
 * @param realmId - QuickBooks company realm ID
 * @param employees - Map of QB employee IDs to employee data
 * @param timeEntries - Seed data for time entries
 * @param customerId - Optional customer ID for all entries
 * @returns Summary of created and skipped entries
 */
export async function createTimeEntriesFromSeed(
  accessToken: string,
  realmId: string,
  employees: Map<string, { name: string; rate: number }>,
  timeEntries: TimeEntrySeed[],
  customerId?: string
): Promise<{
  created: number;
  skipped: number;
  errors: number;
  details: Array<{ employee: string; date: string; status: string }>;
}> {
  const results = {
    created: 0,
    skipped: 0,
    errors: 0,
    details: [] as Array<{ employee: string; date: string; status: string }>,
  };

  for (const entry of timeEntries) {
    const employee = employees.get(entry.qbEmployeeId);

    if (!employee) {
      console.warn(`⚠️  Employee not found with QB ID: ${entry.qbEmployeeId} (${entry.employeeDisplayName})`);
      results.errors++;
      continue;
    }

    console.log(`\n👤 Processing ${entry.employeeDisplayName} (QB ID: ${entry.qbEmployeeId})...`);

    for (const day of entry.weeklySchedule) {
      try {
        // Check if time entry already exists
        const existing = await checkTimeActivityExists(
          accessToken,
          realmId,
          entry.qbEmployeeId,
          day.date
        );

        if (existing) {
          console.log(`⏭️  Skipped: ${day.date} (already exists)`);
          results.skipped++;
          results.details.push({
            employee: entry.employeeDisplayName,
            date: day.date,
            status: 'skipped',
          });
          continue;
        }

        // Create time activity
        await createTimeActivity(
          accessToken,
          realmId,
          entry.qbEmployeeId,
          employee.name,
          day.date,
          day.hours,
          employee.rate,
          customerId
        );

        results.created++;
        results.details.push({
          employee: entry.employeeDisplayName,
          date: day.date,
          status: 'created',
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));

      } catch (error: any) {
        console.error(`❌ Error creating entry for ${day.date}:`, error.message);
        results.errors++;
        results.details.push({
          employee: entry.employeeDisplayName,
          date: day.date,
          status: 'error',
        });
      }
    }
  }

  return results;
}