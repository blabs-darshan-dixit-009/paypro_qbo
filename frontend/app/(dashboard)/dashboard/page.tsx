"use client";

import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PayrollSummary } from "@/components/dashboard/payroll-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import { mockEmployees, mockPayrollRuns, mockActivities, mockTimeEntries } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const currentPayrollRun = mockPayrollRuns[0];
  const activeEmployees = mockEmployees.filter((e) => e.isActive).length;
  
  // Calculate average hours per week
  const totalHours = mockTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const avgHoursPerWeek = totalHours / mockEmployees.length / 2; // 2 weeks of data

  // Calculate total overtime hours
  const overtimeHours = mockTimeEntries
    .filter((entry) => entry.type === "overtime")
    .reduce((sum, entry) => sum + entry.hours, 0);

  // Get top 10 employees by hours worked
  const employeeHours = mockEmployees.map((employee) => {
    const hours = mockTimeEntries
      .filter((entry) => entry.employeeId === employee.id)
      .reduce((sum, entry) => sum + entry.hours, 0);
    return { name: employee.displayName, hours };
  });

  employeeHours.sort((a, b) => b.hours - a.hours);
  const topEmployees = employeeHours.slice(0, 10);
  const maxHours = Math.max(...topEmployees.map((e) => e.hours));

  // Days until next payroll
  const nextPayrollDate = new Date(currentPayrollRun.processDate);
  const today = new Date();
  const daysUntil = Math.ceil(
    (nextPayrollDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" />
      
      <div className="flex-1 space-y-6 p-6">
        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Next Payroll Run"
            value={formatDate(currentPayrollRun.processDate)}
            icon={Calendar}
            badge={{
              text: `In ${daysUntil} days`,
              variant: "info",
            }}
          />
          <StatsCard
            title="Total Employees"
            value={activeEmployees}
            subtitle="2 new this month"
            icon={Users}
          />
          <StatsCard
            title="Total Gross Amount"
            value={`$${currentPayrollRun.totalGrossPay.toLocaleString()}`}
            subtitle="For current period"
            icon={DollarSign}
          />
          <StatsCard
            title="Average Hours/Week"
            value={avgHoursPerWeek.toFixed(1)}
            subtitle={`${overtimeHours.toFixed(1)} overtime hours`}
            icon={Clock}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payroll Summary */}
          <div className="lg:col-span-1">
            <PayrollSummary payrollRun={currentPayrollRun} />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity activities={mockActivities} />
          </div>

          {/* Employee Quick Stats */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Hours Worked (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topEmployees.map((employee) => (
                    <div key={employee.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {employee.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {employee.hours.toFixed(1)} hrs
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${(employee.hours / maxHours) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

