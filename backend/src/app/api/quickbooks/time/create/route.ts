// src/app/api/quickbooks/time/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Employee from '@/lib/db/models/Employee';
import TimeEntry from '@/lib/db/models/TimeEntry';
import PayPeriod from '@/lib/db/models/PayPeriod';
import timeEntriesData from '@/data/realistic-time-entries.json';
import { TimeEntrySeed } from '@/types/time-entry';

/**
 * Helper function to get week start date (Sunday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Helper function to calculate weekly hours for overtime determination
 */
function calculateWeeklyHours(
  allEntries: TimeEntrySeed['weeklySchedule'],
  currentDate: string
): number {
  const current = new Date(currentDate);
  const weekStart = getWeekStart(current);
  
  let weekTotal = 0;
  for (const entry of allEntries) {
    const entryDate = new Date(entry.date);
    const entryWeekStart = getWeekStart(entryDate);
    
    // If same week, add hours
    if (entryWeekStart.getTime() === weekStart.getTime()) {
      weekTotal += entry.hours;
    }
  }
  
  return weekTotal;
}

/**
 * Helper function to determine if hours are regular or overtime
 * Based on cumulative hours up to this date in the week
 */
function determineEntryType(
  allEntries: TimeEntrySeed['weeklySchedule'],
  currentDate: string,
  currentHours: number
): 'regular' | 'overtime' {
  const current = new Date(currentDate);
  const weekStart = getWeekStart(current);
  
  // Calculate hours worked before this entry in the same week
  let hoursBeforeThisEntry = 0;
  for (const entry of allEntries) {
    const entryDate = new Date(entry.date);
    const entryWeekStart = getWeekStart(entryDate);
    
    // Same week and before current date
    if (entryWeekStart.getTime() === weekStart.getTime() && 
        entryDate < current) {
      hoursBeforeThisEntry += entry.hours;
    }
  }
  
  // If already over 40 hours, this is all overtime
  if (hoursBeforeThisEntry >= 40) {
    return 'overtime';
  }
  
  // If this entry pushes over 40, it's regular
  // (overtime calculation happens at payment time)
  if (hoursBeforeThisEntry + currentHours > 40) {
    return 'regular'; // Will be split during payroll calculation
  }
  
  return 'regular';
}

/**
 * Helper function to find or create pay period for a date
 */
async function findOrCreatePayPeriod(
  userId: string,
  date: Date
): Promise<string> {
  // Check if pay period exists for this date
  let payPeriod = await PayPeriod.findOne({
    userId,
    startDate: { $lte: date },
    endDate: { $gte: date },
  });

  if (payPeriod) {
    return (payPeriod._id as any).toString();
  }

  // Create new bi-weekly pay period
  // Assuming pay periods start on Sundays
  const weekStart = getWeekStart(date);
  const startDate = new Date(weekStart);
  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 13); // 2 weeks

  const processDate = new Date(endDate);
  processDate.setDate(processDate.getDate() + 7); // 1 week after period ends

  const newPayPeriod = await PayPeriod.create({
    userId,
    startDate,
    endDate,
    processDate, // Required field
    status: 'draft',
  });

  console.log(`📅 Created pay period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

  return (newPayPeriod._id as any).toString();
}

/**
 * POST /api/quickbooks/time/create
 * 
 * Creates time entries directly in MongoDB from realistic seed data
 * Date range: Oct 1 - Nov 13, 2025
 * All 5 employees with realistic restaurant hours and overtime
 * 
 * Request Body:
 * {
 *   "userId": "string" (required)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: userId',
        },
        { status: 400 }
      );
    }

    console.log('🚀 Starting direct MongoDB time entry creation for userId:', userId);

    // Connect to database
    await connectDB();

    // Get all employees from MongoDB
    console.log('📥 Fetching employees from MongoDB...');
    const employees = await Employee.find({ userId, isActive: true });

    if (employees.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No employees found. Please sync employees first.',
        },
        { status: 400 }
      );
    }

    // Create employee map (qbEmployeeId -> MongoDB _id)
    const targetEmployeeIds = ['58', '59', '60', '61', '62'];
    const employeeMap = new Map<string, { _id: string; name: string }>();
    
    for (const emp of employees) {
      if (emp.qbEmployeeId && targetEmployeeIds.includes(emp.qbEmployeeId)) {
        employeeMap.set(emp.qbEmployeeId, {
          _id: emp._id.toString(),
          name: emp.displayName,
        });
        console.log(`  ✅ Found: ${emp.displayName} (QB ID: ${emp.qbEmployeeId}, MongoDB ID: ${emp._id})`);
      }
    }

    if (employeeMap.size !== 5) {
      return NextResponse.json(
        {
          success: false,
          error: `Expected 5 restaurant employees, found ${employeeMap.size}. Missing QB IDs: ${targetEmployeeIds.filter(id => !employeeMap.has(id)).join(', ')}`,
        },
        { status: 400 }
      );
    }

    console.log(`✅ All 5 restaurant employees found with MongoDB IDs`);

    // Load time entries from realistic seed data
    const timeEntries = timeEntriesData.timeEntries as TimeEntrySeed[];
    
    const totalEntries = timeEntries.reduce(
      (sum, emp) => sum + emp.weeklySchedule.length,
      0
    );

    console.log(`📋 Processing ${totalEntries} time entries for ${timeEntries.length} employees`);
    console.log(`📅 Date range: Oct 1 - Nov 13, 2025`);

    // Process results tracking
    const results = {
      created: 0,
      skipped: 0,
      errors: 0,
      details: [] as Array<{ 
        employee: string; 
        date: string; 
        hours: number;
        type: 'regular' | 'overtime';
        status: string;
      }>,
    };

    // Track pay periods created
    const payPeriods = new Set<string>();

    // Process each employee's time entries
    for (const entry of timeEntries) {
      const employee = employeeMap.get(entry.qbEmployeeId);

      if (!employee) {
        console.warn(`⚠️  Employee not found with QB ID: ${entry.qbEmployeeId} (${entry.employeeDisplayName})`);
        results.errors++;
        continue;
      }

      console.log(`\n👤 Processing ${entry.employeeDisplayName} (${entry.weeklySchedule.length} days)...`);

      for (const day of entry.weeklySchedule) {
        try {
          const entryDate = new Date(day.date);

          // Check if time entry already exists
          const existing = await TimeEntry.findOne({
            userId,
            employeeId: employee._id,
            date: {
              $gte: new Date(entryDate.setHours(0, 0, 0, 0)),
              $lt: new Date(entryDate.setHours(23, 59, 59, 999)),
            },
          });

          if (existing) {
            console.log(`⏭️  Skipped: ${day.date} (already exists)`);
            results.skipped++;
            results.details.push({
              employee: entry.employeeDisplayName,
              date: day.date,
              hours: day.hours,
              type: existing.type,
              status: 'skipped',
            });
            continue;
          }

          // Find or create pay period for this date
          const payPeriodId = await findOrCreatePayPeriod(userId, new Date(day.date));
          payPeriods.add(payPeriodId);

          // Determine if this entry is regular or overtime
          const entryType = determineEntryType(
            entry.weeklySchedule,
            day.date,
            day.hours
          );

          // Create time entry in MongoDB
          const timeEntryDoc = await TimeEntry.create({
            userId,
            employeeId: employee._id,
            qbEmployeeId: entry.qbEmployeeId,
            payPeriodId,
            date: new Date(day.date),
            hours: day.hours,
            minutes: 0,
            type: entryType,
            source: 'quickbooks_online',
          });

          console.log(`✅ Created: ${day.date} - ${day.hours}h (${entryType})`);

          results.created++;
          results.details.push({
            employee: entry.employeeDisplayName,
            date: day.date,
            hours: day.hours,
            type: entryType,
            status: 'created',
          });

        } catch (error: any) {
          console.error(`❌ Error creating entry for ${day.date}:`, error.message);
          results.errors++;
          results.details.push({
            employee: entry.employeeDisplayName,
            date: day.date,
            hours: day.hours,
            type: 'regular',
            status: 'error',
          });
        }
      }
    }

    console.log('\n📊 Creation summary:');
    console.log(`  ✅ Created: ${results.created}`);
    console.log(`  ⏭️  Skipped: ${results.skipped}`);
    console.log(`  ❌ Errors: ${results.errors}`);
    console.log(`  📅 Pay periods: ${payPeriods.size}`);

    // Calculate summary by employee
    const byEmployee: Record<string, { 
      created: number; 
      skipped: number; 
      errors: number;
      totalHours: number;
      regularHours: number;
      overtimeHours: number;
    }> = {};
    
    for (const detail of results.details) {
      if (!byEmployee[detail.employee]) {
        byEmployee[detail.employee] = { 
          created: 0, 
          skipped: 0, 
          errors: 0,
          totalHours: 0,
          regularHours: 0,
          overtimeHours: 0,
        };
      }
      
      if (detail.status === 'created') {
        byEmployee[detail.employee].created++;
        byEmployee[detail.employee].totalHours += detail.hours;
        
        if (detail.type === 'regular') {
          byEmployee[detail.employee].regularHours += detail.hours;
        } else {
          byEmployee[detail.employee].overtimeHours += detail.hours;
        }
      } else if (detail.status === 'skipped') {
        byEmployee[detail.employee].skipped++;
      } else if (detail.status === 'error') {
        byEmployee[detail.employee].errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.created} time entries in MongoDB, skipped ${results.skipped}, errors ${results.errors}`,
      data: {
        total: {
          created: results.created,
          skipped: results.skipped,
          errors: results.errors,
          totalProcessed: results.created + results.skipped + results.errors,
        },
        byEmployee,
        dateRange: '2025-10-01 to 2025-11-13',
        payPeriodsCreated: payPeriods.size,
        employees: timeEntries.map(e => e.employeeDisplayName),
      },
    });

  } catch (error: any) {
    console.error('❌ Time entry creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create time entries',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quickbooks/time/create
 * 
 * Preview time entries that will be created
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: userId',
        },
        { status: 400 }
      );
    }

    // Load seed data
    const timeEntries = timeEntriesData.timeEntries as TimeEntrySeed[];
    const summary = timeEntriesData.summary;

    // Calculate weekly summaries
    const preview = timeEntries.map((entry) => {
      // Group by week
      const weeklyTotals = new Map<string, number>();
      
      for (const day of entry.weeklySchedule) {
        const date = new Date(day.date);
        const weekStart = getWeekStart(date);
        const weekKey = weekStart.toISOString().split('T')[0];
        
        const currentTotal = weeklyTotals.get(weekKey) || 0;
        weeklyTotals.set(weekKey, currentTotal + day.hours);
      }

      // Calculate regular vs overtime
      let totalRegular = 0;
      let totalOvertime = 0;
      
      for (const [week, hours] of weeklyTotals) {
        if (hours > 40) {
          totalRegular += 40;
          totalOvertime += (hours - 40);
        } else {
          totalRegular += hours;
        }
      }

      const totalHours = entry.weeklySchedule.reduce((sum, day) => sum + day.hours, 0);
      const avgWeekly = totalHours / weeklyTotals.size;

      return {
        employee: entry.employeeDisplayName,
        qbEmployeeId: entry.qbEmployeeId,
        totalDays: entry.weeklySchedule.length,
        totalHours: Math.round(totalHours * 10) / 10,
        regularHours: Math.round(totalRegular * 10) / 10,
        overtimeHours: Math.round(totalOvertime * 10) / 10,
        avgWeeklyHours: Math.round(avgWeekly * 10) / 10,
        weeks: weeklyTotals.size,
        dateRange: `${entry.weeklySchedule[0].date} to ${entry.weeklySchedule[entry.weeklySchedule.length - 1].date}`,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Time entries preview',
      data: {
        summary,
        preview,
        totalEntries: timeEntries.reduce((sum, e) => sum + e.weeklySchedule.length, 0),
      },
    });

  } catch (error: any) {
    console.error('❌ Preview error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get preview',
      },
      { status: 500 }
    );
  }
}