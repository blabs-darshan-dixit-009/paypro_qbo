// Database-specific health check
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';

export async function GET() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Attempt to connect
    await connectDB();
    
    // Check connection state
    const state = mongoose.connection.readyState;
    const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    if (state === 1) {
      console.log('✅ Database connected successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Database connected successfully',
        connection: {
          state: stateNames[state],
          host: mongoose.connection.host,
          database: mongoose.connection.name,
          port: mongoose.connection.port || 27017,
          collections: Object.keys(mongoose.connection.collections).length
        }
      });
    } else {
      console.log(`⚠️  Database state: ${stateNames[state]}`);
      
      return NextResponse.json({
        success: false,
        message: `Database is ${stateNames[state]}`,
        connection: {
          state: stateNames[state],
          readyState: state
        }
      }, { status: 503 });
    }
    
  } catch (error: any) {
    console.error('❌ Database connection error:', error.message);
    
    // Hide credentials in error message
    const safeUri = process.env.MONGODB_URI?.replace(
      /mongodb:\/\/([^:]+):([^@]+)@/,
      'mongodb://$1:***@'
    );
    
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to database',
      error: error.message,
      mongoUri: safeUri,
      help: {
        commonIssues: [
          'Check if MONGODB_URI is set in .env.local',
          'Verify username and password are correct',
          'Special characters in password must be URL-encoded (@ = %40)',
          'Check if IP address is whitelisted in MongoDB Atlas',
          'Verify network connectivity to MongoDB server'
        ]
      }
    }, { status: 500 });
  }
}

