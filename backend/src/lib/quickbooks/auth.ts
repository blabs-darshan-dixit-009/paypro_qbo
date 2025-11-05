// src/lib/quickbooks/auth.ts
import axios from 'axios';
import QuickBooksConnection from '@/lib/db/models/QuickBooksConnection';
import connectDB from '@/lib/db/mongodb';

export const BASE_URL = 'https://quickbooks.api.intuit.com';
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  token_type: string;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  realmId: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  realmId: string;
}> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('QuickBooks credentials not configured');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post<TokenResponse>(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + response.data.expires_in * 1000);
    const refreshExpiresAt = new Date(
      now.getTime() + response.data.x_refresh_token_expires_in * 1000
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt,
      refreshExpiresAt,
      realmId,
    };
  } catch (error: any) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('QuickBooks credentials not configured');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post<TokenResponse>(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + response.data.expires_in * 1000);
    const refreshExpiresAt = new Date(
      now.getTime() + response.data.x_refresh_token_expires_in * 1000
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt,
      refreshExpiresAt,
    };
  } catch (error: any) {
    console.error('Error refreshing access token:', error.response?.data || error.message);
    throw new Error('Failed to refresh access token');
  }
}

/**
 * Store QuickBooks connection in database
 */
export async function storeQuickBooksConnection(
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    refreshExpiresAt: Date;
    realmId: string;
  }
): Promise<void> {
  await connectDB();

  try {
    await QuickBooksConnection.findOneAndUpdate(
      { userId },
      {
        userId,
        realmId: tokens.realmId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        refreshExpiresAt: tokens.refreshExpiresAt,
      },
      { upsert: true, new: true }
    );
  } catch (error: any) {
    console.error('Error storing QuickBooks connection:', error.message);
    throw new Error('Failed to store QuickBooks connection');
  }
}

/**
 * Get QuickBooks connection from database
 */
export async function getQuickBooksConnection(userId: string) {
  await connectDB();

  const connection = await QuickBooksConnection.findOne({ userId });

  if (!connection) {
    throw new Error('QuickBooks connection not found');
  }

  return connection;
}

/**
 * Get valid access token (refresh if expired)
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const connection = await getQuickBooksConnection(userId);

  // Check if access token is expired or about to expire (within 5 minutes)
  const now = new Date();
  const expiresAt = new Date(connection.expiresAt);
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (now.getTime() >= expiresAt.getTime() - bufferTime) {
    console.log('Access token expired or expiring soon, refreshing...');

    // Refresh the token
    const newTokens = await refreshAccessToken(connection.refreshToken);

    // Update in database
    connection.accessToken = newTokens.accessToken;
    connection.refreshToken = newTokens.refreshToken;
    connection.expiresAt = newTokens.expiresAt;
    connection.refreshExpiresAt = newTokens.refreshExpiresAt;
    await connection.save();

    return newTokens.accessToken;
  }

  return connection.accessToken;
}

/**
 * Revoke QuickBooks connection
 */
export async function revokeQuickBooksConnection(userId: string): Promise<void> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('QuickBooks credentials not configured');
  }

  const connection = await getQuickBooksConnection(userId);
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // Revoke tokens with QuickBooks
    await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/revoke',
      new URLSearchParams({
        token: connection.refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    // Delete from database
    await QuickBooksConnection.deleteOne({ userId });
  } catch (error: any) {
    console.error('Error revoking QuickBooks connection:', error.response?.data || error.message);
    throw new Error('Failed to revoke QuickBooks connection');
  }
}

/**
 * Check if user has active QuickBooks connection
 */
export async function hasActiveConnection(userId: string): Promise<boolean> {
  await connectDB();

  const connection = await QuickBooksConnection.findOne({ userId });

  if (!connection) {
    return false;
  }

  // Check if refresh token is still valid
  const now = new Date();
  const refreshExpiresAt = new Date(connection.refreshExpiresAt);

  return now < refreshExpiresAt;
}
