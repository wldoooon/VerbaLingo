"use client"

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Bookmark, CreditCard, Megaphone, User, Menu, X, LifeBuoy, ChevronRight, LogOut, Sun, Moon, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUsageStore } from '@/stores/usage-store';
import { AuthDialog } from '@/components/auth-dialog';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { useLogoutMutation } from '@/lib/authHooks';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { Carter_One } from 'next/font/google';
import { cn } from '@/lib/utils';

const carterOne = Carter_One({ weight: '400', subsets: ['latin'] });

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const authStatus = useAuthStore((s) => s.status);
  const authUser = useAuthStore((s) => s.user);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoutMutation = useLogoutMutation();
  const isAuthenticated = authStatus === 'authenticated';

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const usageMap = useUsageStore((s) => s.usage);
  const stats = usageMap?.['ai_chat'] || { current: 0, balance: 0, limit: -1, remaining: -1 };
  const maxSparks = authUser?.tier === "pro" ? 250000 : 30000;
  const currentBalance = stats.balance ?? 0;

  const displayLimit = maxSparks.toLocaleString();
  const displayRemaining = currentBalance.toLocaleString();
  const remainingSparksDisplay = (currentBalance / 1000).toFixed(2);

  // Don't show on search/watch pages (they have their own layout)
  const isSearchOrWatch = pathname?.startsWith('/search') || pathname?.startsWith('/watch');

  const navItems = [
    { icon: Compass, label: 'Home', href: '/', active: pathname === '/' },
    { icon: Bookmark, label: 'Saved', href: '/saved', active: pathname?.startsWith('/saved'), disabled: true },
    { icon: CreditCard, label: 'Pricing', href: '/pricing', active: pathname?.startsWith('/pricing') },
    { icon: Megaphone, label: 'Updates', href: '/changelog', active: pathname?.startsWith('/changelog') },
  ];

  const menuItems = [
    { icon: Compass, label: 'Discover', href: '/' },
    { icon: CreditCard, label: 'Pricing', href: '/pricing' },
    { icon: Megaphone, label: 'Changelog', href: '/changelog' },
    { icon: Bookmark, label: 'Saved', href: '/saved', disabled: true, badge: 'Soon' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar - only visible below xl */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Glass bar */}
        <div className="border-t border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (!item.disabled) router.push(item.href);
                  }}
                  disabled={item.disabled}
                  className={`
                    relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 cursor-pointer
                    ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                    ${item.active && !item.disabled
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {/* Active indicator dot */}
                  {item.active && !item.disabled && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -top-1 w-5 h-1 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${item.active && !item.disabled ? 'scale-110' : ''}`} />
                  <span className={`text-[10px] font-semibold tracking-tight ${item.active && !item.disabled ? 'text-primary' : ''}`}>
                    {item.label}
                  </span>
                  {item.disabled && (
                    <div className="absolute -top-1 -right-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Menu / Profile button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {authStatus === 'authenticated' && authUser?.oauth_avatar_url ? (
                <div className="w-5 h-5 rounded-full overflow-hidden border border-border">
                  <img src={authUser.oauth_avatar_url} alt="You" className="w-full h-full object-cover" />
                </div>
              ) : (
                <Menu className="w-5 h-5" />
              )}
              <span className="text-[10px] font-semibold tracking-tight">
                {authStatus === 'authenticated' ? 'Menu' : 'More'}
              </span>
            </button>
          </div>

          {/* Safe area for devices with home indicator */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </nav>

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col h-full overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-2">
                  <Image src="/main_logo.png" alt="PokiSpokey" width={40} height={40} className="shrink-0" />
                  <div className="flex items-start">
                    <h1 className={cn("text-xl font-black text-foreground tracking-tight leading-none", carterOne.className)}>
                      Poki<span className="text-primary">Spokey</span>
                    </h1>
                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-[14px] font-bold uppercase tracking-widest bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border-transparent rounded-full ml-1 -mt-1">
                      Beta
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* User card (authenticated only) */}
              {authStatus === 'authenticated' && (
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-muted/30">
                    <div className="w-11 h-11 rounded-full bg-primary overflow-hidden flex items-center justify-center shadow-sm">
                      {authUser?.oauth_avatar_url ? (
                        <img src={authUser.oauth_avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {authUser?.full_name || authUser?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                        {authUser?.tier || 'Free'} Plan
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <div className="flex-1 px-6 py-2 space-y-6">
                {/* Main Section */}
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] opacity-60 mb-3 px-1">
                    Navigate
                  </h3>
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.label}
                          href={item.disabled ? '#' : item.href}
                          onClick={(e) => {
                            if (item.disabled) {
                              e.preventDefault();
                              return;
                            }
                            setIsMenuOpen(false);
                          }}
                          className={`
                            flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200
                            ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                            ${isActive && !item.disabled
                              ? 'bg-muted text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="px-1.5 py-0 h-[18px] text-[9px] font-bold uppercase tracking-widest bg-muted text-foreground">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Support Section */}
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] opacity-60 mb-3 px-1">
                    Support
                  </h3>
                  <div className="space-y-1">
                    {/* Dark mode toggle */}
                    <button
                      onClick={() => setTheme(isDark ? 'light' : 'dark')}
                      className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer w-full"
                    >
                      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      <span className="text-sm font-medium flex-1 text-left">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                      <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </button>
                    <FeedbackDialog>
                      <div className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer w-full">
                        <LifeBuoy className="w-5 h-5" />
                        <span className="text-sm font-medium">Support</span>
                      </div>
                    </FeedbackDialog>
                  </div>
                </div>
              </div>

              {/* Bottom section */}
              <div className="px-6 py-6 mt-auto border-t border-border/40">
                {authStatus === 'guest' ? (
                  <div className="flex gap-3">
                    <AuthDialog defaultTab="login">
                      <button className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer">
                        Sign In
                      </button>
                    </AuthDialog>
                    <AuthDialog defaultTab="signup">
                      <button className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
                        Get Started
                      </button>
                    </AuthDialog>
                  </div>
                ) : (
                  <>
                    <div className="p-3.5 mb-4 rounded-[1.25rem] border border-slate-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/40 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
                            <Image src="/sparks.png" alt="Sparks" width={20} height={20} className="object-contain" />
                            Sparks
                          </span>
                        </div>
                        <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="shrink-0">
                          <span className="relative flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-full overflow-hidden group shadow-md transition-all hover:scale-105 hover:shadow-orange-500/25">
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 group-hover:from-orange-500 group-hover:via-pink-600 group-hover:to-purple-600 transition-all duration-300"></span>
                            <span className="relative flex items-center gap-1">
                              Upgrade
                              <Zap className="h-3 w-3 fill-current" />
                            </span>
                          </span>
                        </Link>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-400">Total Credits</span>
                          <span className="text-slate-900 dark:text-slate-100">{displayLimit}</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-400">Remaining</span>
                          <span className="text-slate-900 dark:text-slate-100">{displayRemaining}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200 dark:border-zinc-800/80 mt-1">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">Available Sparks</span>
                          <span className="text-orange-500 font-bold flex items-center gap-1.5">
                            {remainingSparksDisplay}
                            <Image src="/sparks.png" alt="Sparks icon" width={14} height={14} className="opacity-80" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        logoutMutation.mutate();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      {!isSearchOrWatch && <div className="xl:hidden h-16" />}
    </>
  );
}
