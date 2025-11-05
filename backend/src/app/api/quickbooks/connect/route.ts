// src/app/api/quickbooks/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/quickbooks/auth';

export async function GET(request: NextRequest) {
  try {
    // In production, get userId from session/JWT
    // For now, using query param for testing
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Generate random state for security
    const state = crypto.randomUUID();

    // In production, store state in session/database to verify in callback
    // For now, we'll include userId in state
    const stateWithUserId = `${state}:${userId}`;

    const authUrl = getAuthorizationUrl(stateWithUserId);

    return NextResponse.json({ authUrl });
  } catch (error: any) {
    console.error('Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
