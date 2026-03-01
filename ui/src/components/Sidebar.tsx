"use client"

import React, { useState, useEffect } from 'react';
import { Compass, User, Bookmark, Settings, LogOut, ChevronLeft, ChevronRight, LayoutGrid, History, Folder, ChevronDown, LifeBuoy, Star, ChevronsUpDown, Plus, Sparkles, CreditCard, Bell, BadgeCheck, Megaphone } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FoxLogo from './FoxLogo';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth-store';
import { useLogoutMutation } from '@/lib/authHooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AuthDialog } from "@/components/auth-dialog";
import { HeaderToolbar } from "@/components/header-toolbar";
import { FeedbackDialog } from "@/components/feedback-dialog";

// New Sidebar Primitives (Localized from the new sidebar.tsx)
const SidebarMenu = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <ul className={`flex w-full min-w-0 flex-col gap-1 ${className}`}>{children}</ul>
);

const SidebarMenuItem = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <li className={`group/menu-item relative ${className}`}>{children}</li>
);

const SidebarMenuButton = ({ children, className, isActive, size = "default", ...props }: any) => (
  <button
    className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-all hover:bg-muted/50 active:bg-muted cursor-pointer ${isActive ? 'bg-muted/50 font-medium' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Enum for mapping routes to views
enum ViewState {
  LANDING = 'LANDING',
  PROFILE = 'PROFILE',
  SAVED = 'SAVED',
  PRICING = 'PRICING',
  CHANGELOG = 'CHANGELOG',
  UNKNOWN = 'UNKNOWN'
}

interface SidebarProps {
  isMobile?: boolean;
  user?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(true);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const authUser = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const logoutMutation = useLogoutMutation();

  // Mock data for Team Switcher
  const teams = [
    { name: "Pokispokey", logo: Compass, plan: "Enterprise" },
    { name: "Personal", logo: User, plan: "Free" },
  ];
  const [activeTeam, setActiveTeam] = useState(teams[0]);

  // Determine current view based on pathname
  const currentView = React.useMemo(() => {
    if (pathname === '/') return ViewState.LANDING;
    if (pathname?.startsWith('/profile')) return ViewState.PROFILE;
    if (pathname?.startsWith('/saved')) return ViewState.SAVED;
    if (pathname?.startsWith('/pricing')) return ViewState.PRICING;
    if (pathname?.startsWith('/changelog')) return ViewState.CHANGELOG;
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
      case ViewState.CHANGELOG:
        router.push('/changelog');
        break;
      default:
        break;
    }
  };

  const discoverChildren = [
    { label: 'Features', href: '/#features' },
    { label: 'FAQ', href: '/#faq' },
  ];

  const libraryNav = [
    { icon: History, label: 'Recent', view: ViewState.PROFILE, href: '/profile' },
    { icon: Bookmark, label: 'Saved', view: ViewState.SAVED, href: '/saved' },
    { icon: Star, label: 'Favorites', view: ViewState.SAVED, href: '/saved' },
  ];

  const supportNav = [
    { icon: Megaphone, label: 'Changelog', view: ViewState.CHANGELOG, href: '/changelog' },
    { icon: CreditCard, label: 'Pricing', view: ViewState.PRICING, href: '/pricing' },
    { icon: LifeBuoy, label: 'Support', view: ViewState.LANDING, href: '/support' },
    // Settings only makes sense for logged-in users
    ...(authStatus === 'authenticated'
      ? [{ icon: Settings, label: 'Settings', view: ViewState.PROFILE, href: '/profile' }]
      : []),
  ];

  return (
    <aside
      className={
        isMobile
          ? "flex flex-col h-full w-full bg-background relative z-50 select-none overflow-y-auto"
          : `hidden xl:flex flex-col h-screen sticky top-0 border-r border-border bg-transparent transition-[width] duration-300 ease-in-out z-50 select-none ${isCollapsed ? 'w-[80px]' : 'w-[300px]'}`
      }
    >
      {/* 0. Brand Header */}
      <div className={`pt-5 pb-0 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6 gap-0.2'}`}>
        <Image src="/main_logo.png" alt="PokiSpokey Logo" width={isCollapsed ? 44 : 52} height={isCollapsed ? 44 : 52} className="shrink-0" />
        {!isCollapsed && (
          <div className="flex items-start">
            <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
              Poki<span className="text-primary">Spokey</span>
            </h1>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-[15px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20 rounded-full flex items-center justify-center leading-none ml-1 -mt-1.5">
              Beta
            </Badge>
          </div>
        )}
      </div>

      {/* 1. Top Section: User Identity Badge */}
      {authStatus === 'authenticated' && (
        <div className="p-4 border-b border-border/60">
          <div
            className="h-14 flex items-center w-full border border-zinc-950/10 dark:border-zinc-50/10 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-2 transition-all duration-200"
          >
            <div className="flex aspect-square h-10 w-10 items-center justify-center rounded-full bg-primary overflow-hidden shadow-sm">
              {authUser?.oauth_avatar_url ? (
                <img src={authUser.oauth_avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="size-5 text-primary-foreground" />
              )}
            </div>
            {!isCollapsed && (
              <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                <span className="truncate font-black text-sm tracking-tight text-foreground">
                  {authUser?.full_name || (authUser?.email?.split('@')[0] || "User")}
                </span>
                <span className="truncate text-[10px] font-bold uppercase tracking-widest text-orange-500">
                  {authUser?.tier || "Free"} Plan
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">

        {/* Main Section */}
        <div className="space-y-1.5 mb-6">
          {!isCollapsed ? (
            <>
              <button
                onClick={() => {
                  if (pathname !== '/') {
                    router.push('/');
                  }
                  setIsDiscoverOpen(!isDiscoverOpen);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group mb-1 cursor-pointer ${pathname === '/' ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
              >
                <div className="flex items-center gap-4 px-1">
                  <Compass className={`w-6 h-6 transition-colors ${pathname === '/' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <span className="text-base tracking-tight">Discover</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDiscoverOpen ? 'rotate-0 text-muted-foreground' : '-rotate-90 text-muted-foreground'}`} />
              </button>

              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isDiscoverOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="relative space-y-1 mt-1">
                    {/* Vertical Tree Line */}
                    <div className="absolute left-[26px] top-0 bottom-4 w-[1.5px] bg-border/60"></div>

                    {discoverChildren.map((item, idx) => {
                      return (
                        <Link
                          href={item.href}
                          key={idx}
                          className="relative w-full flex items-center gap-4 p-2.5 rounded-xl pl-12 transition-all duration-200 group cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        >
                          {/* Connector Dot */}
                          <div className="absolute left-[24px] top-1/2 -translate-y-1/2 w-2 h-[1.5px] bg-border/60"></div>

                          <span className="text-sm font-medium transition-colors group-hover:text-foreground">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Collapsed Discover Logic */
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => {
                  setIsCollapsed(false);
                  setIsDiscoverOpen(true);
                  if (pathname !== '/') router.push('/');
                }}
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors cursor-pointer group relative ${pathname === '/' ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              >
                <Compass className="w-6 h-6" />
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Discover
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Library Section */}
        <div>
          {!isCollapsed ? (
            <>
              <button
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group mb-1 cursor-pointer ${isLibraryOpen ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
              >
                <div className="flex items-center gap-4 px-1">
                  <Folder className={`w-5 h-5 ${isLibraryOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium tracking-wide">Library</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLibraryOpen ? 'rotate-0 text-muted-foreground' : '-rotate-90 text-muted-foreground'}`} />
              </button>

              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isLibraryOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="relative space-y-1 mt-1">
                    {/* Vertical Tree Line */}
                    <div className="absolute left-[23px] top-0 bottom-4 w-[1.5px] bg-border/60"></div>

                    {libraryNav.map((item, idx) => {
                      const active = currentView === item.view && (
                        (item.label === 'Saved' && currentView === ViewState.SAVED) ||
                        (item.label === 'Recent' && currentView === ViewState.PROFILE)
                      );

                      return (
                        <button
                          key={idx}
                          onClick={() => onChangeView(item.view)}
                          className={`relative w-full flex items-center gap-4 p-2.5 rounded-xl pl-10 transition-all duration-200 group cursor-pointer ${active ? 'bg-primary/5 text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                            }`}
                        >
                          {/* Connector Dot */}
                          <div className="absolute left-[21px] top-1/2 -translate-y-1/2 w-2 h-[1.5px] bg-border/60"></div>

                          <span className={`text-sm font-medium transition-colors ${active ? 'text-primary' : 'group-hover:text-foreground'}`}>
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
                className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground bg-muted/30 rounded-xl transition-colors cursor-pointer group relative"
              >
                <Folder className="w-6 h-6" />
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Library
                </div>
              </button>
              <div className="w-[1px] h-10 bg-border"></div>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div>
          {!isCollapsed && (
            <h3 className="px-4 mb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Support</h3>
          )}
          <div className="space-y-1.5">
            {supportNav.map((item, idx) => {
              if (item.label === 'Support') {
                return (
                  <FeedbackDialog key={idx}>
                    <div className="w-full cursor-pointer">
                      <NavItem
                        item={{ ...item, href: undefined }}
                        isActive={false}
                        isCollapsed={isCollapsed}
                        onClick={() => { }}
                      />
                    </div>
                  </FeedbackDialog>
                )
              }
              return (
                <NavItem
                  key={idx}
                  item={item}
                  isActive={currentView === item.view}
                  isCollapsed={isCollapsed}
                  onClick={() => onChangeView(item.view)}
                />
              )
            })}
          </div>
        </div>

        {/* Cat Image & Promo - ONLY show for guests */}
        {!isCollapsed && authStatus === 'guest' && (
          <div className="mt-6 mx-1 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            {/* Cat Image */}
            <div className="w-48 h-48 relative sm:w-52 sm:h-52 hover:scale-105 transition-transform duration-500 ease-out cursor-pointer -my-4">
              <img
                src={mounted && resolvedTheme === 'dark' ? "/sleeping_cat2.png" : "/cat_logo1.png"}
                alt="Get Started"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
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
                <AuthDialog defaultTab="signup">
                  <span className="text-primary text-sm font-bold cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-2">
                    Get Started
                  </span>
                </AuthDialog>
              </div>
            </div>
          </div>
        )}

      </div>

      {isMobile && user && (
        <div className="mt-auto p-4 border-t border-border/60 flex justify-center w-full">
          <HeaderToolbar user={user} />
        </div>
      )}

      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-popover border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all z-50 shadow-lg cursor-pointer group"
      >
        {isCollapsed ? <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
      </button>
    </aside>
  );
};



const NavItem = ({ item, isActive, isCollapsed, onClick }: any) => {
  const content = (
    <>
      <item.icon
        className={`w-6 h-6 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
      />

      {!isCollapsed && (
        <span className="ml-4 text-base font-medium tracking-tight">
          {item.label}
        </span>
      )}

      {isCollapsed && (
        <div className="absolute left-full ml-4 px-4 py-2 bg-popover border border-border text-popover-foreground text-sm font-medium rounded-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
          {item.label}
        </div>
      )}
    </>
  );

  const className = `group relative flex items-center w-full p-3.5 rounded-xl transition-all duration-200 cursor-pointer ${isActive
    ? 'bg-muted text-foreground font-medium'
    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    } ${isCollapsed ? 'justify-center' : ''}`;

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export default Sidebar;

