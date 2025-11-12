// src/app/api/quickbooks/time/employee/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import TimeEntry from '@/lib/db/models/TimeEntry';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID required' },
        { status: 400 }
      );
    }

    await connectDB();

    const timeEntries = await TimeEntry.find({ employeeId })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: timeEntries.length,
      entries: timeEntries,
    });
  } catch (error: any) {
    console.error('Get employee time entries error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get time entries' },
      { status: 500 }
    );
  }
}
