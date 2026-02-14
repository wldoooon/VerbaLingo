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

  CircleDashed

} from "lucide-react"

import { useTheme } from "next-themes"

import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher"

import { useUsageStore } from "@/stores/usage-store"

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

  

  // Use 'search' stats as the driver for the main 'Credit' UI

  const stats = usageMap['search'] || { current: 0, limit: 50, remaining: 50 }

  

  const MULTIPLIER = 100000

  

  // Calculate percentage USED for the ring

  const percentageUsed = stats.limit > 0 ? (stats.current / stats.limit) * 100 : 0

  const circumference = 2 * Math.PI * 18 // r=18

  const offset = circumference - (percentageUsed / 100) * circumference



  // Scaled values for display

  const displayLimit = stats.limit === -1 ? "Unlimited" : (stats.limit * MULTIPLIER).toLocaleString()

  const displayRemaining = stats.limit === -1 ? "âˆž" : (stats.remaining * MULTIPLIER).toLocaleString()









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

        className="w-72 rounded-[1.5rem] border border-border/50 bg-white dark:bg-zinc-950 p-2 shadow-2xl"

        align="end"

        sideOffset={12}

      >

                {/* Balance Card */}

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/50 mb-2">

                  <div className="flex items-center justify-between mb-4">

                    <div className="flex items-center gap-2">

                                    {/* Miniature Progress Ring */}

                                    <div className="relative w-5 h-5 flex items-center justify-center">

                                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">

                                        <circle

                                          cx="20" cy="20" r="18"

                                          fill="none"

                                          stroke="currentColor"

                                          strokeWidth="4"

                                          className="text-slate-300 dark:text-slate-700"

                                        />

                                        <circle

                                          cx="20" cy="20" r="18"

                                          fill="none"

                                          stroke="currentColor"

                                          strokeWidth="4"

                                          strokeDasharray={circumference}

                                          strokeDashoffset={offset}

                                          strokeLinecap="round"

                                          className="text-orange-500"

                                        />

                                      </svg>

                                    </div>

                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Balance</span>

                      

                    </div>

        

            <Link href="/pricing">

              <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-white px-2.5 py-1 rounded-lg hover:bg-orange-500 transition-colors">

                Upgrade

              </span>

            </Link>

          </div>

          

                    <div className="space-y-2">

          

                      <div className="flex justify-between text-xs font-medium">

          

                        <span className="text-slate-400">Total</span>

          

                        <span className="text-slate-900 dark:text-slate-100">{displayLimit} credits</span>

          

                      </div>

          

                                              <div className="flex justify-between text-xs font-bold">

          

                                                <span className="text-slate-400">Remaining</span>

          

                                                <span className="text-slate-900 dark:text-slate-100">{displayRemaining}</span>

          

                                              </div>

          

                                            </div>

          

                                                  </div>

          

                                          

          

                                                  <DropdownMenuGroup className="pt-2">

          

                                          

          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">

            <Settings className="mr-3 h-4 w-4 text-slate-400" />

            <span className="text-sm font-medium">Settings</span>

          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">

            <ShieldCheck className="mr-3 h-4 w-4 text-slate-400" />

            <span className="text-sm font-medium">Subscription</span>

          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">

            <BookText className="mr-3 h-4 w-4 text-slate-400" />

            <span className="text-sm font-medium">Pronunciation dictionaries</span>

          </DropdownMenuItem>

          

          <div className="relative my-1 px-2">

             <div className="h-px bg-slate-100 dark:bg-zinc-800/50 w-full" />

          </div>



          <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer">

            <TrendingUp className="mr-3 h-4 w-4 text-slate-400" />

            <span className="text-sm font-medium">Usage analytics</span>

          </DropdownMenuItem>

        </DropdownMenuGroup>



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
