"use client"

import { useState } from "react"
import { AlertCircle, X, Bug } from "lucide-react"
import { cn } from "@/lib/utils"

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative w-full bg-orange-500 text-white py-2 px-4 shadow-sm z-[60] animate-in slide-in-from-top duration-500 border-b border-orange-600/20">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Bug className="w-3.5 h-3.5 animate-pulse" />
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] leading-none">
            VerbaLingo Beta v3.0
          </p>
        </div>
        
        <div className="h-3 w-px bg-white/30 hidden sm:block" />
        
        <p className="text-[10px] md:text-xs font-bold hidden sm:block opacity-90 tracking-tight">
          System is under active development. Report glitches via feedback.
        </p>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          aria-label="Close banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
