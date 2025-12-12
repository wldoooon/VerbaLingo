"use client"

import React, { useState } from 'react';
import { Compass, User, Bookmark, Settings, LogOut, Disc, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: Compass, label: 'Discover', href: '/' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Bookmark, label: 'Saved Clips', href: '/saved' },
  ];

  // Mock credit usage data
  const credits = {
    used: 12500,
    total: 50000,
  };
  const percentUsed = (credits.used / credits.total) * 100;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname?.startsWith('/watch');
    }
    return pathname === href;
  };

  return (
    <div
      className={cn(
        "hidden md:flex flex-col bg-transparent border-r border-border h-screen sticky top-0 font-sans transition-all duration-300 ease-in-out",
        isCollapsed ? 'w-24' : 'w-72'
      )}
    >
      {/* Header */}
      <div className={cn(
        "p-6 flex items-center border-b border-border transition-all duration-300",
        isCollapsed ? 'flex-col gap-4 justify-center px-3' : 'justify-between'
      )}>
        <div className={cn("flex items-center", isCollapsed ? 'justify-center' : 'space-x-3')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 shrink-0">
            <Disc className="text-primary-foreground w-6 h-6" />
          </div>
          {!isCollapsed && (
            <span className="text-2xl font-bold text-foreground tracking-tight whitespace-nowrap overflow-hidden">
              VerbaLingo
            </span>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center w-full p-4 rounded-xl transition-all duration-200 group",
              isActive(item.href)
                ? 'bg-primary/10 text-foreground font-semibold shadow-sm border border-primary/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium',
              isCollapsed ? 'justify-center' : 'gap-4'
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className={cn(
              "w-6 h-6 shrink-0 transition-colors",
              isActive(item.href)
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-foreground'
            )} />
            {!isCollapsed && <span className="text-base whitespace-nowrap overflow-hidden">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Credit Usage Section */}
      <div className="px-5 pb-3">
        {!isCollapsed ? (
          <div className="p-5 bg-muted/50 border border-border rounded-2xl relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary fill-primary" />
                  Credits
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {Math.round(percentUsed)}%
                </span>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5 mb-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-muted-foreground to-primary rounded-full transition-all duration-500"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground font-medium mb-4">
                <span>{credits.used.toLocaleString()} used</span>
                <span>{credits.total.toLocaleString()} total</span>
              </div>

              <Link
                href="/pricing"
                className="w-full py-3 bg-primary hover:bg-primary/90 rounded-xl text-sm font-bold text-primary-foreground shadow-sm transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/10"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/pricing"
            className="w-full aspect-square bg-muted/50 border border-border rounded-xl flex items-center justify-center hover:bg-muted hover:border-primary/20 transition-all group relative"
            title="Credits & Pricing"
          >
            <Zap className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:fill-primary transition-colors" />
            <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-destructive"></div>
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 pt-3 border-t border-border">
        <button
          className={cn(
            "flex items-center w-full p-4 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors group",
            isCollapsed ? 'justify-center' : 'gap-4'
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-6 h-6 text-muted-foreground group-hover:text-foreground shrink-0" />
          {!isCollapsed && <span className="font-medium text-base whitespace-nowrap overflow-hidden">Settings</span>}
        </button>
        <button
          className={cn(
            "flex items-center w-full p-4 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors mt-2 group",
            isCollapsed ? 'justify-center' : 'gap-4'
          )}
          title={isCollapsed ? "Log Out" : undefined}
        >
          <LogOut className="w-6 h-6 text-muted-foreground group-hover:text-destructive shrink-0" />
          {!isCollapsed && <span className="font-medium text-base whitespace-nowrap overflow-hidden">Log Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
