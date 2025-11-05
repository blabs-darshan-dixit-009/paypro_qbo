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
import { useToast } from "@/components/ui/use-toast";
import { simulateDelay } from "@/lib/utils";

export function TaxSettings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [state, setState] = useState("CA");
  const [taxYear, setTaxYear] = useState("2024");

  const handleSave = async () => {
    setIsSaving(true);
    await simulateDelay(1000);
    toast({
      title: "Tax settings saved",
      description: "Your tax settings have been updated successfully.",
    });
    setIsSaving(false);
  };

  const handleUpdateTaxTables = () => {
    toast({
      title: "Tax tables updated",
      description: "Tax tables have been updated to the latest version.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Federal Tax Bracket Year</Label>
            <Select value={taxYear} onValueChange={setTaxYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FICA Rates (Read-Only)</CardTitle>
          <p className="text-sm text-gray-600">
            Current federal tax rates for Social Security and Medicare
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Social Security</p>
                <p className="text-sm text-gray-600">Employee & Employer</p>
              </div>
              <span className="font-semibold">6.2%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Medicare</p>
                <p className="text-sm text-gray-600">Employee & Employer</p>
              </div>
              <span className="font-semibold">1.45%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium">Social Security Wage Cap</p>
                <p className="text-sm text-gray-600">Annual limit for 2024</p>
              </div>
              <span className="font-semibold">$168,600</span>
            </div>
          </div>

          <div className="pt-6">
            <Button variant="outline" onClick={handleUpdateTaxTables}>
              Update Tax Tables
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

