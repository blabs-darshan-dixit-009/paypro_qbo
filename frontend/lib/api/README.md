# API Integration Layer

This directory contains the frontend API integration layer for communicating with the PayPro backend.

## Structure

- `config.ts` - API configuration and URL management
- `client.ts` - Base HTTP client with error handling
- `types.ts` - TypeScript types for API requests/responses
- `quickbooks.ts` - QuickBooks API endpoints
- `payroll.ts` - Payroll API endpoints
- `index.ts` - Centralized exports

## Usage

### Import the API services

```typescript
import { quickbooksApi, payrollApi } from '@/lib/api';
```

### Example: Fetch employees

```typescript
try {
  const response = await quickbooksApi.getEmployees(userId);
  console.log('Employees:', response.employees);
} catch (error) {
  // Error handling is automatic via toast notifications
  console.error('Failed to fetch employees:', error);
}
```

### Example: Sync employees from QuickBooks

```typescript
try {
  const result = await quickbooksApi.syncEmployees(userId);
  toast({
    title: 'Success',
    description: result.message,
  });
} catch (error) {
  // Error is automatically handled
}
```

## Error Handling

The API client automatically handles errors and displays toast notifications. You can optionally catch errors for custom handling:

```typescript
try {
  await quickbooksApi.syncEmployees(userId);
} catch (error) {
  apiClient.handleError(error, 'Custom error message');
}
```

## Environment Variables

Configure the backend API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Available APIs

### Authentication

- `quickbooksApi.getAuthUrl(userId)` - Get QuickBooks OAuth URL

### Employees

- `quickbooksApi.getEmployees(userId)` - Get all employees
- `quickbooksApi.syncEmployees(userId)` - Sync employees from QuickBooks

### Time Entries

- `quickbooksApi.getTimeEntries(payPeriodId)` - Get time entries
- `quickbooksApi.importTimeEntries(userId, payPeriodId)` - Import time from QuickBooks

### Pay Periods

- `payrollApi.getPayPeriods(userId)` - Get pay periods
- `payrollApi.createPayPeriod(data)` - Create new pay period








