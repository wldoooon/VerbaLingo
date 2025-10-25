"use client"

import SearchBar from "@/components/comm/SearchBar"
import { HeaderToolbar } from "@/components/header-toolbar"

interface NavigationProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function Navigation({ user }: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-card">
      <div className="relative">
        <div className="flex h-16 items-center px-4 sm:px-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mr-6">
            <h1 className="text-xl font-bold text-foreground">VerbaLingo</h1>
          </div>

          {/* Search Bar - Centered, Wide */}
          <div className="flex-1 max-w-3xl mx-auto">
            <SearchBar />
          </div>

          {/* Right Side - User Tools */}
          <div className="ml-6">
            <HeaderToolbar user={user} />
          </div>
        </div>
        {/* Faded border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>
    </header>
  )
}
