"use client"

import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useSearch } from "@/lib/useApi"
import { AppSidebar } from "@/components/app-sidebar"
import SearchBar from "@/components/comm/SearchBar"
import VideoPlayer from "@/components/comm/VideoPlayer"
import AudioCard from "@/components/comm/AudioCard"
import { AiCompletion } from "@/components/ai-completion"
import { DiscoverySection } from "@/components/DiscoverySection"
import { GameTicker } from "@/components/game-ticker"
import { HeaderToolbar } from "@/components/header-toolbar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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
          <div className="relative bg-card p-2 sm:p-4">
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
            {/* Gradient border bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex h-px">
              <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
              <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
            </div>
          </div>
          
          <div className="bg-card text-card-foreground shadow-sm flex-1 p-4 sm:p-6 pb-12 lg:pb-6">
            {/* Content Section - Discovery Carousel or Video Player */}
            {playlist.length === 0 ? (
              /* Discovery Carousel - shown when no search results */
              <>
                <div className="mt-4">
                  <DiscoverySection 
                    onVideoSelect={(video) => {
                      console.log("Video selected:", video.title);
                      // TODO: Implement video selection logic
                    }}
                  />
                </div>
              
                {/* Game Ticker */}
                <div className="mt-1">
                  <div className="mb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Popular Games
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Learn English through gaming vocabulary and in-game dialogues
                    </p>
                  </div>
                  <GameTicker />
                </div>
              </>
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
