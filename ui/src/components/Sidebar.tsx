"use client"

import React, { useState, useEffect } from 'react';
import { Compass, User, Bookmark, Settings, LogOut, ChevronLeft, ChevronRight, LayoutGrid, History, Folder, ChevronDown, LifeBuoy, Star } from 'lucide-react';
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
      <div className="h-24 flex items-center px-4 relative shrink-0 border-b border-border/60">
        <div
          className="flex items-center justify-center cursor-pointer group w-full py-2 transition-all duration-300"
          onClick={() => onChangeView(ViewState.LANDING)}
        >
          {!isCollapsed ? (
            <div className="flex flex-col items-center text-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h1 className="text-xl font-black text-foreground tracking-[0.1em] leading-none mb-1 font-mono">
                VERBALIN<span className="text-primary">GO</span>
              </h1>
              <span className="text-[9px] font-black text-muted-foreground/60 tracking-[0.2em] uppercase">
                Neural Context Engine
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-xl font-black text-primary font-mono">V</span>
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
                <span className="text-primary text-sm font-bold cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-2">
                  Get Started
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Bottom Credits & Actions */}
      <div className="p-3 bg-transparent">





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
