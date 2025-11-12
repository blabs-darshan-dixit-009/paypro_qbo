// src/app/api/quickbooks/time/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken, getQuickBooksConnection } from '@/lib/quickbooks/auth';
import connectDB from '@/lib/db/mongodb';
import Employee from '@/lib/db/models/Employee';
import timeEntriesData from '@/data/time-entries.json';
import { TimeEntrySeed } from '@/types/time-entry';
import { createTimeEntriesFromSeed } from '@/lib/quickbooks/time-create';

/**
 * POST /api/quickbooks/time/create
 * 
 * Creates time entries in QuickBooks from seed data
 * Date range: Oct 1 - Nov 10, 2025
 * All 5 employees with realistic restaurant hours
 * 
 * Request Body:
 * {
 *   "userId": "string" (required)
 *   "customerId": "string" (optional) - QB customer ID for entries
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, customerId } = body;

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

    console.log('🚀 Starting time entry creation for userId:', userId);

    // Connect to database
    await connectDB();

    // Get QuickBooks connection
    const connection = await getQuickBooksConnection(userId);
    const accessToken = await getValidAccessToken(userId);

    if (!accessToken || !connection?.realmId) {
      return NextResponse.json(
        {
          success: false,
          error: 'QuickBooks not connected. Please authorize QuickBooks first.',
        },
        { status: 401 }
      );
    }

    const realmId = connection.realmId;

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

    // Create employee map (qbEmployeeId -> employee data)
    // Only include the 5 restaurant employees we want
    const targetEmployeeIds = ['58', '59', '60', '61', '62'];
    const employeeMap = new Map<string, { name: string; rate: number }>();
    
    for (const emp of employees) {
      if (emp.qbEmployeeId && targetEmployeeIds.includes(emp.qbEmployeeId)) {
        employeeMap.set(emp.qbEmployeeId, {
          name: emp.displayName,
          rate: emp.hourlyRate,
        });
        console.log(`  ✅ Found: ${emp.displayName} (QB ID: ${emp.qbEmployeeId}, Rate: ${emp.hourlyRate}/hr)`);
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

    console.log(`✅ All 5 restaurant employees found with QuickBooks IDs`);

    // Load time entries from seed data
    const timeEntries = timeEntriesData.timeEntries as TimeEntrySeed[];
    
    const totalEntries = timeEntries.reduce(
      (sum, emp) => sum + emp.weeklySchedule.length,
      0
    );

    console.log(`📋 Processing ${totalEntries} time entries for ${timeEntries.length} employees`);
    console.log(`📅 Date range: Oct 1 - Nov 10, 2025`);

    // Create time entries in QuickBooks
    const results = await createTimeEntriesFromSeed(
      accessToken,
      realmId,
      employeeMap,
      timeEntries,
      customerId
    );

    console.log('📊 Creation summary:');
    console.log(`  ✅ Created: ${results.created}`);
    console.log(`  ⏭️  Skipped: ${results.skipped}`);
    console.log(`  ❌ Errors: ${results.errors}`);

    // Calculate summary by employee
    const byEmployee: Record<string, { created: number; skipped: number; errors: number }> = {};
    
    for (const detail of results.details) {
      if (!byEmployee[detail.employee]) {
        byEmployee[detail.employee] = { created: 0, skipped: 0, errors: 0 };
      }
      
      if (detail.status === 'created') byEmployee[detail.employee].created++;
      else if (detail.status === 'skipped') byEmployee[detail.employee].skipped++;
      else if (detail.status === 'error') byEmployee[detail.employee].errors++;
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.created} time entries, skipped ${results.skipped}, errors ${results.errors}`,
      data: {
        total: {
          created: results.created,
          skipped: results.skipped,
          errors: results.errors,
          totalProcessed: results.created + results.skipped + results.errors,
        },
        byEmployee,
        dateRange: '2025-10-01 to 2025-11-09',
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

    // Calculate totals
    const preview = timeEntries.map((entry) => {
      const totalHours = entry.weeklySchedule.reduce((sum, day) => sum + day.hours, 0);
      const weeks = 6;
      const avgWeekly = totalHours / weeks;
      const regularHours = Math.min(avgWeekly, 40);
      const overtimeHours = Math.max(avgWeekly - 40, 0);

      return {
        employee: entry.employeeDisplayName,
        totalDays: entry.weeklySchedule.length,
        totalHours,
        avgWeeklyHours: Math.round(avgWeekly * 10) / 10,
        regularHoursPerWeek: regularHours,
        overtimeHoursPerWeek: overtimeHours,
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