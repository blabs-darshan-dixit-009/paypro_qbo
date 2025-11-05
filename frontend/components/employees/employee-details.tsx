"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface EmployeeDetailsProps {
  employee: Employee;
}

export function EmployeeDetails({ employee }: EmployeeDetailsProps) {
  const filingStatusLabels = {
    single: "Single",
    married: "Married",
    head_of_household: "Head of Household",
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="font-medium">{employee.displayName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{employee.email}</p>
          </div>
          {employee.phone && (
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{employee.phone}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Hire Date</p>
            <p className="font-medium">{formatDate(employee.hiredDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium">
              {employee.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          {employee.qbEmployeeId && (
            <div>
              <p className="text-sm text-gray-600">QuickBooks ID</p>
              <p className="font-medium">{employee.qbEmployeeId}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Info */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Filing Status</p>
            <p className="font-medium">
              {filingStatusLabels[employee.filingStatus]}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tax Allowances</p>
            <p className="font-medium">{employee.allowances}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Additional Withholding</p>
            <p className="font-medium">
              {employee.additionalWithholding > 0
                ? formatCurrency(employee.additionalWithholding)
                : "None"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Hourly Rate</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(employee.hourlyRate)}/hr
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overtime Rate (1.5x)</p>
            <p className="text-lg font-semibold">
              {formatCurrency(employee.hourlyRate * 1.5)}/hr
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

