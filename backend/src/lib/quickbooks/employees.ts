// src/lib/quickbooks/employees.ts

import Employee from '@/lib/db/models/Employee';
import connectDB from '@/lib/db/mongodb';

/**
 * Sync employees from QuickBooks to MongoDB
 * @param accessToken - Valid QuickBooks access token
 * @param realmId - QuickBooks company realm ID
 * @param userId - User ID to associate employees with
 * @returns Sync results with counts
 */
export async function syncEmployees(
  accessToken: string,
  realmId: string,
  userId: string
) {
  try {
    console.log('🔄 Fetching employees from QuickBooks...');
    console.log('📝 Using userId:', userId);

    // Fetch employees from QuickBooks
    const response = await fetch(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Employee WHERE Active = true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ QuickBooks API error:', errorText);
      throw new Error(`Failed to fetch employees: ${errorText}`);
    }

    const data = await response.json();
    const qbEmployees = data.QueryResponse?.Employee || [];

    console.log(`📥 Found ${qbEmployees.length} active employees in QuickBooks`);

    if (qbEmployees.length === 0) {
      return {
        totalSynced: 0,
        newEmployees: 0,
        updatedEmployees: 0,
        employees: [],
      };
    }

    // Connect to MongoDB
    await connectDB();

    let newCount = 0;
    let updatedCount = 0;
    const syncedEmployees = [];

    // Process each employee
    for (const qbEmp of qbEmployees) {
      try {
        // Map filing status from QuickBooks (if available)
        let filingStatus: 'single' | 'married' | 'head_of_household' = 'single';
        
        // Check if employee already exists in MongoDB
        const existingEmployee = await Employee.findOne({
          userId,
          qbEmployeeId: qbEmp.Id,
        });

        const employeeData = {
          userId, // Ensure correct userId is set
          qbEmployeeId: qbEmp.Id,
          firstName: qbEmp.GivenName || '',
          lastName: qbEmp.FamilyName || '',
          displayName: qbEmp.DisplayName || `${qbEmp.GivenName} ${qbEmp.FamilyName}`,
          email: qbEmp.PrimaryEmailAddr?.Address || undefined,
          phone: qbEmp.PrimaryPhone?.FreeFormNumber || undefined,
          hourlyRate: qbEmp.BillRate || 0,
          filingStatus: existingEmployee?.filingStatus || filingStatus,
          allowances: existingEmployee?.allowances || 0,
          additionalWithholding: existingEmployee?.additionalWithholding || 0,
          isActive: qbEmp.Active !== false,
          hiredDate: qbEmp.HiredDate ? new Date(qbEmp.HiredDate) : undefined,
          releasedDate: qbEmp.ReleasedDate ? new Date(qbEmp.ReleasedDate) : undefined,
          // Preserve MongoDB-only fields if they exist
          department: existingEmployee?.department || undefined,
          jobTitle: existingEmployee?.jobTitle || undefined,
          paymentMethod: existingEmployee?.paymentMethod || 'check',
        };

        if (existingEmployee) {
          // Update existing employee
          await Employee.findByIdAndUpdate(
            existingEmployee._id,
            employeeData,
            { new: true }
          );
          updatedCount++;
          console.log(`✅ Updated employee: ${employeeData.displayName}`);
        } else {
          // Create new employee
          const newEmployee = await Employee.create(employeeData);
          newCount++;
          console.log(`✅ Created new employee: ${employeeData.displayName}`);
        }

        syncedEmployees.push(employeeData);

      } catch (error: any) {
        console.error(`❌ Error syncing employee ${qbEmp.DisplayName}:`, error.message);
      }
    }

    const result = {
      totalSynced: newCount + updatedCount,
      newEmployees: newCount,
      updatedEmployees: updatedCount,
      employees: syncedEmployees,
    };

    console.log('✅ Employee sync completed:', result);

    return result;

  } catch (error: any) {
    console.error('❌ syncEmployees error:', error);
    throw error;
  }
}