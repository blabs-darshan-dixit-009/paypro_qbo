// src/app/api/quickbooks/employees/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createEmployeesFromSeed } from '@/lib/quickbooks/employee-create';
import { getValidAccessToken, getQuickBooksConnection } from '@/lib/quickbooks/auth';
import connectDB from '@/lib/db/mongodb';
import Employee from '@/lib/db/models/Employee';
import employeeSeedData from '@/data/employees.json';
import { EmployeeSeedData } from '@/types/employee';

// Extract employees array from JSON
const restaurantEmployees = employeeSeedData.employees as EmployeeSeedData[];

/**
 * POST /api/quickbooks/employees/create
 * 
 * Creates employees in QuickBooks from seed data
 * - Reads seed data file
 * - Checks if employees exist in QuickBooks
 * - Creates new employees
 * - Syncs to MongoDB
 * - Returns detailed results
 * 
 * Request Body:
 * {
 *   "userId": "string" (required)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Created X employees, skipped Y",
 *   "data": {
 *     "created": [...],
 *     "skipped": [...],
 *     "errors": [...],
 *     "totalProcessed": 5
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: userId' 
        },
        { status: 400 }
      );
    }

    console.log('🚀 Starting employee creation process for userId:', userId);

    // Get QuickBooks connection
    console.log('🔑 Retrieving QuickBooks connection...');
    const connection = await getQuickBooksConnection(userId);
    const accessToken = await getValidAccessToken(userId);

    if (!accessToken || !connection.realmId) {
      return NextResponse.json(
        {
          success: false,
          error: 'QuickBooks not connected. Please authorize QuickBooks first.'
        },
        { status: 401 }
      );
    }

    const realmId = connection.realmId;

    console.log('✅ Access token retrieved');
    console.log(`📋 Processing ${restaurantEmployees.length} employees from seed data`);

    // Create employees in QuickBooks
    const results = await createEmployeesFromSeed(
      accessToken,
      realmId,
      restaurantEmployees
    );

    console.log('📊 Creation results:', {
      created: results.created.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
    });

    // Sync created employees to MongoDB
    if (results.created.length > 0) {
      console.log('💾 Syncing created employees to MongoDB...');
      await connectDB();

      for (const createdEmp of results.created) {
        try {
          // Find the original seed data
          const seedData = restaurantEmployees.find(
            (emp) => emp.DisplayName === createdEmp.name
          );

          if (!seedData) {
            console.warn(`⚠️  Seed data not found for ${createdEmp.name}`);
            continue;
          }

          // Create or update employee in MongoDB
          await Employee.findOneAndUpdate(
            { 
              userId,
              qbEmployeeId: createdEmp.id 
            },
            {
              userId,
              qbEmployeeId: createdEmp.id,
              firstName: seedData.GivenName,
              lastName: seedData.FamilyName,
              displayName: seedData.DisplayName,
              email: seedData.PrimaryEmailAddr.Address,
              phone: seedData.PrimaryPhone.FreeFormNumber,
              hourlyRate: seedData.BillRate,
              filingStatus: seedData.filingStatus,
              allowances: seedData.allowances,
              additionalWithholding: seedData.additionalWithholding,
              isActive: seedData.Active,
              hiredDate: new Date(seedData.HiredDate),
              department: seedData.department,
              jobTitle: seedData.jobTitle,
              paymentMethod: seedData.paymentMethod,
            },
            { 
              upsert: true, 
              new: true 
            }
          );

          console.log(`✅ Synced to MongoDB: ${createdEmp.name}`);
        } catch (error: any) {
          console.error(`❌ Error syncing ${createdEmp.name} to MongoDB:`, error.message);
        }
      }
    }

    // Prepare response
    const totalProcessed = results.created.length + results.skipped.length + results.errors.length;
    const message = `Created ${results.created.length} employees, skipped ${results.skipped.length}, errors ${results.errors.length}`;

    return NextResponse.json({
      success: true,
      message,
      data: {
        created: results.created,
        skipped: results.skipped,
        errors: results.errors,
        totalProcessed,
        seedDataCount: restaurantEmployees.length,
      },
    });

  } catch (error: any) {
    console.error('❌ Employee creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create employees' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quickbooks/employees/create
 * 
 * Preview seed data without creating employees
 * Useful for testing and verification
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameter: userId' 
        },
        { status: 400 }
      );
    }

    // Return seed data preview
    const preview = restaurantEmployees.map((emp) => ({
      name: emp.DisplayName,
      title: emp.jobTitle,
      department: emp.department,
      hourlyRate: `$${emp.BillRate}/hr`,
      filingStatus: emp.filingStatus,
      allowances: emp.allowances,
      additionalWithholding: `$${emp.additionalWithholding}`,
      paymentMethod: emp.paymentMethod,
      email: emp.PrimaryEmailAddr.Address,
      phone: emp.PrimaryPhone.FreeFormNumber,
      hireDate: emp.HiredDate,
    }));

    return NextResponse.json({
      success: true,
      message: 'Seed data preview',
      count: restaurantEmployees.length,
      employees: preview,
    });

  } catch (error: any) {
    console.error('❌ Preview error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to get preview' 
      },
      { status: 500 }
    );
  }
}