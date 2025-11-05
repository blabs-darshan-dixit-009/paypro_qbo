// src/app/api/quickbooks/employees/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { syncEmployeesToDatabase } from '@/lib/quickbooks/employees';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting employee sync...');
    const result = await syncEmployeesToDatabase(userId);

    return NextResponse.json({
      success: true,
      message: `Synced ${result.synced} employees (${result.created} new, ${result.updated} updated)`,
      ...result,
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