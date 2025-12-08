"use client"

import { SearchBar } from "@/components/comm/SearchBar"
import { HeaderToolbar } from "@/components/header-toolbar"

interface NavigationProps {
  user: {
    name: string
    email: string
    avatar: string
  }
  showNavMenu?: boolean
}

export function Navigation({ user, showNavMenu = true }: NavigationProps) {
  return (
    <header className="w-full bg-transparent">
      <div className="relative">
        <div className="flex h-20 items-center px-4 sm:px-6 gap-4">
          {/* Search Bar with integrated filters - aligned center */}
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>

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
