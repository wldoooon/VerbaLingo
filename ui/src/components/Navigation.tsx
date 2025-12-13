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
      <div className="relative border-b border-border">
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
      </div>
    </header>
  )
}
