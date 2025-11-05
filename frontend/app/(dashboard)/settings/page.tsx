"use client";

import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickBooksConnection } from "@/components/settings/quickbooks-connection";
import { AccountMapping } from "@/components/settings/account-mapping";
import { TaxSettings } from "@/components/settings/tax-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { simulateDelay } from "@/lib/utils";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Pay Period Settings
  const [payFrequency, setPayFrequency] = useState("bi-weekly");
  const [firstPayPeriod, setFirstPayPeriod] = useState("2024-01-01");
  const [processDay, setProcessDay] = useState("friday");

  // Company Info
  const [companyName, setCompanyName] = useState("ABC Restaurant Inc.");
  const [address, setAddress] = useState("123 Main St, Los Angeles, CA 90001");
  const [phone, setPhone] = useState("(555) 123-4567");
  const [email, setEmail] = useState("contact@abcrestaurant.com");

  const handleSavePayPeriod = async () => {
    setIsSaving(true);
    await simulateDelay(1000);
    toast({
      title: "Settings saved",
      description: "Pay period settings have been updated successfully.",
    });
    setIsSaving(false);
  };

  const handleSaveCompanyInfo = async () => {
    setIsSaving(true);
    await simulateDelay(1000);
    toast({
      title: "Settings saved",
      description: "Company information has been updated successfully.",
    });
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Settings" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="quickbooks" className="space-y-6">
            <TabsList>
              <TabsTrigger value="quickbooks">QuickBooks</TabsTrigger>
              <TabsTrigger value="accountMapping">Account Mapping</TabsTrigger>
              <TabsTrigger value="taxSettings">Tax Settings</TabsTrigger>
              <TabsTrigger value="payPeriod">Pay Period</TabsTrigger>
              <TabsTrigger value="companyInfo">Company Info</TabsTrigger>
            </TabsList>

            {/* QuickBooks Connection Tab */}
            <TabsContent value="quickbooks">
              <QuickBooksConnection />
            </TabsContent>

            {/* Account Mapping Tab */}
            <TabsContent value="accountMapping">
              <AccountMapping />
            </TabsContent>

            {/* Tax Settings Tab */}
            <TabsContent value="taxSettings">
              <TaxSettings />
            </TabsContent>

            {/* Pay Period Settings Tab */}
            <TabsContent value="payPeriod">
              <Card>
                <CardHeader>
                  <CardTitle>Pay Period Configuration</CardTitle>
                  <p className="text-sm text-gray-600">
                    Configure your payroll schedule and processing dates
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Pay Frequency</Label>
                    <Select value={payFrequency} onValueChange={setPayFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>First Pay Period Start Date</Label>
                    <Input
                      type="date"
                      value={firstPayPeriod}
                      onChange={(e) => setFirstPayPeriod(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Process Day</Label>
                    <Select value={processDay} onValueChange={setProcessDay}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSavePayPeriod} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Info Tab */}
            <TabsContent value="companyInfo">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <p className="text-sm text-gray-600">
                    Update your company details and contact information
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                        <span className="text-xs text-gray-500">No logo</span>
                      </div>
                      <Button variant="outline">Upload Logo</Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveCompanyInfo} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

