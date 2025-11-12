# PayPro API Collection

This is a comprehensive Postman collection for the PayPro - QuickBooks Integrated Payroll System API.

## 📋 Overview

The PayPro API provides endpoints for managing payroll operations with seamless QuickBooks integration. This collection includes all available API endpoints with proper documentation, examples, and test scripts.

## 🚀 Quick Start

### Prerequisites
- PayPro backend server running on `http://localhost:3001`
- MongoDB database connection
- QuickBooks Developer account (for OAuth testing)

### Import the Collection

1. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select "File"
   - Choose `PayPro_API_Collection.postman_collection.json`

2. **Import Environment:**
   - Click "Import" again
   - Select "File"
   - Choose `PayPro_API_Environment.postman_environment.json`
   - Select "PayPro API Environment" from the environment dropdown

## 📁 API Organization

The collection is organized into the following folders:

### 🔐 Authentication & OAuth
- **Generate QuickBooks Auth URL** - Initiates QuickBooks OAuth flow
- **QuickBooks OAuth Callback** - Handles OAuth callback (usually automatic)

### 💰 Payroll Management
- **Create Pay Period** - Creates a new pay period for processing
- **Get Pay Periods** - Retrieves existing pay periods for a user

### 👥 Employee Management
- **Get All Employees** - Lists all active employees
- **Get Employee by ID** - Retrieves specific employee details
- **Sync Employees from QuickBooks** - Imports employees and creates pay period with time entries

### ⏰ Time Entry Management
- **Get Time Entries by Pay Period** - Lists all time entries for a pay period
- **Get Time Entries by Employee** - Lists time entries for specific employee
- **Import Time Entries** - Imports time entries from QuickBooks Time

## 🔧 Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `base_url` | API server base URL | `http://localhost:3001` |
| `user_id` | User identifier for requests | `test-user-123` |
| `employee_id` | Employee ID (auto-populated) | - |
| `pay_period_id` | Pay period ID (auto-populated) | - |
| `qb_auth_code` | QuickBooks OAuth code | - |
| `qb_realm_id` | QuickBooks company realm ID | - |
| `qb_state` | QuickBooks OAuth state | - |

## 📝 API Endpoints Reference

### Authentication Endpoints

#### Generate QuickBooks Auth URL
```
GET /api/quickbooks/connect?userId={{user_id}}
```
Generates OAuth authorization URL for QuickBooks connection.

**Response:**
```json
{
    "authUrl": "https://appcenter.intuit.com/connect/oauth2?...",
    "userId": "test-user-123",
    "message": "Open this URL to authorize QuickBooks"
}
```

#### QuickBooks OAuth Callback
```
GET /api/auth/callback/quickbooks?code={{qb_auth_code}}&realmId={{qb_realm_id}}&state={{qb_state}}
```
Handles OAuth callback from QuickBooks (typically automatic redirect).

### Payroll Endpoints

#### Create Pay Period
```
POST /api/payroll/pay-period
Content-Type: application/json

{
    "userId": "{{user_id}}",
    "startDate": "2025-10-01",
    "endDate": "2025-10-31",
    "processDate": "2025-11-01"
}
```

**Response:**
```json
{
    "success": true,
    "payPeriod": {
        "_id": "673a8f5c8d9e0a0012345678",
        "userId": "test-user-123",
        "startDate": "2025-10-01T00:00:00.000Z",
        "endDate": "2025-10-31T00:00:00.000Z",
        "processDate": "2025-11-01T00:00:00.000Z",
        "status": "draft"
    }
}
```

#### Get Pay Periods
```
GET /api/payroll/pay-period?userId={{user_id}}
```

Returns up to 10 most recent pay periods for the user.

### Employee Endpoints

#### Get All Employees
```
GET /api/quickbooks/employees?userId={{user_id}}
```

Returns all active employees sorted by display name.

#### Get Employee by ID
```
GET /api/quickbooks/employees/{{employee_id}}
```

Returns detailed information for a specific employee.

#### Sync Employees from QuickBooks
```
POST /api/quickbooks/employees/sync
Content-Type: application/json

{
    "userId": "{{user_id}}",
    "startDate": "2025-10-01",
    "endDate": "2025-10-31"
}
```

**Process:**
1. Syncs employees from QuickBooks Online
2. Creates a pay period
3. Imports time entries for the pay period

### Time Entry Endpoints

#### Get Time Entries by Pay Period
```
GET /api/quickbooks/time?payPeriodId={{pay_period_id}}
```

Returns all time entries for a pay period with employee details and totals.

#### Get Time Entries by Employee
```
GET /api/quickbooks/time/employee/{{employee_id}}?limit=20
```

Returns time entries for a specific employee (newest first).

#### Import Time Entries
```
POST /api/quickbooks/time/import
Content-Type: application/json

{
    "userId": "{{user_id}}",
    "payPeriodId": "{{pay_period_id}}"
}
```

Imports time entries from QuickBooks Time for the specified pay period.

## 🧪 Testing Features

### Global Test Scripts

The collection includes global test scripts that:

- ✅ Verify response status codes (2xx)
- ✅ Check for success fields in responses
- ✅ Monitor response times (< 5000ms)
- 🔄 Auto-populate variables (employee_id, pay_period_id)

### Pre-request Scripts

- Adds timestamp to each request
- Sets default user ID if not configured

## 🔄 Common Workflows

### 1. Initial Setup & Sync
1. **Generate Auth URL** → Open URL in browser → Complete OAuth
2. **Sync Employees** → Creates pay period and imports data
3. **Get Employees** → Verify employee data
4. **Get Time Entries** → Review imported hours

### 2. Pay Period Management
1. **Create Pay Period** → Set pay period dates
2. **Import Time Entries** → Pull latest hours from QuickBooks
3. **Get Time Entries by Pay Period** → Review all entries
4. **Get Pay Periods** → Check pay period status

### 3. Employee Management
1. **Get All Employees** → List all active employees
2. **Get Employee by ID** → Get detailed employee info
3. **Get Time Entries by Employee** → Review specific employee's hours

## 📊 Data Models

### Employee
```typescript
{
  _id: string;
  userId: string;
  qbEmployeeId?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email?: string;
  phone?: string;
  hourlyRate: number;
  filingStatus: 'single' | 'married' | 'head_of_household';
  allowances: number;
  additionalWithholding: number;
  isActive: boolean;
  hiredDate?: Date;
  releasedDate?: Date;
}
```

### Pay Period
```typescript
{
  _id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  processDate: Date;
  status: 'draft' | 'processing' | 'processed' | 'synced' | 'paid';
  employeeCount?: number;
  totalGrossPay?: number;
  totalNetPay?: number;
}
```

### Time Entry
```typescript
{
  _id: string;
  employeeId: ObjectId;
  payPeriodId: ObjectId;
  qbEmployeeId?: string;
  date: Date;
  hours: number;
  type: 'regular' | 'overtime' | 'pto' | 'sick';
  source: 'quickbooks_online' | 'quickbooks_time' | 'manual';
  qbTimeActivityId?: string;
}
```

## 🚨 Error Handling

All endpoints return standardized error responses:

```json
{
    "success": false,
    "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing required fields)
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security Notes

- OAuth flows require proper QuickBooks Developer account setup
- User IDs should be validated in production
- Consider implementing JWT authentication for API access
- Environment variables should contain sensitive data only in development

## 📞 Support

For API issues or questions:
1. Check the endpoint documentation in this README
2. Review the Postman collection examples
3. Check server logs for detailed error messages
4. Ensure QuickBooks connection is properly configured

## 🔄 Version History

- **v1.0.0** - Initial collection with all current API endpoints
- Includes comprehensive examples and documentation
- Global test scripts and variable management
- Production-ready structure following Postman v2.1 guidelines
