"use client";

import * as React from "react";
import { useUsageStore } from "@/stores/usage-store";
import { Progress } from "@/components/ui/progress";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function UsageSection() {
  const usage = useUsageStore((state) => state.usage);

  if (!usage || Object.keys(usage).length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm">Usage</SidebarGroupLabel>
      <SidebarGroupContent className="px-3 py-2 space-y-4">
        {Object.entries(usage).map(([feature, stats]) => {
          if (stats.limit === -1) return null; // Skip unlimited

          const percentage = (stats.current / stats.limit) * 100;
          const isWarning = percentage > 70;
          const isCritical = percentage > 90;

          return (
            <div key={feature} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="capitalize">{feature.replace("_", " ")}</span>
                <span>
                  {stats.current} / {stats.limit}
                </span>
              </div>
              <Progress
                value={percentage}
                className="h-1.5"
                // @ts-ignore - shadcn progress indicator styling
                indicatorClassName={cn(
                  "transition-colors",
                  isCritical ? "bg-red-500" : isWarning ? "bg-orange-500" : "bg-primary"
                )}
              />
            </div>
          );
        })}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
