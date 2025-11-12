// src/app/api/quickbooks/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Employee from '@/lib/db/models/Employee';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID required' },
        { status: 400 }
      );
    }

    await connectDB();

    const employee = await Employee.findById(employeeId).lean();

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error: any) {
    console.error('Get employee error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get employee' },
      { status: 500 }
    );
  }
}
