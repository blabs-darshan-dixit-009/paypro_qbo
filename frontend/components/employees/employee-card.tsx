"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Employee } from "@/types";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Mail, Phone, Calendar, Eye, Edit, UserX } from "lucide-react";
import Link from "next/link";

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDeactivate?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onEdit, onDeactivate }: EmployeeCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-semibold">
              {getInitials(employee.firstName, employee.lastName)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {employee.displayName}
                </h3>
                <Badge variant={employee.isActive ? "success" : "secondary"}>
                  {employee.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {employee.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Hired: {formatDate(employee.hiredDate)}
                </div>
              </div>

              <div className="mt-3">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(employee.hourlyRate)}/hr
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/employees/${employee.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDeactivate && employee.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeactivate(employee)}
              >
                <UserX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

