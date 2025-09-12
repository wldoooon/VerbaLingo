"use client"

import { usePlayerContext } from "@/context/PlayerContext"
import { AppSidebar } from "@/components/app-sidebar"
import SearchBar from "@/components/comm/SearchBar"
import VideoPlayer from "@/components/comm/VideoPlayer"
import TranscriptViewer from "@/components/comm/TranscriptViewer"
import { AiCompletion } from "@/components/ai-completion"
import { BottomStickyBar } from "@/components/BottomStickyBar"
import { DiscoverySection } from "@/components/DiscoverySection"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const { state } = usePlayerContext()
  const { playlist } = state

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          {/* Mobile Header with Sidebar Toggle */}
          <div className="flex items-center justify-between gap-2 p-4 lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="size-8 hover:bg-accent hover:text-accent-foreground" />
              <h1 className="text-lg font-semibold text-foreground">VerbaLingo</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Search & Learn
            </div>
          </div>
          
          <div className="bg-card text-card-foreground shadow-sm flex-1 p-4 sm:p-6 pb-12 lg:pb-6">
            {/* Search Section */}
            <div className="flex justify-start">
              <SearchBar />
            </div>

            {/* Content Section - Discovery Carousel or Video Player */}
            {playlist.length === 0 ? (
              /* Discovery Carousel - shown when no search results */
              <div className="mt-8">
                <DiscoverySection 
                  onVideoSelect={(video) => {
                    console.log("Video selected:", video.title);
                    // TODO: Implement video selection logic
                  }}
                />
              </div>
            ) : (
              /* Video Player, Transcript and AI Section - shown when search results exist */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
                <div className="lg:col-span-8">
                  <VideoPlayer />
                  <div className="mt-6">
                    <TranscriptViewer />
                  </div>
                </div>
                <div className="lg:col-span-4 -mt-21 -mr-6 -mb-6">
                  <AiCompletion />
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
      
      {/* Bottom Sticky Status Bar */}
      <BottomStickyBar />
    </SidebarProvider>
  )
}
