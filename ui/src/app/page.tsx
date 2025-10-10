"use client"

import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useSearch } from "@/lib/useApi"
import { AppSidebar } from "@/components/app-sidebar"
import SearchBar from "@/components/comm/SearchBar"
import VideoPlayer from "@/components/comm/VideoPlayer"
import TranscriptViewer from "@/components/comm/TranscriptViewer"
import AudioCard from "@/components/comm/AudioCard"
import { AiCompletion } from "@/components/ai-completion"
import { DiscoverySection } from "@/components/DiscoverySection"
import { HeaderUserProfile } from "@/components/header-user-profile"
import { HeaderToolbar } from "@/components/header-toolbar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export default function SearchPage() {
  const { state } = usePlayerContext()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Read playlist from React Query cache
  const { query, category } = useSearchParams()
  const { data } = useSearch(query, category)
  const playlist = data?.hits || []

  useEffect(() => {
    // Get the last search query from localStorage
    const lastQuery = localStorage.getItem('last_search_query')
    if (lastQuery) {
      setSearchQuery(lastQuery)
    }
  }, [])

  // User data (you can move this to a context or fetch from API)
  const userData = {
    name: "wldooon",
    email: "user@verbalingo.com",
    avatar: "/avatars/user.jpg",
  };

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
            <HeaderToolbar user={userData} />
          </div>
          
          {/* Search Header */}
          <div className="bg-card border-b p-2 sm:p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="hidden lg:block">
                  <SidebarTrigger className="size-8 hover:bg-accent hover:text-accent-foreground" />
                </div>
                <div className="basis-1/2 max-w-[50%]">
                  <SearchBar />
                </div>
              </div>
              <div className="hidden lg:block">
                <HeaderToolbar user={userData} />
              </div>
            </div>
          </div>
          
          <div className="bg-card text-card-foreground shadow-sm flex-1 p-4 sm:p-6 pb-12 lg:pb-6">
            {/* Content Section - Discovery Carousel or Video Player */}
            {playlist.length === 0 ? (
              /* Discovery Carousel - shown when no search results */
              <div className="mt-4">
                <DiscoverySection 
                  onVideoSelect={(video) => {
                    console.log("Video selected:", video.title);
                    // TODO: Implement video selection logic
                  }}
                />
              </div>
            ) : (
              /* Video Player and Transcript Section - shown when search results exist */
              <div className="mt-0 max-w-full lg:grid lg:grid-cols-[1fr_560px] lg:items-stretch lg:gap-2">
                <div className="space-y-2">
                  <VideoPlayer />
                  <div className="mt-0">
                    <AudioCard
                      src={"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
                      title={playlist[0]?.sentence_text ?? "Sample audio"}
                      searchQuery={searchQuery}
                    />
                  </div>
                  {/* TranscriptViewer removed; transcript is now overlayed on the video */}
                </div>
                <div className="hidden lg:flex lg:flex-col lg:ml-0 lg:mr-0">
                  <AiCompletion />
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
      
    </SidebarProvider>
  )
}
