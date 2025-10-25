"use client"

import { FilterTree } from "@/components/FilterTree"
import { Compass } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function SidebarCard() {
  return (
    <aside className="hidden lg:block w-[260px] bg-card sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="relative h-full">
        <div className="p-4 h-full flex flex-col gap-4">
          <div className="flex items-center gap-2 text-base font-medium px-3 py-2 rounded-xl hover:bg-accent transition-colors cursor-pointer">
            <Compass className="h-5 w-5" />
            <span>Discover</span>
          </div>
          <Separator />
          <FilterTree />
        </div>
        {/* Faded border right */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
      </div>
    </aside>
  )
}
