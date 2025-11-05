"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { mockPayrollRuns } from "@/lib/mock-data";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { Calendar, Download, Eye, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PayrollHistoryPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter payroll runs
  const filteredRuns = mockPayrollRuns.filter((run) => {
    const matchesStatus =
      statusFilter === "all" || run.status === statusFilter;
    const matchesSearch = formatDateRange(run.startDate, run.endDate)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (runId: string) => {
    setSelectedRun(runId === selectedRun ? null : runId);
  };

  const handleDownload = (runId: string) => {
    toast({
      title: "Download started",
      description: "Payroll report is being downloaded.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
      case "synced":
        return <Badge variant="success">Processed</Badge>;
      case "ready":
        return <Badge variant="info">Ready</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Payroll History" />
      
      <div className="flex-1 space-y-6 p-6 overflow-y-auto">
        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by pay period..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="synced">Synced</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payroll History Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Process Date</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead className="text-right">Total Gross</TableHead>
                  <TableHead className="text-right">Total Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => (
                  <>
                    <TableRow key={run.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {formatDateRange(run.startDate, run.endDate)}
                      </TableCell>
                      <TableCell>
                        {new Date(run.processDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        {run.employeeCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(run.totalGrossPay)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(run.totalNetPay)}
                      </TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(run.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(run.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Details */}
                    {selectedRun === run.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50 p-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            {/* Payroll Summary */}
                            <div>
                              <h4 className="font-semibold mb-3">Payroll Summary</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pay Period:</span>
                                  <span className="font-medium">
                                    {formatDateRange(run.startDate, run.endDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Process Date:</span>
                                  <span className="font-medium">
                                    {new Date(run.processDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Employees:</span>
                                  <span className="font-medium">{run.employeeCount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Status:</span>
                                  {getStatusBadge(run.status)}
                                </div>
                              </div>
                            </div>

                            {/* Financial Breakdown */}
                            <div>
                              <h4 className="font-semibold mb-3">Financial Breakdown</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Gross Pay:</span>
                                  <span className="font-medium">
                                    {formatCurrency(run.totalGrossPay)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Federal Tax:</span>
                                  <span>{formatCurrency(run.totalFederalTax)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">State Tax:</span>
                                  <span>{formatCurrency(run.totalStateTax)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Social Security:</span>
                                  <span>{formatCurrency(run.totalSocialSecurity)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Medicare:</span>
                                  <span>{formatCurrency(run.totalMedicare)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                  <span className="font-semibold">Net Pay:</span>
                                  <span className="font-bold text-primary">
                                    {formatCurrency(run.totalNetPay)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-6 flex gap-3">
                            <Button variant="outline" size="sm">
                              View Pay Stubs
                            </Button>
                            <Button variant="outline" size="sm">
                              Email Pay Stubs
                            </Button>
                            <Button variant="outline" size="sm">
                              Download Report
                            </Button>
                            {run.status === "synced" && (
                              <Button variant="outline" size="sm">
                                View in QuickBooks
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredRuns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-900">No payroll runs found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

