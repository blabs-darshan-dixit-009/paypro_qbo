"use client";

import { useParams, useRouter } from "next/navigation";
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
import { mockEmployees, mockTimeEntries, mockPayStubs } from "@/lib/mock-data";
import { getInitials, formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, Mail, Phone } from "lucide-react";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  // Find employee
  const employee = mockEmployees.find((e) => e.id === employeeId);

  if (!employee) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Employee Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Employee not found</h2>
            <p className="mt-2 text-gray-600">
              The employee you're looking for doesn't exist.
            </p>
            <Button className="mt-4" onClick={() => router.push("/employees")}>
              Back to Employees
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get employee time entries
  const employeeTimeEntries = mockTimeEntries
    .filter((entry) => entry.employeeId === employeeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  // Get employee pay stubs
  const employeePayStubs = mockPayStubs
    .filter((stub) => stub.employeeId === employeeId)
    .slice(0, 10);

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
                    {employeeTimeEntries.map((entry) => {
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pay Period</TableHead>
                      <TableHead className="text-right">Gross Pay</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePayStubs.map((stub) => (
                      <TableRow key={stub.id}>
                        <TableCell>
                          Dec 1-14, 2024
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(stub.grossPay)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(stub.totalDeductions)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(stub.netPay)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Processed</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Pay Stub
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

