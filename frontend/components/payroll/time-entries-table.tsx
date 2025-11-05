"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Employee, TimeEntry } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface TimeEntriesTableProps {
  employees: Employee[];
  timeEntries: TimeEntry[];
  onEdit?: (employeeId: string) => void;
  onDelete?: (employeeId: string) => void;
}

export function TimeEntriesTable({
  employees,
  timeEntries,
  onEdit,
  onDelete,
}: TimeEntriesTableProps) {
  const [sortBy, setSortBy] = useState<"name" | "hours" | "gross">("name");

  // Group time entries by employee
  const employeeData = employees.map((employee) => {
    const entries = timeEntries.filter((e) => e.employeeId === employee.id);
    const regularHours = entries
      .filter((e) => e.type === "regular")
      .reduce((sum, e) => sum + e.hours, 0);
    const overtimeHours = entries
      .filter((e) => e.type === "overtime")
      .reduce((sum, e) => sum + e.hours, 0);

    const regularPay = regularHours * employee.hourlyRate;
    const overtimePay = overtimeHours * employee.hourlyRate * 1.5;
    const grossPay = regularPay + overtimePay;

    return {
      employee,
      regularHours,
      overtimeHours,
      grossPay,
    };
  });

  // Sort data
  const sortedData = [...employeeData].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.employee.displayName.localeCompare(b.employee.displayName);
      case "hours":
        return (
          b.regularHours +
          b.overtimeHours -
          (a.regularHours + a.overtimeHours)
        );
      case "gross":
        return b.grossPay - a.grossPay;
      default:
        return 0;
    }
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setSortBy("name")}
            >
              Employee Name {sortBy === "name" && "↓"}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-gray-50"
              onClick={() => setSortBy("hours")}
            >
              Regular Hours {sortBy === "hours" && "↓"}
            </TableHead>
            <TableHead className="text-right">Overtime Hours</TableHead>
            <TableHead className="text-right">Hourly Rate</TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-gray-50"
              onClick={() => setSortBy("gross")}
            >
              Gross Pay {sortBy === "gross" && "↓"}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map(({ employee, regularHours, overtimeHours, grossPay }) => (
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
              <TableCell className="text-right">
                {formatCurrency(employee.hourlyRate)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(grossPay)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(employee.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(employee.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

