// src/app/api/payroll/pay-period/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import PayPeriod from '@/lib/db/models/PayPeriod';

// Create new pay period
export async function POST(request: NextRequest) {
  try {
    const { userId, startDate, endDate, processDate } = await request.json();

    if (!userId || !startDate || !endDate || !processDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const payPeriod = await PayPeriod.create({
      userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      processDate: new Date(processDate),
      status: 'draft',
    });

    return NextResponse.json({
      success: true,
      payPeriod,
    });
  } catch (error: any) {
    console.error('Create pay period error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create pay period' },
      { status: 500 }
    );
  }
}

// Get pay periods
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await connectDB();

    const payPeriods = await PayPeriod.find({ userId })
      .sort({ startDate: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      count: payPeriods.length,
      payPeriods,
    });
  } catch (error: any) {
    console.error('Get pay periods error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get pay periods' },
      { status: 500 }
    );
  }
}