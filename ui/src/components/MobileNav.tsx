"use client"

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Bookmark, CreditCard, Megaphone, User, Menu, X, Settings, LifeBuoy, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { AuthDialog } from '@/components/auth-dialog';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const authStatus = useAuthStore((s) => s.status);
  const authUser = useAuthStore((s) => s.user);
  const { resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const supportItems = [
    ...(authStatus === 'authenticated'
      ? [{ icon: Settings, label: 'Settings', href: '/profile' }]
      : []),
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
                    <h1 className="text-xl font-black text-foreground tracking-tight leading-none">
                      Poki<span className="text-primary">Spokey</span>
                    </h1>
                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-[14px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20 rounded-full ml-1 -mt-1">
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
                    <FeedbackDialog>
                      <div className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer w-full">
                        <LifeBuoy className="w-5 h-5" />
                        <span className="text-sm font-medium">Support</span>
                      </div>
                    </FeedbackDialog>
                    {supportItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname?.startsWith(item.href);
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`
                            flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 cursor-pointer
                            ${isActive
                              ? 'bg-muted text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
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
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Account Settings</span>
                  </Link>
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
