// src/app/api/quickbooks/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Employee from '@/lib/db/models/Employee';

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

    const employees = await Employee.find({ userId, isActive: true })
      .sort({ displayName: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error: any) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get employees' },
      { status: 500 }
    );
  }
}