"use client"

import React, { useState, useEffect, useCallback } from "react"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { HeaderUserProfile } from "@/components/header-user-profile"
import { useTheme } from 'next-themes'
import { ThemeToggleButton, useThemeTransition } from '@/components/ui/shadcn-io/theme-toggle-button'
import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'
import Link from "next/link"
import { useAuthStore } from "@/stores/authStore"
import { useLogoutMutation } from "@/lib/authHooks"
import { AuthDialog } from "@/components/auth-dialog"

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
        name: (authUser.email.split("@")[0] || "User").replace(/^./, (c) => c.toUpperCase()),
        email: authUser.email,
        avatar: "/avatars/user.jpg",
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
    <div className="flex items-center gap-3">
      <FeedbackDialog />
      {mounted && (
        <ThemeToggleButton
          theme={theme as 'light' | 'dark'}
          onClick={handleThemeToggle}
          variant="circle-blur"
          start="top-right"
          className="h-8 w-8"
        />
      )}
      {status === "authenticated" && authUser ? (
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
  )
}