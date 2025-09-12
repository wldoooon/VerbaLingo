"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Globe, 
  Wifi, 
  Activity,
  TrendingUp,
  Database,
  Clock,
  Users,
  ChevronUp,
  Settings,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomStickyBarProps {
  className?: string;
}

export function BottomStickyBar({ className }: BottomStickyBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [liveUsers, setLiveUsers] = useState(1247);
  const [isAggregating, setIsAggregating] = useState(true);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const statusItems = [
    {
      id: "live",
      label: "Live",
      icon: Zap,
      info: `${liveUsers.toLocaleString()} learners online`
    },
    {
      id: "search",
      label: "Search Engine",
      icon: Database,
      info: "VerbaLingo search active"
    },
    {
      id: "ai",
      label: "AI Assistant",
      icon: Globe,
      info: "AI responses enabled"
    },
    {
      id: "sync",
      label: "Sync",
      icon: Wifi,
      info: "Learning progress synced"
    }
  ];

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-t border-border transition-all duration-300",
      isCollapsed ? "translate-y-10" : "translate-y-0",
      className
    )}>
      {/* Collapse/Expand Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 h-6 w-12 rounded-t-md bg-background/95 backdrop-blur border border-b-0 hover:bg-muted"
      >
        <ChevronUp className={cn(
          "h-3 w-3 transition-transform duration-200",
          isCollapsed ? "rotate-180" : ""
        )} />
      </Button>

      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Status indicators */}
          <div className="flex items-center gap-3">
            {statusItems.map((item) => {
              const IconComponent = item.icon;
              
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-muted/50 cursor-pointer transition-colors"
                  title={item.info}
                >
                  <div className="relative">
                    <IconComponent className="h-3 w-3 text-muted-foreground" />
                    {item.id === "live" && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  {item.id === "live" && (
                    <Badge variant="secondary" className="ml-1 text-xs h-4">
                      {liveUsers.toLocaleString()}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side - Simple status */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>VerbaLingo • Online</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}