"use client"

import { SearchBar } from "@/components/comm/SearchBar"
import { HeaderToolbar } from "@/components/header-toolbar"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"

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
        <div className="flex h-20 items-center px-4 sm:px-6 gap-2 sm:gap-4">
          {/* Mobile Sidebar Trigger - only visible xl:hidden */}
          <div className="xl:hidden flex-shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden -ml-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px]">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Main navigation sidebar</SheetDescription>
                </SheetHeader>
                <Sidebar isMobile user={user} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Search Bar with integrated filters - aligned center */}
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>

          {/* Right Side - User Tools (Hidden on mobile/tablet) */}
          <div className="hidden xl:block flex-shrink-0">
            <HeaderToolbar user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
