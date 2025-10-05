"use client"

import React, { useState, useEffect, useCallback } from "react"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { HeaderUserProfile } from "@/components/header-user-profile"
import { useTheme } from 'next-themes'
import { ThemeToggleButton, useThemeTransition } from '@/components/ui/shadcn-io/theme-toggle-button'

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
          variant="circle"
          start="bottom-right"
          className="h-8 w-8"
        />
      )}
      <HeaderUserProfile user={user} />
    </div>
  )
}