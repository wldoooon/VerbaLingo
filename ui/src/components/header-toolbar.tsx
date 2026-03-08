"use client"

import React, { useState, useEffect, useCallback } from "react"

import { FeedbackDialog } from "@/components/feedback-dialog"

import { HeaderUserProfile } from "@/components/header-user-profile"

import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

import Image from "next/image"
import { useUsageStore } from "@/stores/usage-store"

import { Crown, Megaphone } from 'lucide-react'
import { ThemeToggleButton, useThemeTransition } from '@/components/ui/shadcn-io/theme-toggle-button'

import Link from "next/link"

import { useAuthStore } from "@/stores/auth-store"

import { useLogoutMutation } from "@/lib/authHooks"

import { AuthDialog } from "@/components/auth-dialog"

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"



export function HeaderToolbar({

  user,

}: {

  user: {

    name: string

    email: string

    avatar: string

  }

}) {

  const { theme, setTheme } = useTheme()
  const { startTransition } = useThemeTransition()

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    startTransition(() => {
      setTheme(newTheme);
    });
  }, [theme, setTheme, startTransition]);

  const [mounted, setMounted] = useState(false)

  const usageMap = useUsageStore((s) => s.usage)
  const stats = usageMap['ai_chat'] || { current: 0, balance: 0, limit: -1, remaining: -1 }
  const currentBalance = stats.balance ?? 0
  const remainingSparksDisplay = (currentBalance / 1000).toFixed(2)



  const status = useAuthStore((s) => s.status)

  const authUser = useAuthStore((s) => s.user)

  const logoutMutation = useLogoutMutation()



  const displayUser =

    status === "authenticated" && authUser

      ? {

        name: authUser.full_name || (authUser.email.split("@")[0] || "User").replace(/^./, (c) => c.toUpperCase()),

        email: authUser.email,

        avatar: authUser.oauth_avatar_url || "/avatars/user.jpg",

      }

      : user



  // Prevent hydration mismatch

  useEffect(() => {

    setMounted(true)

  }, [])



  // Prevent hydration mismatch

  useEffect(() => {

    setMounted(true)

  }, [])



  return (



    <div className="flex items-center gap-1 sm:gap-2">







      {/* Theme Toggle */}
      {mounted && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div>
              <ThemeToggleButton
                theme={theme as 'light' | 'dark'}
                onClick={handleThemeToggle}
                variant="circle"
                start="top-right"
                className="h-9 w-9"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle theme</TooltipContent>
        </Tooltip>
      )}

      {/* Changelog */}



      <Tooltip delayDuration={200}>



        <TooltipTrigger asChild>



          <Link href="/changelog" className="cursor-pointer">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 cursor-pointer">
              <Megaphone className="h-5 w-5" />
            </Button>
          </Link>



        </TooltipTrigger>



        <TooltipContent side="bottom">Changelog</TooltipContent>



      </Tooltip>







      {/* Feedback */}



      <Tooltip delayDuration={200}>



        <TooltipTrigger asChild>



          <div className="cursor-pointer">



            <FeedbackDialog />



          </div>



        </TooltipTrigger>



        <TooltipContent side="bottom">Send Feedback</TooltipContent>



      </Tooltip>







      {/* Sparks Display Badge */}
      {status === "authenticated" && authUser && mounted && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center cursor-pointer mr-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors">
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 tracking-tight">
                {remainingSparksDisplay}
                <Image src="/sparks.png" alt="Sparks icon" width={25} height={25} className="object-contain opacity-90" />
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">Available Sparks</TooltipContent>
        </Tooltip>
      )}







      <div className="ml-2">





        {status === "unknown" ? (
          /* Auth is still loading — show a neutral skeleton to prevent
             the flash of login/signup buttons for authenticated users */
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        ) : status === "authenticated" && authUser ? (
          <HeaderUserProfile
            user={displayUser}
            onLogout={() => logoutMutation.mutate()}
          />
        ) : (
          <div className="flex items-center gap-2">
            <AuthDialog defaultTab="login">
              <Button variant="outline" size="sm" className="rounded-full cursor-pointer">
                Log in
              </Button>
            </AuthDialog>
            <AuthDialog defaultTab="signup">
              <Button size="sm" className="rounded-full cursor-pointer">
                Sign up
              </Button>
            </AuthDialog>
          </div>
        )}

      </div>

    </div>

  )

}
