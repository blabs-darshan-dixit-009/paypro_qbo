"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { TimeEntriesTable } from "@/components/payroll/time-entries-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { Calendar, Users, DollarSign, Search, Upload, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/context/user-context";
import { quickbooksApi, payrollApi, apiClient } from "@/lib/api";
import { Employee, TimeEntry, PayrollRun } from "@/types";

export default function PayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userId } = useUser();

  const currentPayrollRun = payrollRuns[0] || null;

  // Fetch data on mount
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Fetch pay periods
      const payPeriodsResponse = await payrollApi.getPayPeriods(userId);
      setPayrollRuns(payPeriodsResponse.payPeriods);

      // Fetch employees
      const employeesResponse = await quickbooksApi.getEmployees(userId);
      setEmployees(employeesResponse.employees);

      // If there's a current pay period, fetch its time entries
      if (payPeriodsResponse.payPeriods.length > 0) {
        const currentPeriod = payPeriodsResponse.payPeriods[0];
        try {
          const timeEntriesResponse = await quickbooksApi.getTimeEntries(currentPeriod.id);
          setTimeEntries(timeEntriesResponse.entries);
        } catch (error) {
          // It's okay if time entries don't exist yet
          console.log('No time entries found for current period');
        }
      }
    } catch (error: any) {
      apiClient.handleError(error, "Failed to fetch payroll data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((employee) =>
    employee.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImportTimeEntries = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (!currentPayrollRun) {
      toast({
        title: "Error",
        description: "No active pay period found. Please create a pay period first.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const result = await quickbooksApi.importTimeEntries(userId, currentPayrollRun.id);
      
      toast({
        title: "Time entries imported",
        description: result.message || "Time entries have been imported successfully from QuickBooks.",
      });
      
      // Refresh the data
      await fetchData();
    } catch (error: any) {
      apiClient.handleError(error, "Failed to import time entries");
    } finally {
      setIsImporting(false);
    }
  };

  const handleEditTimeEntry = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    toast({
      title: "Edit time entry",
      description: `Opening edit dialog for ${employee?.displayName}`,
    });
  };

  const handleDeleteTimeEntry = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    toast({
      title: "Time entry deleted",
      description: `Time entries for ${employee?.displayName} have been deleted.`,
    });
  };

  // Calculate totals
  const totalEmployees = employees.length;
  
  // Calculate hours from time entries
  const regularHours = timeEntries
    .filter(entry => entry.type === 'regular')
    .reduce((sum, entry) => sum + entry.hours, 0);
  const overtimeHours = timeEntries
    .filter(entry => entry.type === 'overtime')
    .reduce((sum, entry) => sum + entry.hours, 0);
  const totalHours = regularHours + overtimeHours;

  return (
    <div className="flex flex-col h-screen">
      <Header title="Payroll" />
      
      <div className="flex-1 space-y-6 p-6 overflow-y-auto">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading payroll data...</p>
          </div>
        ) : !currentPayrollRun ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-gray-900">No active pay period</p>
                <p className="mt-1 text-sm text-gray-500 mb-4">
                  Create a pay period to start processing payroll
                </p>
                <Button>Create Pay Period</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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
              timeEntries={timeEntries}
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
          </>
        )}
      </div>
    </div>
  );
}

