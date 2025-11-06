// src/app/api/quickbooks/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/quickbooks/auth';

export async function GET(request: NextRequest) {
  try {
    // Get userId from query or use test default
    const userId = request.nextUrl.searchParams.get('userId') || 'test-user-123';

    console.log('🔐 Generating auth URL for userId:', userId);

    // Generate random state for security
    const state = `${crypto.randomUUID()}:${userId}`;

    // Get authorization URL
    const authUrl = getAuthorizationUrl(state);

    console.log('✅ Auth URL generated');

    return NextResponse.json({ 
      authUrl,
      userId,
      message: 'Open this URL to authorize QuickBooks'
    });
  } catch (error: any) {
    console.error('❌ Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}