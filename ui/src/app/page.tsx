"use client"

import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useSearch } from "@/lib/useApi"
import SearchBar from "@/components/comm/SearchBar"
import VideoPlayerCard from "@/components/comm/VideoPlayerCard"
import AudioCard from "@/components/comm/AudioCard"
import { AiCompletion } from "@/components/ai-completion"
import { DiscoverySection } from "@/components/DiscoverySection"
import { GameTicker } from "@/components/game-ticker"
import { HeaderToolbar } from "@/components/header-toolbar"
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
    <div className="flex flex-col min-h-screen">
      {/* Full Width Header - Sticky at Top */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 sm:px-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mr-6">
            <h1 className="text-xl font-bold text-foreground">VerbaLingo</h1>
          </div>

          {/* Search Bar - Centered, Wide */}
          <div className="flex-1 max-w-3xl mx-auto">
            <SearchBar />
          </div>

          {/* Right Side - User Tools */}
          <div className="ml-6">
            <HeaderToolbar user={userData} />
          </div>
        </div>
      </header>

      {/* Main Content Area - Full Width */}
      <main className="flex-1">
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
                  <VideoPlayerCard />
                  <AudioCard 
                    src={playlist[state.currentVideoIndex]?.video_id 
                      ? `https://www.youtube.com/watch?v=${playlist[state.currentVideoIndex].video_id}` 
                      : ""}
                    title={playlist[state.currentVideoIndex]?.sentence_text ?? ""}
                    searchQuery={searchQuery}
                  />
                </div>
                <div className="hidden lg:flex lg:flex-col lg:ml-0 lg:mr-0">
                  <AiCompletion />
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  )
}
