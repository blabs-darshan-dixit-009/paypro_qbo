"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Employee, PayStub } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Mail, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PayStubPreviewProps {
  employee: Employee;
  payStub: PayStub;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayStubPreview({
  employee,
  payStub,
  open,
  onOpenChange,
}: PayStubPreviewProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Pay stub PDF is being downloaded.",
    });
  };

  const handleEmail = () => {
    toast({
      title: "Email sent",
      description: `Pay stub has been sent to ${employee.email}`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay Stub Preview</DialogTitle>
        </DialogHeader>

        {/* Pay Stub Content */}
        <div className="space-y-6 p-6 bg-white">
          {/* Company Header */}
          <div className="text-center border-2 border-gray-900 p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              ABC Restaurant Inc.
            </h1>
            <p className="text-sm text-gray-600">123 Main St, Los Angeles, CA 90001</p>
            <p className="text-sm text-gray-600">(555) 123-4567</p>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">PAY STUB</h2>
          </div>

          {/* Employee & Pay Period Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Employee</h3>
              <p className="text-sm">{employee.displayName}</p>
              <p className="text-sm text-gray-600">{employee.email}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-gray-900 mb-2">Pay Period</h3>
              <p className="text-sm">Dec 1-14, 2024</p>
              <p className="text-sm text-gray-600">
                Pay Date: {formatDate("2024-12-15")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Earnings */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">EARNINGS</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Hours</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Regular Pay</td>
                  <td className="text-right">{payStub.regularHours.toFixed(2)}</td>
                  <td className="text-right">{formatCurrency(payStub.hourlyRate)}</td>
                  <td className="text-right font-medium">
                    {formatCurrency(payStub.regularPay)}
                  </td>
                </tr>
                {payStub.overtimeHours > 0 && (
                  <tr className="border-b">
                    <td className="py-2">Overtime Pay</td>
                    <td className="text-right">{payStub.overtimeHours.toFixed(2)}</td>
                    <td className="text-right">
                      {formatCurrency(payStub.hourlyRate * 1.5)}
                    </td>
                    <td className="text-right font-medium">
                      {formatCurrency(payStub.overtimePay)}
                    </td>
                  </tr>
                )}
                <tr className="font-semibold">
                  <td colSpan={3} className="text-right py-2">
                    Gross Pay
                  </td>
                  <td className="text-right py-2">
                    {formatCurrency(payStub.grossPay)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Separator />

          {/* Deductions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">DEDUCTIONS</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Federal Income Tax</td>
                  <td className="text-right">{formatCurrency(payStub.federalTax)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">State Income Tax</td>
                  <td className="text-right">{formatCurrency(payStub.stateTax)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Social Security (6.2%)</td>
                  <td className="text-right">
                    {formatCurrency(payStub.socialSecurity)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Medicare (1.45%)</td>
                  <td className="text-right">{formatCurrency(payStub.medicare)}</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-2">Total Deductions</td>
                  <td className="text-right py-2">
                    {formatCurrency(payStub.totalDeductions)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Separator className="border-2 border-gray-900" />

          {/* Net Pay */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">NET PAY</span>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(payStub.netPay)}
              </span>
            </div>
          </div>

          {/* Year-to-Date Summary (Mock) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">
              Year-to-Date Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Gross Pay</p>
                <p className="font-medium">
                  {formatCurrency(payStub.grossPay * 20)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Deductions</p>
                <p className="font-medium">
                  {formatCurrency(payStub.totalDeductions * 20)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Net Pay</p>
                <p className="font-medium">{formatCurrency(payStub.netPay * 20)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>
              This is a computer-generated pay stub and does not require a signature.
            </p>
            <p className="mt-1">
              Please retain this document for your records.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email to Employee
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

