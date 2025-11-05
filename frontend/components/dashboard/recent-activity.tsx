"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, UserPlus, RefreshCw, Settings as SettingsIcon } from "lucide-react";

interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons = {
  payroll_processed: CheckCircle,
  employee_added: UserPlus,
  sync_completed: RefreshCw,
  settings_updated: SettingsIcon,
};

const activityColors = {
  payroll_processed: "text-green-600 bg-green-100",
  employee_added: "text-blue-600 bg-blue-100",
  sync_completed: "text-purple-600 bg-purple-100",
  settings_updated: "text-orange-600 bg-orange-100",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.user} •{" "}
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

