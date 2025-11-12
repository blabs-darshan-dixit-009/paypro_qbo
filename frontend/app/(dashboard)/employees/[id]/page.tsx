"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { EmployeeDetails } from "@/components/employees/employee-details";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quickbooksApi, apiClient } from "@/lib/api";
import { getInitials, formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, Mail, Phone, RefreshCw } from "lucide-react";
import { Employee } from "@/types";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  // Validate employeeId
  if (!employeeId || typeof employeeId !== 'string') {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Invalid Employee ID" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Invalid employee ID</h2>
            <p className="mt-2 text-gray-600">
              The employee ID provided is not valid.
            </p>
            <Button className="mt-4" onClick={() => router.push("/employees")}>
              Back to Employees
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTimeEntries, setIsLoadingTimeEntries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!employeeId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await quickbooksApi.getEmployee(employeeId);

        // Check if API response is successful
        if (!response.success || !response.employee) {
          throw new Error('Invalid employee data received');
        }

        // Transform backend data to match frontend interface
        const transformedEmployee: Employee = {
          id: response.employee._id,
          qbEmployeeId: response.employee.qbEmployeeId,
          firstName: response.employee.firstName,
          lastName: response.employee.lastName,
          displayName: response.employee.displayName,
          email: response.employee.email || '',
          phone: response.employee.phone,
          hourlyRate: response.employee.hourlyRate,
          filingStatus: response.employee.filingStatus,
          allowances: response.employee.allowances,
          additionalWithholding: response.employee.additionalWithholding,
          isActive: response.employee.isActive,
          hiredDate: response.employee.hiredDate ? new Date(response.employee.hiredDate).toISOString().split('T')[0] : '',
          releasedDate: response.employee.releasedDate ? new Date(response.employee.releasedDate).toISOString().split('T')[0] : null,
        };

        setEmployee(transformedEmployee);

        // Also fetch time entries
        await fetchTimeEntries();
      } catch (error: any) {
        console.error('Error fetching employee:', error);
        const errorMessage = error?.message || error?.response?.data?.error || 'Failed to load employee';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const fetchTimeEntries = async () => {
    if (!employeeId) return;

    setIsLoadingTimeEntries(true);
    try {
      const response = await quickbooksApi.getEmployeeTimeEntries(employeeId, 20);
      if (response.success && Array.isArray(response.entries)) {
        // Transform backend time entries to match frontend interface
        const transformedEntries = response.entries.map((entry: any) => ({
          id: entry._id,
          employeeId: entry.employeeId,
          date: entry.date,
          hours: entry.hours,
          type: entry.type,
        }));
        setTimeEntries(transformedEntries);
      } else {
        setTimeEntries([]);
      }
    } catch (error: any) {
      console.error('Error fetching time entries:', error);
      // Silently fail for time entries - just use empty array
      setTimeEntries([]);
    } finally {
      setIsLoadingTimeEntries(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Employee Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading employee...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Employee Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {error ? 'Error Loading Employee' : 'Employee not found'}
            </h2>
            <p className="mt-2 text-gray-600">
              {error || 'The employee you\'re looking for doesn\'t exist.'}
            </p>
            <Button className="mt-4" onClick={() => router.push("/employees")}>
              Back to Employees
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Employee Details" />
      
      <div className="flex-1 space-y-6 p-6 overflow-y-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/employees")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>

        {/* Employee Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-xl font-semibold">
                  {getInitials(employee.firstName, employee.lastName)}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {employee.displayName}
                    </h2>
                    <Badge variant={employee.isActive ? "success" : "secondary"}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {employee.email}
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {employee.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Employee
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeEntries">Time Entries</TabsTrigger>
            <TabsTrigger value="payrollHistory">Payroll History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <EmployeeDetails employee={employee} />
          </TabsContent>

          {/* Time Entries Tab */}
          <TabsContent value="timeEntries">
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTimeEntries ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading time entries...</span>
                  </div>
                ) : timeEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No time entries found for this employee.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries.map((entry) => {
                        const rate =
                          entry.type === "overtime"
                            ? employee.hourlyRate * 1.5
                            : employee.hourlyRate;
                        const amount = entry.hours * rate;

                        return (
                          <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.date)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  entry.type === "overtime" ? "warning" : "default"
                                }
                              >
                                {entry.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {entry.hours.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll History Tab */}
          <TabsContent value="payrollHistory">
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Payroll history will be available once payroll processing is implemented.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

