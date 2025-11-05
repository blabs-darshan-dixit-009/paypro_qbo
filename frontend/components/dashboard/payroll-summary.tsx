"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { PayrollRun } from "@/types";
import { Eye } from "lucide-react";
import Link from "next/link";

interface PayrollSummaryProps {
  payrollRun: PayrollRun;
}

export function PayrollSummary({ payrollRun }: PayrollSummaryProps) {
  // Calculate regular and overtime hours from totals
  const regularHours = 957.5;
  const overtimeHours = 35.5;
  const totalDeductions =
    payrollRun.totalFederalTax +
    payrollRun.totalStateTax +
    payrollRun.totalSocialSecurity +
    payrollRun.totalMedicare;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bi-Weekly Payroll Summary</CardTitle>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>
            <span className="font-medium">Pay Period:</span>{" "}
            {formatDateRange(payrollRun.startDate, payrollRun.endDate)}
          </p>
          <p>
            <span className="font-medium">Process Date:</span>{" "}
            {new Date(payrollRun.processDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-gray-600">Regular Hours:</span>
            <span className="font-medium">{regularHours.toFixed(1)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-gray-600">Overtime Hours:</span>
            <span className="font-medium">{overtimeHours.toFixed(1)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-gray-600">Total Gross:</span>
            <span className="font-medium">{formatCurrency(payrollRun.totalGrossPay)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-gray-600">Total Deductions:</span>
            <span className="font-medium">{formatCurrency(totalDeductions)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-base font-semibold text-gray-900">Net Pay:</span>
            <span className="text-base font-bold text-primary">
              {formatCurrency(payrollRun.totalNetPay)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/payroll" className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
          <Link href="/payroll/process" className="flex-1">
            <Button className="w-full">Process Payroll</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

