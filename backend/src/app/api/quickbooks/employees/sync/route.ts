// src/app/api/quickbooks/employees/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { syncEmployeesToDatabase } from '@/lib/quickbooks/employees';
import { importTimeEntries } from '@/lib/quickbooks/time';
import { getQuickBooksConnection } from '@/lib/quickbooks/auth';
import connectDB from '@/lib/db/mongodb';
import PayPeriod from '@/lib/db/models/PayPeriod';

export async function POST(request: NextRequest) {
  try {
    const { userId, startDate, endDate } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if QuickBooks connection exists
    const connection = await getQuickBooksConnection(userId);
    
    if (!connection) {
      return NextResponse.json(
        { 
          success: false,
          error: 'QuickBooks not connected',
          message: 'Please connect to QuickBooks first'
        },
        { status: 400 }
      );
    }

    console.log('✅ QuickBooks connection found');
    
    // Step 1: Sync employees
    console.log('🔄 Step 1: Syncing employees from QuickBooks...');
    const employeeResult = await syncEmployeesToDatabase(userId);
    console.log(`✅ Synced ${employeeResult.synced} employees`);

    // Step 2: Create pay period with provided dates or defaults
    console.log('\n🔄 Step 2: Creating pay period...');
    
    // Use provided dates or default to October 2025 (where existing time entries are)
    const payPeriodStart = startDate ? new Date(startDate) : new Date('2025-10-01');
    const payPeriodEnd = endDate ? new Date(endDate) : new Date('2025-10-31');
    const processDate = new Date(payPeriodEnd);
    processDate.setDate(processDate.getDate() + 1); // Next day after end date

    let payPeriod = await PayPeriod.findOne({
      userId,
      startDate: payPeriodStart,
      endDate: payPeriodEnd
    });

    if (!payPeriod) {
      payPeriod = await PayPeriod.create({
        userId,
        startDate: payPeriodStart,
        endDate: payPeriodEnd,
        processDate: processDate,
        status: 'draft'
      });
      console.log(`✅ Created pay period: ${payPeriodStart.toISOString().split('T')[0]} to ${payPeriodEnd.toISOString().split('T')[0]}`);
    } else {
      console.log(`✅ Using existing pay period`);
    }

    // Step 3: Import time entries
    console.log('\n🔄 Step 3: Importing time entries...');
    const timeResult = await importTimeEntries(userId, (payPeriod._id as any).toString());
    console.log(`✅ Imported ${timeResult.imported} time entries`);

    return NextResponse.json({
      success: true,
      message: 'Successfully synced employees and imported time entries',
      data: {
        employees: {
          totalSynced: employeeResult.synced,
          newEmployees: employeeResult.created,
          updatedEmployees: employeeResult.updated,
          employees: employeeResult.employees
        },
        payPeriod: {
          id: payPeriod._id,
          startDate: payPeriod.startDate.toISOString().split('T')[0],
          endDate: payPeriod.endDate.toISOString().split('T')[0],
          processDate: payPeriod.processDate.toISOString().split('T')[0]
        },
        timeEntries: {
          imported: timeResult.imported,
          totalHours: timeResult.totalHours,
          regularHours: timeResult.regularHours,
          overtimeHours: timeResult.overtimeHours,
          byEmployee: timeResult.byEmployee
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ Sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to sync data'
      },
      { status: 500 }
    );
  }
}