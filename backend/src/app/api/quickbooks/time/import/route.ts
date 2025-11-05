// src/app/api/quickbooks/time/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { importTimeEntries } from '@/lib/quickbooks/time';

export async function POST(request: NextRequest) {
  try {
    const { userId, payPeriodId } = await request.json();

    if (!userId || !payPeriodId) {
      return NextResponse.json(
        { error: 'User ID and Pay Period ID required' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting time import...');
    const result = await importTimeEntries(userId, payPeriodId);

    return NextResponse.json({
      success: true,
      message: `Imported ${result.imported} time entries (${result.regularHours} regular, ${result.overtimeHours} OT)`,
      ...result,
    });
  } catch (error: any) {
    console.error('❌ Import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to import time entries',
      },
      { status: 500 }
    );
  }
}