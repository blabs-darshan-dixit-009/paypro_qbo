"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { TimeEntriesTable } from "@/components/payroll/time-entries-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockEmployees, mockPayrollRuns, mockTimeEntries } from "@/lib/mock-data";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { Calendar, Users, DollarSign, Search, Upload, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { simulateDelay } from "@/lib/utils";

export default function PayrollPage() {
  const currentPayrollRun = mockPayrollRuns[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  // Filter employees
  const filteredEmployees = mockEmployees.filter((employee) =>
    employee.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImportTimeEntries = async () => {
    setIsImporting(true);
    await simulateDelay(2000);
    toast({
      title: "Time entries imported",
      description: "Time entries have been imported successfully from QuickBooks.",
    });
    setIsImporting(false);
  };

  const handleEditTimeEntry = (employeeId: string) => {
    const employee = mockEmployees.find((e) => e.id === employeeId);
    toast({
      title: "Edit time entry",
      description: `Opening edit dialog for ${employee?.displayName}`,
    });
  };

  const handleDeleteTimeEntry = (employeeId: string) => {
    const employee = mockEmployees.find((e) => e.id === employeeId);
    toast({
      title: "Time entry deleted",
      description: `Time entries for ${employee?.displayName} have been deleted.`,
    });
  };

  // Calculate totals
  const totalEmployees = mockEmployees.length;
  const regularHours = 957.5;
  const overtimeHours = 35.5;
  const totalHours = regularHours + overtimeHours;

  return (
    <div className="flex flex-col h-screen">
      <Header title="Payroll" />
      
      <div className="flex-1 space-y-6 p-6 overflow-y-auto">
        {/* Current Pay Period Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Pay Period</CardTitle>
              <Badge variant="info">Ready to Process</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Period Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Pay Period:</span>
                  <span className="font-medium">
                    {formatDateRange(
                      currentPayrollRun.startDate,
                      currentPayrollRun.endDate
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Process Date:</span>
                  <span className="font-medium">
                    {new Date(currentPayrollRun.processDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    Employees:
                  </div>
                  <span className="font-semibold">{totalEmployees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours:</span>
                  <span className="font-semibold">
                    {totalHours.toFixed(1)} ({regularHours.toFixed(1)} reg + {overtimeHours.toFixed(1)} OT)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated Gross:</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(currentPayrollRun.totalGrossPay)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated Net:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(currentPayrollRun.totalNetPay)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={handleImportTimeEntries}
                disabled={isImporting}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? "Importing..." : "Import Time Entries"}
              </Button>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Review Details
              </Button>
              <Link href="/payroll/process" className="ml-auto">
                <Button>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Process Payroll
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Time Entries Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Time Entries</CardTitle>
              <div className="flex gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search employees..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">Add Time Entry</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TimeEntriesTable
              employees={filteredEmployees}
              timeEntries={mockTimeEntries}
              onEdit={handleEditTimeEntry}
              onDelete={handleDeleteTimeEntry}
            />
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="flex justify-between items-center">
          <Link href="/payroll/history">
            <Button variant="outline">View Payroll History</Button>
          </Link>
          <Link href="/payroll/process">
            <Button size="lg">
              <DollarSign className="mr-2 h-5 w-5" />
              Process Payroll
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

