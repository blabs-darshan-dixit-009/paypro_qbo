// src/app/api/auth/callback/quickbooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeQuickBooksConnection } from '@/lib/quickbooks/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const state = searchParams.get('state');

  if (!code || !realmId || !state) {
    return NextResponse.redirect(
      new URL('/dashboard?error=missing_params', request.url)
    );
  }

  try {
    // Extract userId from state
    const [, userId] = state.split(':');

    if (!userId) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    const tokens = await exchangeCodeForTokens(code, realmId);

    // Store in database
    console.log('💾 Storing tokens in database...');
    await storeQuickBooksConnection(userId, tokens);

    console.log('✅ QuickBooks connected successfully');

    // Redirect to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?success=connected', request.url)
    );
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}