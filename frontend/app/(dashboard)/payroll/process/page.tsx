"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockEmployees, mockTimeEntries, mockPayStubs, mockPayrollRuns } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { simulateDelay } from "@/lib/utils";

export default function ProcessPayrollPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const currentPayrollRun = mockPayrollRuns[0];

  const steps = [
    "Review Time Entries",
    "Preview Calculations",
    "Confirm & Process",
    "Complete",
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProcess = async () => {
    if (!isConfirmed) {
      toast({
        title: "Confirmation required",
        description: "Please confirm all information is correct before processing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    await simulateDelay(3000);
    setIsProcessing(false);
    handleNext();
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  // Calculate employer taxes
  const employerSocialSecurity = currentPayrollRun.totalGrossPay * 0.062;
  const employerMedicare = currentPayrollRun.totalGrossPay * 0.0145;
  const totalEmployerTaxes = employerSocialSecurity + employerMedicare;

  return (
    <div className="flex flex-col h-screen">
      <Header title="Process Payroll" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? "border-primary bg-primary text-white"
                          : isActive
                          ? "border-primary text-primary"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-full -mt-8 ${
                        isCompleted ? "bg-primary" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Review Time Entries */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Review Time Entries</CardTitle>
                <p className="text-sm text-gray-600">
                  Review and edit time entries for all employees before processing payroll.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Review Required</AlertTitle>
                  <AlertDescription>
                    Please verify all time entries are accurate before proceeding to the next step.
                  </AlertDescription>
                </Alert>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Regular Hours</TableHead>
                      <TableHead className="text-right">Overtime Hours</TableHead>
                      <TableHead className="text-right">Total Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEmployees.slice(0, 10).map((employee) => {
                      const entries = mockTimeEntries.filter((e) => e.employeeId === employee.id);
                      const regularHours = entries
                        .filter((e) => e.type === "regular")
                        .reduce((sum, e) => sum + e.hours, 0);
                      const overtimeHours = entries
                        .filter((e) => e.type === "overtime")
                        .reduce((sum, e) => sum + e.hours, 0);

                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            {employee.displayName}
                          </TableCell>
                          <TableCell className="text-right">
                            {regularHours.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">
                            {overtimeHours.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(regularHours + overtimeHours).toFixed(1)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => router.push("/payroll")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleNext}>
                    Next: Preview Calculations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Preview Calculations */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Preview Calculations</CardTitle>
                <p className="text-sm text-gray-600">
                  Review calculated payroll amounts for each employee.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mockPayStubs.slice(0, 10).map((stub) => {
                    const employee = mockEmployees.find((e) => e.id === stub.employeeId);
                    if (!employee) return null;

                    return (
                      <Card key={stub.id}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3">{employee.displayName}</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Regular: {stub.regularHours} hrs × {formatCurrency(stub.hourlyRate)}</p>
                              <p className="font-medium">{formatCurrency(stub.regularPay)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Overtime: {stub.overtimeHours} hrs × {formatCurrency(stub.hourlyRate * 1.5)}</p>
                              <p className="font-medium">{formatCurrency(stub.overtimePay)}</p>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-medium">Gross Pay: {formatCurrency(stub.grossPay)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-600">Deductions:</p>
                              <p className="text-xs">Federal Tax: {formatCurrency(stub.federalTax)}</p>
                              <p className="text-xs">State Tax: {formatCurrency(stub.stateTax)}</p>
                              <p className="text-xs">Social Security: {formatCurrency(stub.socialSecurity)}</p>
                              <p className="text-xs">Medicare: {formatCurrency(stub.medicare)}</p>
                              <p className="font-medium text-red-600">Total: {formatCurrency(stub.totalDeductions)}</p>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Net Pay:</span>
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(stub.netPay)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Summary */}
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Summary Totals</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Employees</p>
                        <p className="text-2xl font-bold">{currentPayrollRun.employeeCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Gross Pay</p>
                        <p className="text-2xl font-bold">{formatCurrency(currentPayrollRun.totalGrossPay)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Net Pay</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(currentPayrollRun.totalNetPay)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Next: Confirm & Process
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirm & Process */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Confirm & Process</CardTitle>
                <p className="text-sm text-gray-600">
                  Review the final summary and process payroll.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Employee Payroll Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Employee Payroll</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employees:</span>
                        <span className="font-medium">{currentPayrollRun.employeeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Gross:</span>
                        <span className="font-medium">{formatCurrency(currentPayrollRun.totalGrossPay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Deductions:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(
                            currentPayrollRun.totalFederalTax +
                            currentPayrollRun.totalStateTax +
                            currentPayrollRun.totalSocialSecurity +
                            currentPayrollRun.totalMedicare
                          )}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Net Pay:</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(currentPayrollRun.totalNetPay)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employer Taxes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Employer Taxes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Social Security (6.2%):</span>
                        <span className="font-medium">{formatCurrency(employerSocialSecurity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Medicare (1.45%):</span>
                        <span className="font-medium">{formatCurrency(employerMedicare)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Employer:</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(totalEmployerTaxes)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Confirmation */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Once you process this payroll, it cannot be undone. A journal entry will be posted to QuickBooks.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center space-x-2">
                  <input
                    id="confirm"
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="confirm" className="text-sm font-medium cursor-pointer">
                    I confirm all information is correct and ready to process
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} disabled={isProcessing}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleProcess} disabled={!isConfirmed || isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Process Payroll
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Payroll Processed Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your payroll has been processed and synced with QuickBooks.
                </p>

                <div className="max-w-md mx-auto space-y-3 mb-8 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Payroll calculated for {currentPayrollRun.employeeCount} employees</p>
                      <p className="text-sm text-gray-600">Total net pay: {formatCurrency(currentPayrollRun.totalNetPay)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Journal entry posted to QuickBooks</p>
                      <p className="text-sm text-gray-600">All transactions have been recorded</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Pay stubs generated</p>
                      <p className="text-sm text-gray-600">Ready to distribute to employees</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline">View Pay Stubs</Button>
                  <Button variant="outline">Email Pay Stubs</Button>
                  <Button variant="outline">Download PDF Report</Button>
                </div>

                <Button className="mt-6" onClick={handleFinish}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

