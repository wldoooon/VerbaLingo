"use client"

import { usePlayerContext } from "@/context/PlayerContext"
import { AppSidebar } from "@/components/app-sidebar"
import SearchBar from "@/components/comm/SearchBar"
import VideoPlayer from "@/components/comm/VideoPlayer"
import TranscriptViewer from "@/components/comm/TranscriptViewer"
import { AiCompletion } from "@/components/ai-completion"
import { BottomStickyBar } from "@/components/BottomStickyBar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const { state } = usePlayerContext()
  const { playlist } = state

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="bg-card text-card-foreground shadow-sm flex-1 p-6 pb-12">
            {/* Search Section */}
            <div className="flex justify-start">
              <SearchBar />
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
                  <AiCompletion />
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
      
      {/* Bottom Sticky Status Bar */}
      <BottomStickyBar />
    </SidebarProvider>
  )
}
