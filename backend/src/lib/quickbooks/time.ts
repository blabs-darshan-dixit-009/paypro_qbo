// src/lib/quickbooks/time.ts
import axios from 'axios';
import { format } from 'date-fns';
import { getValidAccessToken, getQuickBooksConnection, BASE_URL } from './auth';
import Employee from '@/lib/db/models/Employee';
import TimeEntry from '@/lib/db/models/TimeEntry';
import PayPeriod from '@/lib/db/models/PayPeriod';
import connectDB from '@/lib/db/mongodb';

export interface QBTimeActivity {
  Id: string;
  TxnDate: string;
  EmployeeRef: {
    value: string;
    name: string;
  };
  Hours?: number;
  Minutes?: number;
  Description?: string;
}

/**
 * Fetch time activities from QuickBooks Online
 */
export async function fetchTimeActivitiesFromQB(
  userId: string,
  realmId: string,
  startDate: Date,
  endDate: Date
): Promise<QBTimeActivity[]> {
  const accessToken = await getValidAccessToken(userId);

  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  const query = `SELECT * FROM TimeActivity WHERE TxnDate >= '${start}' AND TxnDate <= '${end}'`;
  const url = `${BASE_URL}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    return response.data.QueryResponse?.TimeActivity || [];
  } catch (error: any) {
    console.error('Fetch time activities error:', error.response?.data || error.message);
    throw new Error('Failed to fetch time activities from QuickBooks');
  }
}

/**
 * Import time entries from QuickBooks to MongoDB
 */
export async function importTimeEntries(
  userId: string,
  payPeriodId: string
): Promise<{
  imported: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  entries: any[];
}> {
  await connectDB();

  // Get QuickBooks connection
  const connection = await getQuickBooksConnection(userId);
  if (!connection) {
    throw new Error('QuickBooks not connected');
  }

  // Get pay period
  const payPeriod = await PayPeriod.findById(payPeriodId);
  if (!payPeriod) {
    throw new Error('Pay period not found');
  }

  console.log(`🔄 Fetching time entries from ${format(payPeriod.startDate, 'MMM dd')} to ${format(payPeriod.endDate, 'MMM dd')}...`);

  // Fetch time activities from QuickBooks
  const qbTimeActivities = await fetchTimeActivitiesFromQB(
    userId,
    connection.realmId,
    payPeriod.startDate,
    payPeriod.endDate
  );

  console.log(`📥 Found ${qbTimeActivities.length} time activities`);

  // Group by employee and date
  const groupedByEmployeeAndDate = new Map<string, Map<string, number>>();

  for (const activity of qbTimeActivities) {
    const empId = activity.EmployeeRef.value;
    const date = activity.TxnDate;
    const hours = (activity.Hours || 0) + (activity.Minutes || 0) / 60;

    if (!groupedByEmployeeAndDate.has(empId)) {
      groupedByEmployeeAndDate.set(empId, new Map());
    }

    const dateMap = groupedByEmployeeAndDate.get(empId)!;
    const currentHours = dateMap.get(date) || 0;
    dateMap.set(date, currentHours + hours);
  }

  // Delete existing time entries for this pay period
  await TimeEntry.deleteMany({ payPeriodId });

  // Insert new time entries
  let imported = 0;
  let totalHours = 0;
  let regularHours = 0;
  let overtimeHours = 0;
  const entries = [];

  for (const [qbEmployeeId, dateMap] of groupedByEmployeeAndDate) {
    // Find local employee
    const employee = await Employee.findOne({ userId, qbEmployeeId });

    if (!employee) {
      console.warn(`⚠️  Employee ${qbEmployeeId} not found locally, skipping`);
      continue;
    }

    for (const [dateStr, hours] of dateMap) {
      // Determine if overtime (more than 8 hours per day)
      let regular = hours;
      let overtime = 0;

      if (hours > 8) {
        regular = 8;
        overtime = hours - 8;
      }

      const timeEntry = await TimeEntry.create({
        employeeId: employee._id,
        payPeriodId,
        qbEmployeeId,
        date: new Date(dateStr),
        hours: Math.round(hours * 100) / 100,
        type: overtime > 0 ? 'overtime' : 'regular',
        source: 'quickbooks_online',
      });

      entries.push(timeEntry);
      imported++;
      totalHours += hours;
      regularHours += regular;
      overtimeHours += overtime;

      console.log(`✅ ${employee.displayName}: ${hours} hours on ${dateStr}`);
    }
  }

  console.log(`✅ Import complete: ${imported} entries, ${totalHours.toFixed(1)} total hours`);

  return {
    imported,
    totalHours: Math.round(totalHours * 10) / 10,
    regularHours: Math.round(regularHours * 10) / 10,
    overtimeHours: Math.round(overtimeHours * 10) / 10,
    entries,
  };
}