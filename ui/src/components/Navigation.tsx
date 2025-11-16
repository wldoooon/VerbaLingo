"use client"

import SearchBar from "@/components/comm/SearchBar"
import { HeaderToolbar } from "@/components/header-toolbar"
import { NavMenu } from "@/components/nav-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "@/context/SearchParamsContext"
import { Bangers } from "next/font/google"

const logoFont = Bangers({ subsets: ["latin"], weight: "400" })

interface NavigationProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const { language, setLanguage, category, setCategory } = useSearchParams()
  return (
    <header className="sticky top-0 z-50 w-full bg-card">
      <div className="relative">
        <div className="flex h-20 items-center px-4 sm:px-6 gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <a href="/" aria-label="VerbaLingo home" className="select-none">
              <span className={`${logoFont.className} text-3xl sm:text-4xl leading-none text-foreground drop-shadow-sm`}>VerbaLingo</span>
            </a>
          </div>

          {/* Navigation Menu */}
          <NavMenu />

          {/* Search Bar + Filters */}
          <div className="flex-1 flex items-center gap-2 ml-4">
            <div className="flex-1">
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

          {/* Right Side - User Tools */}
          <div className="ml-auto">
            <HeaderToolbar user={user} />
          </div>
        </div>
        {/* Faded border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>
    </header>
  )
}
