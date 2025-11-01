"use client"

import { FilterTree } from "@/components/FilterTree"
import { Compass, ChevronDown, BookmarkIcon, CreditCard, GraduationCap } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

export function SidebarCard() {
  const [isStudyHubOpen, setIsStudyHubOpen] = useState(true)

  return (
    <aside className="hidden lg:block w-[290px] bg-card sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="relative h-full">
        <div className="p-4 h-full flex flex-col gap-4">
          <div className="flex items-center gap-2 text-base font-medium px-3 py-2 rounded-xl hover:bg-accent transition-colors cursor-pointer">
            <Compass className="h-5 w-5" />
            <span>Discover</span>
          </div>
          
          <Separator />
          
          {/* Study Hub Section */}
          <div className="flex flex-col gap-1">
            {/* Study Hub Header */}
            <button
              onClick={() => setIsStudyHubOpen(!isStudyHubOpen)}
              className="flex items-center gap-2 text-base font-medium px-2 py-1.5 rounded-xl hover:bg-accent transition-colors w-full"
            >
              <GraduationCap className="h-5 w-5" />
              <span className="flex-1 text-left">Study Hub</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isStudyHubOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
            
            {/* Study Hub Items */}
            {isStudyHubOpen && (
              <div className="flex flex-col gap-0.5 ml-4 mt-1">
                <div className="flex items-center gap-2 text-base px-2 py-1.5 rounded-xl hover:bg-accent transition-colors cursor-pointer">
                  <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Saved Words</span>
                </div>
                <div className="flex items-center gap-2 text-base px-2 py-1.5 rounded-xl hover:bg-accent transition-colors cursor-pointer">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Flash Card</span>
                </div>
              </div>
            )}
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
