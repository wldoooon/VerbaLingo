"use client"

import React, { useState, useEffect } from 'react';
import { Compass, User, Bookmark, Settings, LogOut, Zap, ChevronLeft, ChevronRight, LayoutGrid, History, Star, Sparkles, Folder, ChevronDown, LifeBuoy, MessageSquare, PieChart, Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import FoxLogo from './FoxLogo';

// Enum for mapping routes to views
enum ViewState {
  LANDING = 'LANDING',
  PROFILE = 'PROFILE',
  SAVED = 'SAVED',
  PRICING = 'PRICING',
  UNKNOWN = 'UNKNOWN'
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [showCreditDetails, setShowCreditDetails] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Determine current view based on pathname
  const currentView = React.useMemo(() => {
    if (pathname === '/') return ViewState.LANDING;
    if (pathname?.startsWith('/profile')) return ViewState.PROFILE;
    if (pathname?.startsWith('/saved')) return ViewState.SAVED;
    if (pathname?.startsWith('/pricing')) return ViewState.PRICING;
    return ViewState.UNKNOWN;
  }, [pathname]);

  const onChangeView = (view: ViewState) => {
    switch (view) {
      case ViewState.LANDING:
        router.push('/');
        break;
      case ViewState.PROFILE:
        router.push('/profile');
        break;
      case ViewState.SAVED:
        router.push('/saved');
        break;
      case ViewState.PRICING:
        router.push('/pricing');
        break;
      default:
        break;
    }
  };


  // Mock usage data
  const usageData = {
    searching: { used: 12, total: 50 },
    ai: { used: 5, total: 20 },
    translation: { used: 2, total: 10 }
  };

  const totalUsed = usageData.searching.used + usageData.ai.used + usageData.translation.used;
  const totalLimit = usageData.searching.total + usageData.ai.total + usageData.translation.total;
  const totalPercentage = (totalUsed / totalLimit) * 100;

  const mainNav = [
    { icon: Compass, label: 'Discover', view: ViewState.LANDING },
    { icon: LayoutGrid, label: 'Categories', view: ViewState.LANDING, action: 'categories' },
  ];

  const libraryNav = [
    { icon: History, label: 'Recent', view: ViewState.PROFILE },
    { icon: Bookmark, label: 'Saved', view: ViewState.SAVED },
    { icon: Star, label: 'Favorites', view: ViewState.SAVED },
  ];

  const supportNav = [
    { icon: LifeBuoy, label: 'Support', view: ViewState.LANDING },
    { icon: MessageSquare, label: 'Feedback', view: ViewState.LANDING },
    { icon: Settings, label: 'Settings', view: ViewState.PROFILE },
  ];

  const bottomNav = [
    { icon: User, label: 'Profile', view: ViewState.PROFILE },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-border bg-transparent transition-[width] duration-300 ease-in-out relative z-50 select-none ${isCollapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
    >
      {/* 1. Logo Section */}
      <div className="h-24 flex items-center justify-center relative shrink-0 border-b border-border/60 px-3">
        <div
          className="flex items-center gap-3 cursor-pointer group w-full p-2 rounded-2xl hover:bg-muted/40 transition-all duration-300"
          onClick={() => onChangeView(ViewState.LANDING)}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center shrink-0 border border-primary/10 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="VerbaLingo" className="w-full h-full object-contain p-1" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col justify-center animate-fade-in">
              <h1 className="text-xl font-black text-foreground tracking-tight leading-none mb-0.5">
                VerbaLingo
              </h1>
              <span className="text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase">
                AI Learning
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">

        {/* Main Section */}
        <div className="space-y-0.5">
          {mainNav.map((item, idx) => (
            <NavItem
              key={idx}
              item={item}
              isActive={currentView === item.view && item.label === 'Discover'}
              isCollapsed={isCollapsed}
              onClick={() => onChangeView(item.view)}
            />
          ))}
        </div>

        {/* Library Section */}
        <div>
          {!isCollapsed ? (
            <>
              <button
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 group mb-1 ${isLibraryOpen ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
              >
                <div className="flex items-center gap-3 px-1">
                  <Folder className={`w-4 h-4 ${isLibraryOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-[13px] font-medium tracking-wide">Library</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isLibraryOpen ? 'rotate-0 text-muted-foreground' : '-rotate-90 text-muted-foreground'}`} />
              </button>

              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isLibraryOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="relative space-y-0.5">
                    {/* Vertical Tree Line */}
                    <div className="absolute left-[19px] top-0 bottom-3 w-[1px] bg-border"></div>

                    {libraryNav.map((item, idx) => {
                      const active = currentView === item.view && (
                        (item.label === 'Saved' && currentView === ViewState.SAVED) ||
                        (item.label === 'Recent' && currentView === ViewState.PROFILE)
                      );

                      return (
                        <button
                          key={idx}
                          onClick={() => onChangeView(item.view)}
                          className={`relative w-full flex items-center gap-3 p-2 rounded-lg pl-8 transition-all duration-200 group ${active ? 'bg-muted/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                            }`}
                        >
                          {/* Connector Dot */}
                          <div className="absolute left-[17px] top-1/2 -translate-y-1/2 w-1.5 h-[1px] bg-border"></div>

                          <span className={`text-[13px] font-medium transition-colors ${active ? 'text-foreground' : 'group-hover:text-foreground'}`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Collapsed Library Logic */
            <div className="flex flex-col gap-4 items-center mt-2">
              <button
                onClick={() => { setIsCollapsed(false); setIsLibraryOpen(true); }}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground bg-muted/30 rounded-xl transition-colors cursor-pointer group relative"
              >
                <Folder className="w-5 h-5" />
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Library
                </div>
              </button>
              <div className="w-[1px] h-8 bg-border"></div>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div>
          {!isCollapsed && (
            <h3 className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Support</h3>
          )}
          <div className="space-y-0.5">
            {supportNav.map((item, idx) => (
              <NavItem
                key={idx}
                item={item}
                isActive={false}
                isCollapsed={isCollapsed}
                onClick={() => { }}
              />
            ))}
          </div>
        </div>

        {/* Cat Image & Promo */}
        {!isCollapsed && (
          <div className="mt-6 mx-1 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            {/* Cat Image */}
            <div className="w-48 h-48 relative sm:w-52 sm:h-52 hover:scale-105 transition-transform duration-500 ease-out cursor-pointer -my-4">
              <img src="/cat_logo1.png" alt="Get Started" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>

            {/* Text & Action */}
            <div className="w-full px-2 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">First Step</h3>
                <p className="text-xs text-muted-foreground mt-1 px-2 leading-relaxed">
                  Start your journey with a quick interactive tutorial.
                </p>
              </div>

              <div className="w-full flex justify-center mt-2">
                <span className="text-blue-500 text-sm font-bold cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-2">
                  Get Started
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Bottom Credits & Actions */}
      <div className="p-3 bg-transparent">



        {/* Credits Trigger */}
        <div className="mb-2 relative">
          <button
            onClick={() => !isCollapsed && setShowCreditDetails(!showCreditDetails)}
            className={`w-full relative overflow-hidden rounded-xl transition-all duration-300 border ${showCreditDetails && !isCollapsed
              ? 'bg-muted/50 border-border shadow-lg'
              : 'bg-transparent border-transparent hover:bg-muted/30'
              } ${isCollapsed ? 'p-0 flex justify-center items-center h-10 w-full' : 'p-0'}`}
            title="Credit Usage"
          >
            {isCollapsed ? (
              <Zap className="w-5 h-5 text-muted-foreground" />
            ) : (
              /* Expanded Status Widget Style */
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-3 p-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">Free Plan</div>
                    <div className="text-[10px] text-muted-foreground font-medium truncate">{totalUsed} / {totalLimit} Credits</div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${showCreditDetails ? 'rotate-180' : ''}`} />
                </div>

                {/* Integrated Progress Line */}
                <div className="h-[2px] w-full bg-muted mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000"
                    style={{ width: `${totalPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </button>

          {/* Redesigned Popover - Matching WhatsNew Style */}
          {!isCollapsed && showCreditDetails && (
            <div className="absolute bottom-full left-0 w-full mb-3 bg-popover rounded-xl border border-border shadow-2xl overflow-hidden animate-fade-in-up origin-bottom z-50 ring-1 ring-black/5">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Cycle</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-medium text-muted-foreground">Resets 12d</span>
                </div>
              </div>

              {/* Body: Segmented Bars */}
              <div className="p-4 space-y-5">
                <SegmentedUsageBar label="Search Queries" used={usageData.searching.used} total={usageData.searching.total} color="bg-blue-500" icon={Compass} />
                <SegmentedUsageBar label="AI Companion" used={usageData.ai.used} total={usageData.ai.total} color="bg-purple-500" icon={Sparkles} />
                <SegmentedUsageBar label="Translation" used={usageData.translation.used} total={usageData.translation.total} color="bg-emerald-500" icon={Globe} />
              </div>

              {/* Footer: Gradient Action */}
              <div className="p-1">
                <button
                  onClick={() => onChangeView(ViewState.PRICING)}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group/btn border border-primary/20"
                >
                  <Star className="w-3.5 h-3.5 fill-primary-foreground/20 group-hover/btn:fill-primary-foreground/40 transition-colors" />
                  Unlock Unlimited
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Actions */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'gap-1'}`}>
          {bottomNav.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onChangeView(item.view)}
              className={`p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all ${isCollapsed ? '' : 'flex-1 flex items-center justify-center'}`}
              title={item.label}
            >
              <item.icon className="w-4 h-4" />
            </button>
          ))}
          <button className={`p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ${isCollapsed ? '' : 'flex-1 flex items-center justify-center'}`}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-popover border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all z-50 shadow-lg cursor-pointer group"
      >
        {isCollapsed ? <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
      </button>
    </aside>
  );
};

const SegmentedUsageBar = ({ label, used, total, color, icon: Icon }: any) => {
  const percentage = Math.min((used / total) * 100, 100);
  const segments = 8; // Number of blocks
  const filledSegments = Math.ceil((percentage / 100) * segments);

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-medium group-hover:text-foreground transition-colors">
          <Icon className={`w-3.5 h-3.5 ${color.replace('bg-', 'text-')}`} />
          {label}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono group-hover:text-foreground/80">{used}/{total}</div>
      </div>
      <div className="flex gap-1 h-1.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-500 ${i < filledSegments ? color : 'bg-muted'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

const NavItem = ({ item, isActive, isCollapsed, onClick }: any) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center w-full p-2.5 rounded-lg transition-all duration-200 ${isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      } ${isCollapsed ? 'justify-center' : ''}`}
  >
    <item.icon
      className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
      strokeWidth={2}
    />

    {!isCollapsed && (
      <span className="ml-3 text-[13px] font-medium tracking-wide">
        {item.label}
      </span>
    )}

    {isCollapsed && (
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
        {item.label}
      </div>
    )}
  </button>
);

export default Sidebar;
