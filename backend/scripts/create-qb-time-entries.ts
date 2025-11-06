// scripts/test-time-tracking.ts
import 'dotenv/config';
import axios from 'axios';
import { getValidAccessToken, getQuickBooksConnection } from '../src/lib/quickbooks/auth';
import connectDB from '../src/lib/db/mongodb';

const BASE_URL = 'https://sandbox-quickbooks.api.intuit.com';
const USER_ID = 'com_1';

async function testTimeTracking() {
  try {
    await connectDB();
    
    console.log('🔐 Getting QuickBooks connection...');
    const connection = await getQuickBooksConnection(USER_ID);
    if (!connection) {
      throw new Error('QuickBooks not connected');
    }

    const accessToken = await getValidAccessToken(USER_ID);
    const realmId = connection.realmId;

    console.log('✅ Connection found');
    console.log(`   Realm ID: ${realmId}`);

    // Get first active employee
    console.log('\n👤 Getting first employee...');
    const empResponse = await axios.get(
      `${BASE_URL}/v3/company/${realmId}/query`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        params: {
          query: "SELECT * FROM Employee WHERE Active=true MAXRESULTS 1"
        }
      }
    );

    const employees = empResponse.data.QueryResponse?.Employee || [];
    if (employees.length === 0) {
      throw new Error('No active employees found');
    }

    const employee = employees[0];
    console.log(`✅ Found employee: ${employee.DisplayName} (ID: ${employee.Id})`);

    // Try wrapping in TimeActivity object
    console.log('\n✏️  Creating time activity...');
    
    const requestBody = {
        TxnDate: '2025-11-05',
        NameOf: {
          value: employee.Id,
          name: employee.DisplayName
        },
        EmployeeRef:{
          value: employee.Id,
          name: employee.DisplayName
        },
        Hours: 8,
        Minutes: 30
    };

    console.log('   Request:', JSON.stringify(requestBody, null, 2));

    const createResponse = await axios.post(
      `${BASE_URL}/v3/company/${realmId}/timeactivity`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (createResponse.data.TimeActivity) {
      console.log('\n✅ Time activity created successfully!');
      console.log('   ID:', createResponse.data.TimeActivity.Id);
      console.log('   Employee:', createResponse.data.TimeActivity.EmployeeRef?.name);
      console.log('   Hours:', createResponse.data.TimeActivity.Hours);
      console.log('   Minutes:', createResponse.data.TimeActivity.Minutes);
      console.log('   Date:', createResponse.data.TimeActivity.TxnDate);
      console.log('\n🎉 Time tracking is fully working!');
    }

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.response?.data?.Fault?.Error || error.message);
    
    if (error.response?.data?.Fault?.Error) {
      const qbError = error.response.data.Fault.Error[0];
      console.error('   QuickBooks Error:', qbError.Message);
      console.error('   Detail:', qbError.Detail);
      
      if (error.response?.data) {
        console.error('\n   Full response:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    process.exit(1);
  }
}

testTimeTracking();