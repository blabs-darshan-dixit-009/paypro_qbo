// Health check endpoint to verify system status
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: {
        status: 'healthy',
        message: 'API is running'
      },
      database: {
        status: 'unknown',
        message: '',
        details: {}
      }
    }
  };

  try {
    // Try to connect to MongoDB
    await connectDB();

    // Check connection state
    const dbState = mongoose.connection.readyState;
    const stateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      healthCheck.services.database = {
        status: 'healthy',
        message: 'MongoDB connected successfully',
        details: {
          state: stateMap[dbState],
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          collections: Object.keys(mongoose.connection.collections).length
        }
      };
    } else {
      healthCheck.services.database = {
        status: 'unhealthy',
        message: `MongoDB state: ${stateMap[dbState]}`,
        details: {
          state: stateMap[dbState],
          readyState: dbState
        }
      };
      healthCheck.status = 'degraded';
    }

    const statusCode = healthCheck.status === 'ok' ? 200 : 503;
    return NextResponse.json(healthCheck, { status: statusCode });

  } catch (error: any) {
    healthCheck.status = 'error';
    healthCheck.services.database = {
      status: 'error',
      message: error.message || 'Failed to connect to MongoDB',
      details: {
        error: error.toString(),
        mongoUri: process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials
      }
    };

    return NextResponse.json(healthCheck, { status: 503 });
  }
}

