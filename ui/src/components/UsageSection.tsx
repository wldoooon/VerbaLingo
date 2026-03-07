"use client";

import * as React from "react";
import { useUsageStore } from "@/stores/usage-store";
import { useAuthStore } from "@/stores/auth-store";
import { Progress } from "@/components/ui/progress";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function UsageSection() {
  const usage = useUsageStore((state) => state.usage);
  const fullUser = useAuthStore((s) => s.user);

  if (!usage || Object.keys(usage).length === 0) {
    return null;
  }

  const maxSparks = fullUser?.tier === "pro" ? 250000 : 30000;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm">Usage</SidebarGroupLabel>
      <SidebarGroupContent className="px-3 py-2 space-y-4">
        {Object.entries(usage).map(([feature, stats]) => {
          let current = stats.current;
          let limit = stats.limit;
          let percentage = 0;
          let displayText = "";
          let label = feature.replace("_", " ");

          if (feature === "ai_chat") {
            const balance = stats.balance ?? 0;
            const used = Math.max(0, maxSparks - balance);
            percentage = maxSparks > 0 ? (used / maxSparks) * 100 : 0;
            displayText = `${balance.toLocaleString()} Sparks`;
            label = "AI Sparks";
          } else {
            if (limit === -1) return null; // Skip unlimited
            percentage = (current / limit) * 100;
            displayText = `${current} / ${limit}`;
          }

          const isWarning = percentage > 70;
          const isCritical = percentage > 90;

          return (
            <div key={feature} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="capitalize">{label}</span>
                <span>
                  {displayText}
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
