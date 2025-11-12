// src/lib/quickbooks/time.ts

import { BASE_URL } from './auth';
import { QBTimeActivity } from '@/types/time-entry';
import TimeEntry from '@/lib/db/models/TimeEntry';
import Employee from '@/lib/db/models/Employee';
import connectDB from '@/lib/db/mongodb';

/**
 * Fetch time activities from QuickBooks for a date range
 * @param accessToken - Valid QuickBooks access token
 * @param realmId - QuickBooks company realm ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of TimeActivity objects
 */
export async function fetchTimeActivitiesFromQB(
  accessToken: string,
  realmId: string,
  startDate: string,
  endDate: string
): Promise<QBTimeActivity[]> {
  try {
    console.log(`📡 Fetching time activities from QuickBooks: ${startDate} to ${endDate}`);

    const query = `SELECT * FROM TimeActivity WHERE TxnDate >= '${startDate}' AND TxnDate <= '${endDate}'`;
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
      const errorText = await response.text();
      console.error('❌ QuickBooks API error:', errorText);
      throw new Error(`Failed to fetch time activities: ${errorText}`);
    }

    const data = await response.json();
    const timeActivities = data.QueryResponse?.TimeActivity || [];

    console.log(`✅ Fetched ${timeActivities.length} time activities from QuickBooks`);

    return timeActivities;
  } catch (error: any) {
    console.error('❌ fetchTimeActivitiesFromQB error:', error);
    throw error;
  }
}

/**
 * Calculate regular vs overtime hours for a weekly summary
 * @param weeklyHours - Total hours worked in the week
 * @returns Object with regular and overtime hours
 */
function calculateHoursSplit(weeklyHours: number): { regular: number; overtime: number } {
  const regularHours = Math.min(weeklyHours, 40);
  const overtimeHours = Math.max(weeklyHours - 40, 0);
  return { regular: regularHours, overtime: overtimeHours };
}

/**
 * Import time entries from QuickBooks and store in MongoDB
 * @param userId - User identifier
 * @param payPeriodId - Pay period database ID
 * @returns Import summary with counts and breakdown
 */
export async function importTimeEntries(
  userId: string,
  payPeriodId: string
): Promise<{
  imported: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  byEmployee: Record<string, { name: string; regular: number; overtime: number; total: number }>;
}> {
  try {
    await connectDB();

    // Get pay period dates from the pay period ID
    const PayPeriod = (await import('@/lib/db/models/PayPeriod')).default;
    const payPeriod = await PayPeriod.findById(payPeriodId);

    if (!payPeriod) {
      throw new Error('Pay period not found');
    }

    const startDate = payPeriod.startDate.toISOString().split('T')[0];
    const endDate = payPeriod.endDate.toISOString().split('T')[0];

    console.log(`📅 Importing time entries for pay period: ${startDate} to ${endDate}`);

    // Get QuickBooks connection
    const { getQuickBooksConnection, getValidAccessToken } = await import('./auth');
    const connection = await getQuickBooksConnection(userId);
    const accessToken = await getValidAccessToken(userId);

    if (!accessToken || !connection?.realmId) {
      throw new Error('QuickBooks not connected');
    }

    // Fetch time activities from QuickBooks
    const qbTimeActivities = await fetchTimeActivitiesFromQB(
      accessToken,
      connection.realmId,
      startDate,
      endDate
    );

    if (qbTimeActivities.length === 0) {
      console.log('⚠️  No time activities found in QuickBooks for this period');
      return {
        imported: 0,
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        byEmployee: {},
      };
    }

    // Get all employees to map QB IDs to MongoDB IDs
    const employees = await Employee.find({ userId });
    const employeeMap = new Map();
    
    for (const emp of employees) {
      if (emp.qbEmployeeId) {
        employeeMap.set(emp.qbEmployeeId, {
          _id: emp._id,
          displayName: emp.displayName,
        });
      }
    }

    console.log(`👥 Found ${employeeMap.size} employees in database`);

    // Group time entries by employee and week for OT calculation
    const employeeWeeklyHours = new Map<string, Map<string, number>>();

    for (const activity of qbTimeActivities) {
      const qbEmployeeId = activity.EmployeeRef?.value;
      if (!qbEmployeeId) continue;

      const date = new Date(activity.TxnDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!employeeWeeklyHours.has(qbEmployeeId)) {
        employeeWeeklyHours.set(qbEmployeeId, new Map());
      }

      const weeks = employeeWeeklyHours.get(qbEmployeeId)!;
      const currentHours = weeks.get(weekKey) || 0;
      weeks.set(weekKey, currentHours + (activity.Hours || 0));
    }

    // Process each time activity
    let imported = 0;
    const byEmployee: Record<string, { name: string; regular: number; overtime: number; total: number }> = {};

    for (const activity of qbTimeActivities) {
      try {
        const qbEmployeeId = activity.EmployeeRef?.value;
        if (!qbEmployeeId) {
          console.warn('⚠️  Time activity missing employee reference');
          continue;
        }

        const employeeData = employeeMap.get(qbEmployeeId);
        if (!employeeData) {
          console.warn(`⚠️  Employee not found in database: ${qbEmployeeId}`);
          continue;
        }

        // Calculate if this entry is regular or overtime
        const date = new Date(activity.TxnDate);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        const weeklyHours = employeeWeeklyHours.get(qbEmployeeId)?.get(weekKey) || 0;
        const isOvertime = weeklyHours > 40;

        // Check if time entry already exists
        const existing = await TimeEntry.findOne({
          userId,
          employeeId: employeeData._id,
          qbTimeActivityId: activity.Id,
        });

        const timeEntryData = {
          userId,
          employeeId: employeeData._id,
          qbEmployeeId: qbEmployeeId,
          qbTimeActivityId: activity.Id,
          payPeriodId: payPeriodId,
          date: new Date(activity.TxnDate),
          hours: activity.Hours || 0,
          minutes: activity.Minutes || 0,
          type: isOvertime ? 'overtime' : 'regular',
          source: 'quickbooks',
          description: activity.Description || undefined,
          hourlyRate: activity.HourlyRate || undefined,
          billable: activity.Billable || false,
        };

        if (existing) {
          // Update existing entry
          await TimeEntry.findByIdAndUpdate(existing._id, timeEntryData);
        } else {
          // Create new entry
          await TimeEntry.create(timeEntryData);
          imported++;
        }

        // Update employee summary
        if (!byEmployee[employeeData._id.toString()]) {
          byEmployee[employeeData._id.toString()] = {
            name: employeeData.displayName,
            regular: 0,
            overtime: 0,
            total: 0,
          };
        }

        const hours = activity.Hours || 0;
        byEmployee[employeeData._id.toString()].total += hours;

        if (isOvertime) {
          byEmployee[employeeData._id.toString()].overtime += hours;
        } else {
          byEmployee[employeeData._id.toString()].regular += hours;
        }

      } catch (error: any) {
        console.error(`❌ Error processing time activity ${activity.Id}:`, error.message);
      }
    }

    // Calculate totals
    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;

    for (const empData of Object.values(byEmployee)) {
      totalHours += empData.total;
      regularHours += empData.regular;
      overtimeHours += empData.overtime;
    }

    console.log(`✅ Imported ${imported} time entries`);
    console.log(`   Total: ${totalHours}h (${regularHours}h regular, ${overtimeHours}h OT)`);

    return {
      imported,
      totalHours,
      regularHours,
      overtimeHours,
      byEmployee,
    };

  } catch (error: any) {
    console.error('❌ importTimeEntries error:', error);
    throw error;
  }
}