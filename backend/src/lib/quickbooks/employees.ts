// src/lib/quickbooks/employees.ts
import axios from 'axios';
import { getValidAccessToken, getQuickBooksConnection, BASE_URL } from './auth';
import Employee from '@/lib/db/models/Employee';
import connectDB from '@/lib/db/mongodb';

export interface QBEmployee {
  Id: string;
  DisplayName: string;
  GivenName: string;
  FamilyName: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  PrimaryPhone?: {
    FreeFormNumber: string;
  };
  Active: boolean;
  HiredDate?: string;
  ReleasedDate?: string;
}

/**
 * Fetch all active employees from QuickBooks
 */
export async function fetchEmployeesFromQB(
  userId: string,
  realmId: string
): Promise<QBEmployee[]> {
  const accessToken = await getValidAccessToken(userId);

  const query = "SELECT * FROM Employee WHERE Active=true";
  const url = `${BASE_URL}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    return response.data.QueryResponse?.Employee || [];
  } catch (error: any) {
    console.error('Fetch employees error:', error.response?.data || error.message);
    throw new Error('Failed to fetch employees from QuickBooks');
  }
}

/**
 * Sync employees from QuickBooks to MongoDB
 */
export async function syncEmployeesToDatabase(userId: string): Promise<{
  synced: number;
  created: number;
  updated: number;
  employees: any[];
}> {
  await connectDB();

  // Get QuickBooks connection
  const connection = await getQuickBooksConnection(userId);
  if (!connection) {
    throw new Error('QuickBooks not connected');
  }

  console.log('🔄 Fetching employees from QuickBooks...');
  const qbEmployees = await fetchEmployeesFromQB(userId, connection.realmId);
  console.log(`📥 Found ${qbEmployees.length} employees in QuickBooks`);

  let created = 0;
  let updated = 0;
  const syncedEmployees = [];

  for (const emp of qbEmployees) {
    const employeeData = {
      userId,
      qbEmployeeId: emp.Id,
      firstName: emp.GivenName,
      lastName: emp.FamilyName,
      displayName: emp.DisplayName,
      email: emp.PrimaryEmailAddr?.Address || null,
      phone: emp.PrimaryPhone?.FreeFormNumber || null,
      isActive: emp.Active,
      hiredDate: emp.HiredDate ? new Date(emp.HiredDate) : null,
      releasedDate: emp.ReleasedDate ? new Date(emp.ReleasedDate) : null,
      // Default values for fields not in QB
      hourlyRate: 18.50, // You'll need to set this manually or from another source
      filingStatus: 'single',
      allowances: 0,
      additionalWithholding: 0,
    };

    const existing = await Employee.findOne({ userId, qbEmployeeId: emp.Id });

    if (existing) {
      // Update existing employee
      Object.assign(existing, employeeData);
      await existing.save();
      updated++;
      syncedEmployees.push(existing);
      console.log(`✏️  Updated: ${emp.DisplayName}`);
    } else {
      // Create new employee
      const newEmployee = await Employee.create(employeeData);
      created++;
      syncedEmployees.push(newEmployee);
      console.log(`✅ Created: ${emp.DisplayName}`);
    }
  }

  // Update last sync time
  connection.lastSyncAt = new Date();
  await connection.save();

  console.log(`✅ Sync complete: ${created} created, ${updated} updated`);

  return {
    synced: qbEmployees.length,
    created,
    updated,
    employees: syncedEmployees,
  };
}