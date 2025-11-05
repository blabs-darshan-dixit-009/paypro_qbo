"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockQuickBooksConnection } from "@/lib/mock-data";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { simulateDelay } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function QuickBooksConnection() {
  const [connection, setConnection] = useState(mockQuickBooksConnection);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    await simulateDelay(2000);
    setConnection({
      ...connection,
      lastSync: new Date().toISOString(),
    });
    toast({
      title: "Sync completed",
      description: "Successfully synced with QuickBooks.",
    });
    setIsSyncing(false);
  };

  const handleDisconnect = () => {
    toast({
      title: "Disconnect QuickBooks",
      description: "This feature is not available in the demo.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          {connection.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-sm">
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Connected
                </Badge>
              </div>

              <div className="grid gap-3">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-medium">{connection.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Connected Since</p>
                  <p className="font-medium">
                    {new Date(connection.connectedSince!).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Sync</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(connection.lastSync!), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Realm ID</p>
                  <p className="font-mono text-sm">{connection.realmId}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Connect to QuickBooks to sync employee data and post payroll
                transactions automatically.
              </p>
              <Button>Connect to QuickBooks</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Read and write employee data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Create and update journal entries</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Read chart of accounts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Read and write payroll data</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

