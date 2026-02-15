"use client"

import React, { useState, useEffect, useCallback } from "react"

import { FeedbackDialog } from "@/components/feedback-dialog"

import { HeaderUserProfile } from "@/components/header-user-profile"

import { useTheme } from 'next-themes'

import { ThemeToggleButton, useThemeTransition } from '@/components/ui/shadcn-io/theme-toggle-button'

import { Button } from '@/components/ui/button'

import { Crown, FileClock } from 'lucide-react'

import Link from "next/link"

import { useAuthStore } from "@/stores/auth-store"

import { useLogoutMutation } from "@/lib/authHooks"

import { AuthDialog } from "@/components/auth-dialog"

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/animate-ui/components/radix/tooltip"



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

  const [mounted, setMounted] = useState(false)



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



  // Handle theme toggle with animation

  const handleThemeToggle = useCallback(() => {

    const newTheme = theme === 'dark' ? 'light' : 'dark'



    startTransition(() => {

      setTheme(newTheme)

    })

  }, [theme, setTheme, startTransition])



  return (



    <div className="flex items-center gap-1 sm:gap-2">







      {/* Changelog */}



      <Tooltip delayDuration={200}>



        <TooltipTrigger asChild>



          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 cursor-pointer">



            <FileClock className="h-5 w-5" />



          </Button>



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







      {/* Theme Toggle */}



      {mounted && (



        <Tooltip delayDuration={200}>



          <TooltipTrigger asChild>



            <div className="flex items-center justify-center cursor-pointer">



              <ThemeToggleButton



                theme={theme as 'light' | 'dark'}



                onClick={handleThemeToggle}



                variant="circle-blur"



                start="top-right"



                className="h-9 w-9"



              />



            </div>



          </TooltipTrigger>



          <TooltipContent side="bottom">



            Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode



          </TooltipContent>



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
              <Button variant="outline" size="sm" className="rounded-full">
                Log in
              </Button>
            </AuthDialog>
            <AuthDialog defaultTab="signup">
              <Button size="sm" className="rounded-full">
                Sign up
              </Button>
            </AuthDialog>
          </div>
        )}

      </div>

    </div>

  )

}
