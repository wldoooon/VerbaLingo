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

  Sun

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

  // Use 'ai_chat' stats as the driver for the main 'Credit' UI (Sparks)
  const stats = usageMap['ai_chat'] || { current: 0, balance: 0, limit: -1, remaining: -1 }

  const maxSparks = fullUser?.tier === "pro" ? 250000 : 30000
  const currentBalance = stats.balance ?? 0
  const usedSparks = Math.max(0, maxSparks - currentBalance)

  // Calculate percentage USED for the ring (0% when full, 100% when empty)
  const percentageUsed = maxSparks > 0 ? Math.max(0, Math.min(100, (usedSparks / maxSparks) * 100)) : 0
  const circumference = 2 * Math.PI * 18 // r=18
  const offset = circumference - (percentageUsed / 100) * circumference

  // Values for display
  const displayLimit = maxSparks.toLocaleString()
  const displayRemaining = currentBalance.toLocaleString()

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

        <DropdownMenuGroup className="pt-2">

          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">
            <Settings className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">
            <ShieldCheck className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium">Subscription</span>
          </DropdownMenuItem>

          <div className="relative my-1 px-2">
            <div className="h-px bg-slate-100 dark:bg-zinc-800/50 w-full" />
          </div>

          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">
            <TrendingUp className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium">Usage analytics</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="rounded-xl py-2.5 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
          >
            {theme === 'dark' ? (
              <Sun className="mr-3 h-4 w-4 text-slate-400" />
            ) : (
              <Moon className="mr-3 h-4 w-4 text-slate-400" />
            )}
            <span className="text-sm font-medium">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </DropdownMenuItem>

        </DropdownMenuGroup>

        {/* Balance Card - Moved below main menu items */}
        <div className="p-3.5 rounded-[1.25rem] border border-slate-200 dark:border-zinc-800/80 my-2 bg-white dark:bg-zinc-950/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
                <Image src="/sparks.png" alt="Sparks" width={20} height={20} className="object-contain" />
                Sparks
              </span>
            </div>
            <Link href="/pricing" className="shrink-0">
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

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-zinc-800/50" />



        <DropdownMenuItem

          className="rounded-xl py-2.5 text-red-500 focus:text-red-500 cursor-pointer"

          onSelect={(e) => {

            e.preventDefault()

            onLogout?.()

          }}

        >

          <LogOut className="mr-3 h-4 w-4" />

          <span className="text-sm font-bold">Sign out</span>

        </DropdownMenuItem>

      </DropdownMenuContent>

    </DropdownMenu>

  )

}
