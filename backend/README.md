# PayPro Backend

A comprehensive payroll management system backend built with Next.js, TypeScript, and MongoDB, featuring seamless QuickBooks integration for automated employee and time entry synchronization.

## 🏗️ Project Overview

PayPro is a modern payroll processing platform that integrates with QuickBooks Online and QuickBooks Time to automate employee management, time tracking, and payroll calculations. The backend is built as a Next.js API server with full TypeScript support, MongoDB for data persistence, and comprehensive error handling.

### 🎯 Key Features

- **QuickBooks Integration**: Full OAuth flow with automatic token refresh
- **Employee Management**: Sync employees from QuickBooks with custom payroll settings
- **Time Tracking**: Import and manage time entries from QuickBooks Time
- **Payroll Processing**: Pay period management with automated calculations
- **RESTful API**: Clean, documented endpoints following REST principles
- **Production Ready**: Comprehensive error handling, logging, and monitoring

## 📁 Project Structure

```
backend/
├── src/
│   ├── app/
│   │   └── api/                    # Next.js API routes
│   │       ├── auth/               # Authentication endpoints
│   │       │   └── callback/
│   │       │       └── quickbooks/ # OAuth callback handler
│   │       ├── payroll/            # Payroll management
│   │       │   └── pay-period/     # Pay period CRUD
│   │       └── quickbooks/         # QuickBooks integration
│   │           ├── connect/        # OAuth connection
│   │           ├── employees/      # Employee management
│   │           │   ├── [id]/       # Individual employee
│   │           │   └── sync/       # Bulk sync operations
│   │           └── time/           # Time entry management
│   │               ├── employee/   # Employee-specific time entries
│   │               │   └── [id]/
│   │               ├── import/     # Import operations
│   │               └── route.ts    # Pay period time entries
│   ├── lib/
│   │   ├── db/                     # Database layer
│   │   │   ├── models/             # Mongoose models
│   │   │   │   ├── Employee.ts     # Employee schema
│   │   │   │   ├── PayPeriod.ts    # Pay period schema
│   │   │   │   ├── QuickBooksConnection.ts # QB connection schema
│   │   │   │   ├── TimeEntry.ts    # Time entry schema
│   │   │   │   └── User.ts         # User schema
│   │   │   └── mongodb.ts          # Database connection
│   │   └── quickbooks/             # QuickBooks integration
│   │       ├── auth.ts             # OAuth & token management
│   │       ├── employees.ts        # Employee operations
│   │       └── time.ts             # Time entry operations
│   ├── middleware.ts               # CORS & request middleware
│   └── types/                      # TypeScript type definitions
├── scripts/                        # Utility scripts
│   └── create-qb-time-entries.ts   # Time entry seeding script
├── postman/                        # API testing collection
├── docker-compose.yml              # Docker services
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 🛠️ Technology Stack

### Core Framework
- **Next.js 14**: React framework with built-in API routes
- **TypeScript**: Full type safety and modern JavaScript features
- **Node.js 18+**: Runtime environment

### Database & Data
- **MongoDB**: NoSQL document database
- **Mongoose**: MongoDB object modeling for Node.js
- **Connection Caching**: Optimized database connection management

### External Integrations
- **QuickBooks Online API**: Employee and company data
- **QuickBooks Time API**: Time tracking and activities
- **OAuth 2.0**: Secure authentication flow

### Development & Quality
- **ESLint**: Code linting and style enforcement
- **Jest**: Testing framework
- **Docker**: Containerized development environment

## 🎨 Code Style & Architecture

### Code Tone & Patterns

The codebase follows a **professional, enterprise-grade** approach with:

#### **1. Consistent Naming Conventions**
```typescript
// PascalCase for classes, interfaces, and types
interface IEmployee extends Document { ... }
class EmployeeService { ... }

// camelCase for variables and functions
const connectDB = async () => { ... }
const getValidAccessToken = async (userId: string) => { ... }

// UPPER_SNAKE_CASE for constants
const BASE_URL = 'https://api.quickbooks.com';
const CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
```

#### **2. Comprehensive Error Handling**
```typescript
try {
  // Business logic
  const result = await someOperation();
  return NextResponse.json({ success: true, data: result });
} catch (error: any) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: error.message || 'Operation failed' },
    { status: 500 }
  );
}
```

#### **3. Detailed Logging with Emojis**
```typescript
console.log('🔐 Generating auth URL for userId:', userId);
console.log('✅ QuickBooks connected successfully');
console.log('❌ OAuth callback error:', error);
```

#### **4. Clean Separation of Concerns**
- **Routes**: Handle HTTP requests/responses only
- **Services**: Contain business logic
- **Models**: Define data schemas and validation
- **Utils**: Provide reusable functions

#### **5. TypeScript Best Practices**
- Strict type checking enabled
- No `any` types (explicit types preferred)
- Interface definitions for all data structures
- Proper error type handling

### API Design Patterns

#### **1. RESTful Structure**
- Clear resource-based URLs
- HTTP methods for CRUD operations
- Consistent response formats

#### **2. Standardized Response Format**
```typescript
// Success Response
{
  success: true,
  data: { ... },
  count?: number,
  message?: string
}

// Error Response
{
  success: false,
  error: "Error message description"
}
```

#### **3. Request Validation**
```typescript
// Required field validation
if (!userId || !startDate || !endDate) {
  return NextResponse.json(
    { error: 'Missing required fields' },
    { status: 400 }
  );
}
```

#### **4. Database Connection Pattern**
```typescript
// Consistent database connection
await connectDB();

// Model operations
const employees = await Employee.find({ userId })
  .sort({ displayName: 1 })
  .lean();
```

## 🚀 API Endpoints

### Authentication & OAuth

#### `GET /api/auth/callback/quickbooks`
**OAuth callback handler for QuickBooks authentication**

**Query Parameters:**
- `code` (string): Authorization code from OAuth flow
- `realmId` (string): QuickBooks company realm ID
- `state` (string): State parameter for security validation

**Response:** Redirects to dashboard with success/error status

**Purpose:** Completes the OAuth flow and stores access tokens

---

#### `GET /api/quickbooks/connect`
**Generate QuickBooks authorization URL**

**Query Parameters:**
- `userId` (string, optional): User identifier (defaults to 'test-user-123')

**Response:**
```json
{
  "authUrl": "https://appcenter.intuit.com/connect/oauth2?...",
  "userId": "test-user-123",
  "message": "Open this URL to authorize QuickBooks"
}
```

**Purpose:** Initiates QuickBooks OAuth flow

### Payroll Management

#### `POST /api/payroll/pay-period`
**Create a new pay period**

**Request Body:**
```json
{
  "userId": "string",
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

**Purpose:** Creates pay period for payroll processing

---

#### `GET /api/payroll/pay-period`
**Retrieve pay periods for a user**

**Query Parameters:**
- `userId` (string, required): User identifier

**Response:**
```json
{
  "success": true,
  "count": 2,
  "payPeriods": [
    {
      "_id": "673a8f5c8d9e0a0012345678",
      "userId": "test-user-123",
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-31T00:00:00.000Z",
      "processDate": "2025-11-01T00:00:00.000Z",
      "status": "draft"
    }
  ]
}
```

**Purpose:** Lists pay periods (returns up to 10 most recent)

### Employee Management

#### `GET /api/quickbooks/employees`
**Get all active employees**

**Query Parameters:**
- `userId` (string, required): User identifier

**Response:**
```json
{
  "success": true,
  "count": 3,
  "employees": [
    {
      "_id": "673a8f5c8d9e0a001234567a",
      "userId": "test-user-123",
      "qbEmployeeId": "123",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "email": "john.doe@company.com",
      "hourlyRate": 25.00,
      "filingStatus": "married",
      "allowances": 2,
      "additionalWithholding": 50.00,
      "isActive": true,
      "hiredDate": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

**Purpose:** Lists all active employees sorted by display name

---

#### `GET /api/quickbooks/employees/[id]`
**Get specific employee details**

**Path Parameters:**
- `id` (string): Employee database ID

**Response:**
```json
{
  "success": true,
  "employee": {
    "_id": "673a8f5c8d9e0a001234567a",
    "userId": "test-user-123",
    "qbEmployeeId": "123",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "email": "john.doe@company.com",
    "phone": "555-123-4567",
    "hourlyRate": 25.00,
    "filingStatus": "married",
    "allowances": 2,
    "additionalWithholding": 50.00,
    "isActive": true,
    "hiredDate": "2024-01-15T00:00:00.000Z",
    "releasedDate": null
  }
}
```

**Purpose:** Retrieves detailed information for a specific employee

---

#### `POST /api/quickbooks/employees/sync`
**Sync employees from QuickBooks and create pay period**

**Request Body:**
```json
{
  "userId": "string",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully synced employees and imported time entries",
  "data": {
    "employees": {
      "totalSynced": 5,
      "newEmployees": 2,
      "updatedEmployees": 3,
      "employees": [...]
    },
    "payPeriod": {
      "id": "673a8f5c8d9e0a0012345678",
      "startDate": "2025-10-01",
      "endDate": "2025-10-31",
      "processDate": "2025-11-01"
    },
    "timeEntries": {
      "imported": 45,
      "totalHours": 320.5,
      "regularHours": 280.5,
      "overtimeHours": 40.0,
      "byEmployee": { ... }
    }
  }
}
```

**Purpose:** Comprehensive sync operation that imports employees, creates pay period, and imports time entries

### Time Entry Management

#### `GET /api/quickbooks/time`
**Get time entries for a pay period**

**Query Parameters:**
- `payPeriodId` (string, required): Pay period database ID

**Response:**
```json
{
  "success": true,
  "count": 45,
  "totals": {
    "totalHours": 320.5,
    "regularHours": 280.5,
    "overtimeHours": 40.0
  },
  "entries": [
    {
      "_id": "673a8f5c8d9e0a0012345680",
      "employeeId": {
        "_id": "673a8f5c8d9e0a001234567a",
        "displayName": "John Doe",
        "hourlyRate": 25.00
      },
      "payPeriodId": "673a8f5c8d9e0a0012345678",
      "qbEmployeeId": "123",
      "date": "2025-10-15T00:00:00.000Z",
      "hours": 8.0,
      "type": "regular",
      "source": "quickbooks_time",
      "qbTimeActivityId": "TA-12345"
    }
  ]
}
```

**Purpose:** Lists all time entries for a pay period with employee details and totals

---

#### `GET /api/quickbooks/time/employee/[id]`
**Get time entries for a specific employee**

**Path Parameters:**
- `id` (string): Employee database ID

**Query Parameters:**
- `limit` (number, optional): Maximum entries to return (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "entries": [
    {
      "_id": "673a8f5c8d9e0a0012345681",
      "employeeId": "673a8f5c8d9e0a001234567a",
      "payPeriodId": "673a8f5c8d9e0a0012345678",
      "qbEmployeeId": "123",
      "date": "2025-10-16T00:00:00.000Z",
      "hours": 10.0,
      "type": "overtime",
      "source": "quickbooks_time",
      "qbTimeActivityId": "TA-12346"
    }
  ]
}
```

**Purpose:** Lists time entries for a specific employee (newest first)

---

#### `POST /api/quickbooks/time/import`
**Import time entries from QuickBooks Time**

**Request Body:**
```json
{
  "userId": "string",
  "payPeriodId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Imported 23 time entries (180.50 regular, 24.00 OT)",
  "imported": 23,
  "totalHours": 204.5,
  "regularHours": 180.5,
  "overtimeHours": 24.0,
  "byEmployee": {
    "673a8f5c8d9e0a001234567a": {
      "name": "John Doe",
      "regular": 40.0,
      "overtime": 8.0,
      "total": 48.0
    }
  }
}
```

**Purpose:** Imports time entries from QuickBooks Time for the specified pay period

## 🗄️ Data Models

### Employee
```typescript
interface IEmployee extends Document {
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
interface IPayPeriod extends Document {
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
interface ITimeEntry extends Document {
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

### QuickBooks Connection
```typescript
interface IQuickBooksConnection extends Document {
  userId: string;
  realmId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Docker)
- QuickBooks Developer Account

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
yarn install
```

2. **Environment setup:**
```bash
cp .env.example .env.local
# Configure your environment variables
```

3. **Start MongoDB:**
```bash
yarn docker:up
```

4. **Start development server:**
```bash
yarn dev
```

The server will start on `http://localhost:3001`

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/paypro

# QuickBooks Integration
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=http://localhost:3001/api/auth/callback/quickbooks
QUICKBOOKS_ENVIRONMENT=sandbox

# CORS
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing & Scripts

### Available Scripts
```bash
yarn dev          # Start development server (port 3001)
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn type-check   # Run TypeScript type checking
yarn test         # Run Jest tests
yarn docker:up    # Start MongoDB and Mongo Express
yarn docker:down  # Stop Docker services
yarn seed:time    # Run time entry seeding script
```

### API Testing
The `postman/` directory contains a complete Postman collection with:
- All API endpoints documented
- Request/response examples
- Environment variables setup
- Automated test scripts

### Database Management
- **MongoDB**: Runs on port 27017
- **Mongo Express**: Web UI available at `http://localhost:8081`

## 🔧 Development Guidelines

### Code Style
- Use TypeScript with strict mode enabled
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions focused on single responsibilities

### Error Handling
- Always wrap async operations in try-catch blocks
- Return consistent error responses
- Log errors with appropriate context
- Use specific error messages for debugging

### API Design
- Follow RESTful conventions
- Validate all input parameters
- Return consistent response formats
- Include proper HTTP status codes
- Document all endpoints in Postman collection

### Database Operations
- Always call `connectDB()` before database operations
- Use lean queries for read operations when possible
- Implement proper indexing for performance
- Handle connection errors gracefully

## 📊 Monitoring & Logging

### Console Logging Patterns
- `🔐` - Authentication operations
- `✅` - Successful operations
- `❌` - Errors and failures
- `🔄` - Processing/Loading operations
- `💾` - Database operations
- `🚀` - API endpoint execution

### Error Monitoring
- All errors are logged with context
- Database connection issues are handled gracefully
- External API failures include detailed error responses

## 🔐 Security Considerations

### Authentication
- OAuth 2.0 flow with QuickBooks
- Secure token storage with encryption
- Automatic token refresh handling
- State parameter validation for CSRF protection

### Data Protection
- Environment variables for sensitive data
- Input validation on all endpoints
- CORS configuration for frontend access
- No sensitive data in logs

### API Security
- Request validation and sanitization
- Rate limiting considerations (to be implemented)
- Proper error messages without data leakage

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] QuickBooks credentials validated
- [ ] CORS origins configured
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and logging enabled
- [ ] Rate limiting implemented

### Docker Deployment
```bash
# Build and run with Docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 Additional Resources

- [QuickBooks API Documentation](https://developer.intuit.com/app/developer/qbo/docs/get-started)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Follow the established code style and patterns
2. Add comprehensive tests for new features
3. Update API documentation in Postman collection
4. Ensure TypeScript types are properly defined
5. Test with both sandbox and production QuickBooks environments

---

**PayPro Backend** - Enterprise-grade payroll processing with seamless QuickBooks integration.


