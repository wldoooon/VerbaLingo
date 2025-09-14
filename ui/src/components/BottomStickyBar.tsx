"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from 'next-themes';
import { ThemeToggleButton, useThemeTransition } from '@/components/ui/shadcn-io/theme-toggle-button';
import { 
  Zap, 
  Globe, 
  Wifi, 
  Activity,
  TrendingUp,
  Database,
  Clock,
  Users,
  Settings,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomStickyBarProps {
  className?: string;
}

export function BottomStickyBar({ className }: BottomStickyBarProps) {
  const [liveUsers, setLiveUsers] = useState(1247);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { open, isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { startTransition } = useThemeTransition();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for very small screens
  useEffect(() => {
    const checkScreenSize = () => {
      setIsVerySmallScreen(window.innerWidth < 480);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle theme toggle with animation
  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    startTransition(() => {
      setTheme(newTheme);
    });
  }, [theme, setTheme, startTransition]);

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
      "fixed bottom-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-t border-border transition-all duration-200",
      // Adjust position based on sidebar state and device
      isMobile 
        ? "left-0 right-0" // Full width on mobile
        : open 
          ? "left-[var(--sidebar-width)]" // Sidebar open on desktop
          : "left-[var(--sidebar-width-icon)]", // Sidebar collapsed on desktop
      !isMobile && "right-0", // Only set right-0 on desktop
      className
    )}>
      <div className="px-3 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Status indicators */}
          <div className="flex items-center gap-1 sm:gap-3">
            {statusItems.map((item, index) => {
              const IconComponent = item.icon;
              
              // Hide some items on very small screens (only show first 2)
              const shouldHideOnSmall = index > 1 && isVerySmallScreen;
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-1 rounded-full hover:bg-muted/50 cursor-pointer transition-colors",
                    shouldHideOnSmall && "hidden"
                  )}
                  title={item.info}
                >
                  <div className="relative">
                    <IconComponent className="h-3 w-3 text-muted-foreground" />
                    {item.id === "live" && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                    {item.label}
                  </span>
                  {item.id === "live" && (
                    <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-xs h-4 px-1 sm:px-2">
                      <span className="sm:hidden">{Math.floor(liveUsers/1000)}k</span>
                      <span className="hidden sm:inline">{liveUsers.toLocaleString()}</span>
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side - Theme toggle and status */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
            {/* Theme Toggle with Circle Animation */}
            {mounted && (
              <ThemeToggleButton 
                theme={theme as 'light' | 'dark'}
                onClick={handleThemeToggle}
                variant="circle"
                start="bottom-right"
                className="hidden sm:flex h-8 w-8"
              />
            )}
            
            {/* Status text and indicator */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">VerbaLingo • Online</span>
              <span className="sm:hidden">Online</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}