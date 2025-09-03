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

export default function Page() {
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
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Search Section */}
          <div className="bg-card text-card-foreground shadow-sm p-6 rounded-xl">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Video Clip Search</h1>
              <p className="text-muted-foreground">Search for any word and discover video clips that contain it</p>
            </div>
            <div className="flex justify-center">
              <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
            </div>
          </div>

          {/* Video Player and Transcript Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className={cn(
                "bg-card text-card-foreground shadow-sm p-6 rounded-xl",
                playlist.length > 0 ? "lg:col-span-2" : "lg:col-span-3",
              )}
            >
              <VideoPlayer />
            </div>
            {playlist.length > 0 && (
              <div className="bg-card text-card-foreground shadow-sm p-6 rounded-xl">
                <TranscriptViewer />
              </div>
            )}
          </div>

          {/* AI Completion Section */}
          <div className="bg-card text-card-foreground shadow-sm p-6 rounded-xl mt-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">AI Assistant</h2>
              <p className="text-muted-foreground">Ask anything about the video or get creative!</p>
            </div>
            <div className="flex justify-center">
              <AiCompletion query={searchQuery} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}