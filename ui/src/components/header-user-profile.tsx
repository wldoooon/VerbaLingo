"use client"

import {

  BadgeCheck,

  Bell,

  CreditCard,

  LogOut,

  Sparkles,



  Zap,

  Settings,

  ShieldCheck,

  BookText,

  TrendingUp,

  CircleDashed,

  Moon,

  Sun,

  Search

} from "lucide-react"

import Image from "next/image"

import { useTheme } from "next-themes"

import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher"

import { useUsageStore } from "@/stores/usage-store"
import { useAuthStore } from "@/stores/auth-store"

import { cn } from "@/lib/utils"

import Link from "next/link"



import {

  Avatar,

  AvatarFallback,

  AvatarImage,

} from "@/components/ui/avatar"

import {

  DropdownMenu,

  DropdownMenuContent,

  DropdownMenuGroup,

  DropdownMenuItem,

  DropdownMenuLabel,

  DropdownMenuSeparator,

  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"

import { Progress } from "@/components/ui/progress"



export function HeaderUserProfile({

  user,

  onLogout,

}: {

  user: {

    name: string

    email: string

    avatar: string

  }

  onLogout?: () => void

}) {

  const { theme, setTheme } = useTheme()

  const usageMap = useUsageStore((s) => s.usage)



  const fullUser = useAuthStore((s) => s.user)

  // ── AI Credits stats ──
  const stats = usageMap['ai_chat'] || { current: 0, balance: 0, limit: -1, remaining: -1 }

  // ── Search stats ──
  const searchStats = usageMap['search'] || { current: 0, limit: 250, remaining: 250 }

  const TIER_SPARKS: Record<string, number> = {
    free:    50_000,
    basic:   800_000,
    pro:     5_000_000,
    premium: 15_000_000,
    max:     -1, // unlimited
  }
  const tier = fullUser?.tier ?? "free"
  const maxSparks = TIER_SPARKS[tier] ?? 50_000
  const isUnlimited = maxSparks === -1

  const currentBalance = stats.balance ?? 0
  const usedSparks = isUnlimited ? 0 : Math.max(0, maxSparks - currentBalance)

  // ── Combined Ring: Weighted Average (30% search + 70% AI) + Power Curve (N=2) ──
  // This makes the ring feel generous at low usage and only fills up near the limit
  const searchRaw = searchStats.limit > 0 ? Math.min(1, searchStats.current / searchStats.limit) : 0
  const aiRaw = isUnlimited ? 0 : (maxSparks > 0 ? Math.min(1, usedSparks / maxSparks) : 0)

  // Weighted average: AI costs real money so it weighs more
  const w1 = isUnlimited ? 1 : 0.3  // search weight (if AI unlimited, search takes full weight)
  const w2 = isUnlimited ? 0 : 0.7  // AI weight
  const combined = (w1 * searchRaw) + (w2 * aiRaw)

  // Power curve (N=2): squashes low usage to look even lower
  const percentageUsed = Math.max(0, Math.min(100, Math.pow(combined, 2) * 100))

  const circumference = 2 * Math.PI * 18 // r=18
  const offset = circumference - (percentageUsed / 100) * circumference

  // Values for display
  const displayLimit = isUnlimited ? "∞" : maxSparks.toLocaleString()
  const displayRemaining = currentBalance.toLocaleString()

  // Search display values
  const searchCurrent = searchStats.current
  const searchLimit = searchStats.limit
  const searchPercentUsed = searchLimit > 0 ? Math.min(100, (searchCurrent / searchLimit) * 100) : 0

  // Calculate Sparks (1 Spark = 1000 credits)
  const remainingSparksDisplay = (currentBalance / 1000).toFixed(2)









  return (





    <DropdownMenu>

      <DropdownMenuTrigger asChild>

        <button className="relative flex items-center justify-center h-10 w-10 rounded-full hover:scale-105 transition-all duration-300 focus:outline-none cursor-pointer group">

          {/* Progress Ring (Background Track) */}

          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">

            <circle

              cx="20" cy="20" r="18"

              fill="none"

              stroke="currentColor"

              strokeWidth="2.5"

              className="text-slate-200 dark:text-slate-800"

            />

            {/* Active Progress (Used) */}

            <circle

              cx="20" cy="20" r="18"

              fill="none"

              stroke="currentColor"

              strokeWidth="2.5"

              strokeDasharray={circumference}

              strokeDashoffset={offset}

              strokeLinecap="round"

              className="text-orange-500 transition-all duration-1000 ease-in-out"

              style={{ filter: "drop-shadow(0 0 1px rgba(249, 115, 22, 0.4))" }}

            />

          </svg>



          <div className="relative h-8 w-8 flex items-center justify-center overflow-hidden rounded-full">

            {/* Avatar - Fades on hover */}

            <Avatar className="h-full w-full transition-all duration-300 group-hover:opacity-10 group-hover:blur-[2px]">

              <AvatarImage src={user.avatar} alt={user.name} />

              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>

            </Avatar>



            {/* Percentage Number - Appears on hover */}



            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-900 dark:text-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100 tabular-nums">



              {Math.round(percentageUsed)}%



            </span>





          </div>



        </button>

      </DropdownMenuTrigger>



      <DropdownMenuContent
        className="w-72 rounded-[1.5rem] border border-border/50 bg-white dark:bg-zinc-900 p-2 shadow-2xl"
        align="end"
        sideOffset={12}
      >
        {/* User Info - At Top */}
        <div className="px-2.5 py-2 mb-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                {user.name}
              </p>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase shrink-0">
                {fullUser?.tier || "free"}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-none truncate overflow-hidden">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 mx-2 bg-slate-100 dark:bg-zinc-800/50" />

        {/* Balance Card - Under user info */}
        <div className="p-3.5 rounded-[1.25rem] border border-slate-200 dark:border-zinc-700/50 my-2 bg-white dark:bg-zinc-800/40 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
                Balance
              </span>
            </div>
            <Link href="/pricing" className="shrink-0">
              <span className="relative flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-full overflow-hidden group shadow-md transition-all hover:scale-105 hover:shadow-orange-500/25">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 group-hover:from-orange-500 group-hover:via-pink-600 group-hover:to-purple-600 transition-all duration-300"></span>
                <span className="relative flex items-center gap-1">
                  Upgrade
                </span>
              </span>
            </Link>
          </div>


          <DropdownMenuSeparator className="my-1 mx-2 bg-slate-100 dark:bg-zinc-800/50" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-400 font-medium">Total Credits</span>
              <span className="text-slate-900 dark:text-slate-100">{displayLimit}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-400 font-medium">Remaining</span>
              <span className="text-slate-900 dark:text-slate-100">{displayRemaining}</span>
            </div>
          </div>

          <DropdownMenuSeparator className="my-2 mx-0 bg-slate-100 dark:bg-zinc-800/50" />

          {/* Search Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-400 font-medium flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Searches
              </span>
              <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {searchCurrent}
                <span className="text-slate-400 font-normal"> / {searchLimit === -1 ? "∞" : searchLimit}</span>
              </span>
            </div>
            {searchLimit > 0 && (
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-700/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, searchPercentUsed)}%`,
                    background: searchPercentUsed > 80
                      ? 'linear-gradient(90deg, #f97316, #ef4444)'
                      : searchPercentUsed > 50
                        ? 'linear-gradient(90deg, #f97316, #eab308)'
                        : 'linear-gradient(90deg, #22c55e, #3b82f6)',
                  }}
                />
              </div>
            )}
          </div>
        </div>


        <div className="relative my-1 px-2">
          <div className="h-px bg-slate-100 dark:bg-zinc-800/50 w-full" />
        </div>

        <DropdownMenuGroup className="pt-1">

          <DropdownMenuItem disabled className="rounded-xl py-2.5 cursor-not-allowed opacity-60">
            <Settings className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium">Profile Settings</span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">Soon</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled className="rounded-xl py-2.5 cursor-not-allowed opacity-60">
            <ShieldCheck className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium">Billing & Subscription</span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">Soon</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled className="rounded-xl py-2.5 cursor-not-allowed opacity-60">
            <TrendingUp className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium">Usage analytics</span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">Soon</span>
          </DropdownMenuItem>

        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-zinc-800/50" />

        <DropdownMenuItem

          className="rounded-xl py-3 px-0 text-red-500 focus:text-white focus:bg-red-400 cursor-pointer flex justify-center items-center gap-1 transition-colors"

          onSelect={(e) => {

            e.preventDefault()

            onLogout?.()

          }}

        >


          <span className="text-sm font-bold">Sign out</span>

        </DropdownMenuItem>

      </DropdownMenuContent>

    </DropdownMenu>

  )

}
