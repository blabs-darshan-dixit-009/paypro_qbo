"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { EmployeeCard } from "@/components/employees/employee-card";
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types";
import { Search, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/context/user-context";
import { quickbooksApi, apiClient } from "@/lib/api";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userId } = useUser();
  // Temporary: use hardcoded userId for debugging
  const effectiveUserId = userId || 'com_1';

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await quickbooksApi.getEmployees('com_1');

      // Transform backend data to match frontend interface
      const transformedEmployees = response.employees.map((emp: any) => ({
        id: emp._id,
        qbEmployeeId: emp.qbEmployeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        displayName: emp.displayName,
        email: emp.email,
        phone: emp.phone,
        hourlyRate: emp.hourlyRate,
        filingStatus: emp.filingStatus,
        allowances: emp.allowances,
        additionalWithholding: emp.additionalWithholding,
        isActive: emp.isActive,
        hiredDate: emp.hiredDate ? new Date(emp.hiredDate).toISOString().split('T')[0] : '',
        releasedDate: emp.releasedDate ? new Date(emp.releasedDate).toISOString().split('T')[0] : null,
      }));
      setEmployees(transformedEmployees);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      apiClient.handleError(error, "Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && employee.isActive) ||
      (statusFilter === "inactive" && !employee.isActive);

    return matchesSearch && matchesStatus;
  });

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.displayName.localeCompare(b.displayName);
      case "hireDate":
        return new Date(b.hiredDate).getTime() - new Date(a.hiredDate).getTime();
      case "payRate":
        return b.hourlyRate - a.hourlyRate;
      default:
        return 0;
    }
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await quickbooksApi.syncEmployees('com_1');

      toast({
        title: "Sync completed",
        description: result.message || "Employees synced successfully from QuickBooks.",
      });

      // Refresh the employee list
      await fetchEmployees();
    } catch (error: any) {
      apiClient.handleError(error, "Failed to sync employees");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    toast({
      title: "Edit employee",
      description: `Opening edit dialog for ${employee.displayName}`,
    });
  };

  const handleDeactivate = (employee: Employee) => {
    toast({
      title: "Employee deactivated",
      description: `${employee.displayName} has been deactivated.`,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Employees" />
      
      <div className="flex-1 space-y-6 p-6 overflow-y-auto">
        {/* Filters and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="hireDate">Hire Date</SelectItem>
                <SelectItem value="payRate">Pay Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync from QuickBooks"}
            </Button>
            <AddEmployeeDialog />
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {sortedEmployees.length} of {employees.length} employees
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading employees...</p>
          </div>
        ) : (
          <>
            {/* Employee Cards */}
            <div className="grid gap-4">
              {sortedEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={handleEdit}
                  onDeactivate={handleDeactivate}
                />
              ))}
            </div>

            {/* Empty State */}
            {sortedEmployees.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-gray-900">No employees found</p>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria, or sync from QuickBooks
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

