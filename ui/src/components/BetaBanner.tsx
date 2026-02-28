"use client"

import { useState, useEffect, useRef } from "react"

const BANNER_VERSION = "beta-3.0"
const STORAGE_KEY = `Pokispokey-banner-dismissed-${BANNER_VERSION}`

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    // Check localStorage only on mount (avoids hydration mismatch)
    if (!mounted.current) {
      mounted.current = true
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) {
        setIsVisible(true)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    // Wait for exit animation to complete before removing from DOM
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem(STORAGE_KEY, "true")
    }, 400)
  }

  if (!isVisible) return null

  return (
    <div
      className={`
        relative w-full z-[60] overflow-hidden
        transition-all duration-400 ease-out
        ${isExiting ? "max-h-0 opacity-0" : "max-h-16 opacity-100"}
      `}
    >
      {/* Background: Subtle gradient bar */}
      <div className="
        relative w-full py-2.5 px-6
        bg-gradient-to-r from-foreground/[0.04] via-primary/[0.08] to-foreground/[0.04]
        border-b border-border/50
        backdrop-blur-sm
      ">
        {/* Animated shimmer line across bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-border-flow" />
        </div>

        {/* Content */}
        <div className="container mx-auto flex items-center justify-center gap-3">
          {/* Version badge — typographic, no icon */}
          <span className="
            inline-flex items-center
            px-2.5 py-0.5
            text-[9px] font-black uppercase tracking-[0.25em]
            bg-primary/10 text-primary
            rounded-full
            border border-primary/15
            shrink-0
          ">
            Beta 3.0
          </span>

          {/* Separator — thin vertical line */}
          <span className="h-3.5 w-px bg-border hidden sm:block shrink-0" />

          {/* Message */}
          <p className="
            text-[11px] font-semibold text-muted-foreground
            tracking-wide
            hidden sm:block
          ">
            You're using an early build — some features may shift.
            <span className="text-foreground/70 font-bold ml-1">Feedback welcome.</span>
          </p>

          {/* Mobile-only compact message */}
          <p className="
            text-[10px] font-semibold text-muted-foreground
            tracking-wide
            block sm:hidden
          ">
            Early build — things may shift.
          </p>

          {/* Dismiss — text "×", not an icon */}
          <button
            onClick={handleDismiss}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              w-5 h-5 flex items-center justify-center
              text-muted-foreground/50 hover:text-foreground
              text-sm font-light
              rounded-full
              hover:bg-foreground/5
              transition-all duration-200
              cursor-pointer
              select-none
            "
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

