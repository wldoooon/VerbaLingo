"use client"

import { useState } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { AppSidebar } from "@/components/app-sidebar"
import SearchBar from "@/components/comm/SearchBar"
import VideoPlayer from "@/components/comm/VideoPlayer"
import TranscriptViewer from "@/components/comm/TranscriptViewer"
import { AiCompletion } from "@/components/ai-completion"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { state } = usePlayerContext()
  const { playlist } = state

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="bg-card text-card-foreground shadow-sm flex-1 p-6 border-t">
            {/* Search Section */}
            <div className="flex justify-start">
              <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
            </div>

            {/* Video Player, Transcript and AI Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
              <div className={cn("lg:col-span-8", playlist.length === 0 && "lg:col-span-12")}>
                <VideoPlayer />
                {playlist.length > 0 && (
                  <div className="mt-6">
                    <TranscriptViewer />
                  </div>
                )}
              </div>
              {playlist.length > 0 && (
                <div className="lg:col-span-4 -mt-21 -mr-6 -mb-6">
                  <AiCompletion query={searchQuery} />
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
