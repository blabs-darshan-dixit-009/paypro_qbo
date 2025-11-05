"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockChartOfAccounts } from "@/lib/mock-data";
import { useToast } from "@/components/ui/use-toast";
import { simulateDelay } from "@/lib/utils";

interface AccountMapping {
  payrollExpense: string;
  payrollTaxExpense: string;
  federalTaxPayable: string;
  stateTaxPayable: string;
  ficaPayable: string;
  bankAccount: string;
}

export function AccountMapping() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [mapping, setMapping] = useState<AccountMapping>({
    payrollExpense: "2",
    payrollTaxExpense: "3",
    federalTaxPayable: "4",
    stateTaxPayable: "5",
    ficaPayable: "6",
    bankAccount: "1",
  });

  const handleSave = async () => {
    setIsSaving(true);
    await simulateDelay(1000);
    toast({
      title: "Account mapping saved",
      description: "Your account mapping has been updated successfully.",
    });
    setIsSaving(false);
  };

  const mappingFields = [
    {
      label: "Payroll Expense",
      key: "payrollExpense" as keyof AccountMapping,
      description: "Account for employee wages and salaries",
    },
    {
      label: "Payroll Tax Expense",
      key: "payrollTaxExpense" as keyof AccountMapping,
      description: "Account for employer payroll tax expenses",
    },
    {
      label: "Federal Tax Payable",
      key: "federalTaxPayable" as keyof AccountMapping,
      description: "Liability account for federal tax withholdings",
    },
    {
      label: "State Tax Payable",
      key: "stateTaxPayable" as keyof AccountMapping,
      description: "Liability account for state tax withholdings",
    },
    {
      label: "FICA Payable",
      key: "ficaPayable" as keyof AccountMapping,
      description: "Liability account for Social Security and Medicare",
    },
    {
      label: "Bank Account",
      key: "bankAccount" as keyof AccountMapping,
      description: "Bank account for payroll disbursements",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>QuickBooks Account Mapping</CardTitle>
        <p className="text-sm text-gray-600">
          Map PayPro accounts to your QuickBooks Chart of Accounts
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mappingFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <p className="text-xs text-gray-500">{field.description}</p>
              <Select
                value={mapping[field.key]}
                onValueChange={(value) =>
                  setMapping({ ...mapping, [field.key]: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockChartOfAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.number ? `${account.number} - ` : ""}
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Mapping"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

