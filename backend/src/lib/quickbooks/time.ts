// src/lib/quickbooks/time.ts
import axios from 'axios';
import { getValidAccessToken, getQuickBooksConnection, BASE_URL } from './auth';
import Employee from '@/lib/db/models/Employee';
import TimeEntry from '@/lib/db/models/TimeEntry';
import PayPeriod from '@/lib/db/models/PayPeriod';
import connectDB from '@/lib/db/mongodb';
import { format } from 'date-fns';

/**
 * Fetch time activities from QuickBooks Online
 */
export async function fetchTimeActivitiesFromQB(
  userId: string,
  realmId: string,
  startDate: Date,
  endDate: Date
) {
  const accessToken = await getValidAccessToken(userId);

  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  const query = `SELECT * FROM TimeActivity WHERE TxnDate >= '${start}' AND TxnDate <= '${end}'`;

  try {
    const response = await axios.get(
      `${BASE_URL}/v3/company/${realmId}/query`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        params: { query }
      }
    );

    return response.data.QueryResponse?.TimeActivity || [];
  } catch (error: any) {
    console.error('Fetch time activities error:', error.response?.data || error.message);
    throw new Error('Failed to fetch time activities from QuickBooks');
  }
}

/**
 * Import time entries from QuickBooks to MongoDB
 * Creates ONE time entry per employee per day
 */
export async function importTimeEntries(
  userId: string,
  payPeriodId: string
): Promise<{
  imported: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  byEmployee: any[];
}> {
  await connectDB();

  // Get pay period
  const payPeriod = await PayPeriod.findById(payPeriodId);
  if (!payPeriod) {
    throw new Error('Pay period not found');
  }

  // Get QB connection
  const connection = await getQuickBooksConnection(userId);
  if (!connection) {
    throw new Error('QuickBooks not connected');
  }

  console.log(`   Fetching time entries from ${format(payPeriod.startDate, 'MMM dd')} to ${format(payPeriod.endDate, 'MMM dd')}...`);

  // Fetch from QuickBooks
  const qbTimeActivities = await fetchTimeActivitiesFromQB(
    userId,
    connection.realmId,
    payPeriod.startDate,
    payPeriod.endDate
  );

  console.log(`   Found ${qbTimeActivities.length} time activities in QuickBooks`);

  if (qbTimeActivities.length === 0) {
    console.log('   ⚠️  No time activities found for this period');
    return {
      imported: 0,
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      byEmployee: []
    };
  }

  // Delete existing entries for this pay period
  await TimeEntry.deleteMany({ payPeriodId });

  // Group by employee and date to aggregate hours per day
  const groupedByEmployeeAndDate = new Map<string, Map<string, number>>();

  for (const activity of qbTimeActivities) {
    const qbEmployeeId = activity.EmployeeRef?.value;
    if (!qbEmployeeId) continue;

    const date = activity.TxnDate;
    const hours = (activity.Hours || 0) + (activity.Minutes || 0) / 60;

    if (!groupedByEmployeeAndDate.has(qbEmployeeId)) {
      groupedByEmployeeAndDate.set(qbEmployeeId, new Map());
    }

    const dateMap = groupedByEmployeeAndDate.get(qbEmployeeId)!;
    const currentHours = dateMap.get(date) || 0;
    dateMap.set(date, currentHours + hours);
  }

  // Create one time entry per employee per day
  let imported = 0;
  let totalHours = 0;
  let regularHours = 0;
  let overtimeHours = 0;
  const byEmployee: any[] = [];

  for (const [qbEmployeeId, dateMap] of groupedByEmployeeAndDate) {
    // Find employee in MongoDB
    const employee = await Employee.findOne({ userId, qbEmployeeId });
    if (!employee) {
      console.warn(`   ⚠️  Employee ${qbEmployeeId} not found in database, skipping`);
      continue;
    }

    let empTotalHours = 0;
    let empRegularHours = 0;
    let empOvertimeHours = 0;
    const empEntries: any[] = [];

    for (const [dateStr, dailyHours] of dateMap) {
      // Determine regular vs overtime (more than 8 hours per day)
      let regular = dailyHours;
      let overtime = 0;
      if (dailyHours > 8) {
        regular = 8;
        overtime = dailyHours - 8;
      }

      const timeEntry = await TimeEntry.create({
        employeeId: employee._id,
        payPeriodId,
        qbEmployeeId,
        date: new Date(dateStr),
        hours: Math.round(dailyHours * 100) / 100,
        type: overtime > 0 ? 'overtime' : 'regular',
        source: 'quickbooks_online'
      });

      imported++;
      totalHours += dailyHours;
      regularHours += regular;
      overtimeHours += overtime;

      empTotalHours += dailyHours;
      empRegularHours += regular;
      empOvertimeHours += overtime;

      empEntries.push({
        date: dateStr,
        hours: Math.round(dailyHours * 100) / 100,
        regular: Math.round(regular * 100) / 100,
        overtime: Math.round(overtime * 100) / 100
      });

      console.log(`   ✅ ${employee.displayName}: ${dailyHours.toFixed(1)} hours on ${dateStr}`);
    }

    byEmployee.push({
      employeeId: employee._id,
      employeeName: employee.displayName,
      qbEmployeeId,
      totalHours: Math.round(empTotalHours * 100) / 100,
      regularHours: Math.round(empRegularHours * 100) / 100,
      overtimeHours: Math.round(empOvertimeHours * 100) / 100,
      entries: empEntries
    });
  }

  return {
    imported,
    totalHours: Math.round(totalHours * 10) / 10,
    regularHours: Math.round(regularHours * 10) / 10,
    overtimeHours: Math.round(overtimeHours * 10) / 10,
    byEmployee
  };
}