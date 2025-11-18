"use client"

import SearchBar from "@/components/comm/SearchBar"
import { HeaderToolbar } from "@/components/header-toolbar"
import { NavMenu } from "@/components/nav-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "@/context/SearchParamsContext"
import { Bangers } from "next/font/google"
import { SidebarTrigger } from "@/components/ui/sidebar"

const logoFont = Bangers({ subsets: ["latin"], weight: "400" })

interface NavigationProps {
  user: {
    name: string
    email: string
    avatar: string
  }
  showNavMenu?: boolean
}

export function Navigation({ user, showNavMenu = true }: NavigationProps) {
  const { language, setLanguage, category, setCategory } = useSearchParams()
  return (
    <header className="sticky top-0 z-50 w-full bg-card">
      <div className="relative">
        <div className="flex h-20 items-center px-4 sm:px-6 gap-4">
          {/* Sidebar Trigger */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <SidebarTrigger />
          </div>

          {/* Spacer - Left - Removed to move search bar to left */}
          {/* <div className="flex-1 min-w-0" /> */}

          {/* Search Bar + Filters - Centered with right expansion */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-[400px] sm:w-[500px] md:w-[600px] lg:w-[700px]">
              <SearchBar />
            </div>
            {/* Language Selector */}
            <div className="hidden md:block">
              <Select value={language} onValueChange={(val) => setLanguage(val)}>
                <SelectTrigger size="sm" aria-label="Select language">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Category Selector */}
            <div className="hidden md:block">
              <Select value={category ?? "General"} onValueChange={(val) => setCategory(val === "General" ? null : val)}>
                <SelectTrigger size="sm" aria-label="Select category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Movies">Movies</SelectItem>
                  <SelectItem value="TV">TV Shows</SelectItem>
                  <SelectItem value="Games">Games</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Spacer - Right */}
          <div className="flex-1 min-w-0" />

          {/* Right Side - User Tools */}
          <div className="flex-shrink-0">
            <HeaderToolbar user={user} />
          </div>
        </div>
        {/* Faded border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>
    </header>
  )
}
