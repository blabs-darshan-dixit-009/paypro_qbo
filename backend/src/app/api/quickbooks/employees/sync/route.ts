// src/app/api/quickbooks/employees/sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { syncEmployees } from '@/lib/quickbooks/employees';
import { getValidAccessToken, getQuickBooksConnection } from '@/lib/quickbooks/auth';
import connectDB from '@/lib/db/mongodb';
import Employee from '@/lib/db/models/Employee';
import PayPeriod from '@/lib/db/models/PayPeriod';
import { importTimeEntries } from '@/lib/quickbooks/time';

/**
 * POST /api/quickbooks/employees/sync
 * 
 * Syncs employees from QuickBooks to MongoDB
 * Also creates pay period and imports time entries
 * 
 * Request Body:
 * {
 *   "userId": "string" (required)
 *   "startDate": "YYYY-MM-DD" (optional, defaults to 2025-10-01)
 *   "endDate": "YYYY-MM-DD" (optional, defaults to 2025-10-31)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, startDate, endDate } = body;

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: userId' 
        },
        { status: 400 }
      );
    }

    console.log('🚀 Starting employee sync for userId:', userId);

    // Get QuickBooks connection
    const connection = await getQuickBooksConnection(userId);
    const accessToken = await getValidAccessToken(userId);

    if (!accessToken || !connection.realmId) {
      return NextResponse.json(
        {
          success: false,
          error: 'QuickBooks not connected. Please authorize QuickBooks first.'
        },
        { status: 401 }
      );
    }

    const realmId = connection.realmId;

    // Sync employees from QuickBooks
    console.log('📥 Syncing employees from QuickBooks...');
    const syncResult = await syncEmployees(accessToken, realmId, userId);

    console.log(`✅ Synced ${syncResult.totalSynced} employees (${syncResult.newEmployees} new, ${syncResult.updatedEmployees} updated)`);

    // Connect to database
    await connectDB();

    // Set default dates if not provided
    const payPeriodStart = startDate || '2025-10-01';
    const payPeriodEnd = endDate || '2025-10-31';
    const processDate = new Date(payPeriodEnd);
    processDate.setDate(processDate.getDate() + 1);

    console.log(`📅 Creating pay period: ${payPeriodStart} to ${payPeriodEnd}`);

    // Create or get existing pay period
    let payPeriod = await PayPeriod.findOne({
      userId,
      startDate: new Date(payPeriodStart),
      endDate: new Date(payPeriodEnd),
    });

    if (!payPeriod) {
      payPeriod = await PayPeriod.create({
        userId,
        startDate: new Date(payPeriodStart),
        endDate: new Date(payPeriodEnd),
        processDate: processDate,
        status: 'draft',
      });
      console.log('✅ Pay period created:', payPeriod._id);
    } else {
      console.log('ℹ️  Pay period already exists:', payPeriod._id);
    }

    // Import time entries
    console.log('⏰ Importing time entries...');
    const timeEntriesResult = await importTimeEntries(
      userId,
      (payPeriod._id as any).toString()
    );

    console.log(`✅ Imported ${timeEntriesResult.imported} time entries`);

    // Get updated employee list from MongoDB with correct userId
    const employees = await Employee.find({ userId, isActive: true })
      .sort({ displayName: 1 })
      .select('_id displayName hourlyRate department jobTitle filingStatus allowances')
      .lean();

    console.log(`📊 Found ${employees.length} active employees in MongoDB for userId: ${userId}`);

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      message: 'Successfully synced employees and imported time entries',
      data: {
        employees: {
          totalSynced: syncResult.totalSynced,
          newEmployees: syncResult.newEmployees,
          updatedEmployees: syncResult.updatedEmployees,
          employees: employees.map(emp => ({
            _id: emp._id,
            displayName: emp.displayName,
            hourlyRate: emp.hourlyRate,
            department: emp.department,
            jobTitle: emp.jobTitle,
            filingStatus: emp.filingStatus,
            allowances: emp.allowances,
          })),
        },
        payPeriod: {
          id: payPeriod._id,
          startDate: payPeriod.startDate,
          endDate: payPeriod.endDate,
          processDate: payPeriod.processDate,
          status: payPeriod.status,
        },
        timeEntries: timeEntriesResult,
      },
    });

  } catch (error: any) {
    console.error('❌ Sync error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to sync employees' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quickbooks/employees/sync
 * 
 * Check sync status and preview what will be synced
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameter: userId' 
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Get current employees in MongoDB for this userId
    const employees = await Employee.find({ userId, isActive: true })
      .sort({ displayName: 1 })
      .select('displayName hourlyRate department jobTitle qbEmployeeId')
      .lean();

    // Get QuickBooks connection status
    const connection = await getQuickBooksConnection(userId).catch(() => null);
    const accessToken = connection ? await getValidAccessToken(userId).catch(() => null) : null;
    const isConnected = !!(accessToken && connection?.realmId);

    return NextResponse.json({
      success: true,
      userId,
      quickbooksConnected: isConnected,
      currentEmployees: {
        count: employees.length,
        employees: employees.map(emp => ({
          displayName: emp.displayName,
          hourlyRate: emp.hourlyRate,
          department: emp.department,
          jobTitle: emp.jobTitle,
          qbEmployeeId: emp.qbEmployeeId,
        })),
      },
    });

  } catch (error: any) {
    console.error('❌ Sync status error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to get sync status' 
      },
      { status: 500 }
    );
  }
}