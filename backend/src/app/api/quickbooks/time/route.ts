// src/app/api/quickbooks/time/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import TimeEntry from '@/lib/db/models/TimeEntry';

export async function GET(request: NextRequest) {
  try {
    const payPeriodId = request.nextUrl.searchParams.get('payPeriodId');

    if (!payPeriodId) {
      return NextResponse.json(
        { error: 'Pay Period ID required' },
        { status: 400 }
      );
    }

    await connectDB();

    const timeEntries = await TimeEntry.find({ payPeriodId })
      .populate('employeeId', 'displayName hourlyRate')
      .sort({ date: 1 })
      .lean();

    // Calculate totals
    const totals = timeEntries.reduce(
      (acc, entry) => {
        acc.totalHours += entry.hours;
        if (entry.type === 'overtime') {
          acc.overtimeHours += entry.hours;
        } else {
          acc.regularHours += entry.hours;
        }
        return acc;
      },
      { totalHours: 0, regularHours: 0, overtimeHours: 0 }
    );

    return NextResponse.json({
      success: true,
      count: timeEntries.length,
      totals,
      entries: timeEntries,
    });
  } catch (error: any) {
    console.error('Get time entries error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get time entries' },
      { status: 500 }
    );
  }
}