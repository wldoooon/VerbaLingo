"use client"

import { DiscoverySection } from "@/components/DiscoverySection"
import { GameTicker } from "@/components/game-ticker"
import { Navigation } from "@/components/Navigation"
import { SidebarCard } from "@/components/SidebarCard"

export default function HomePage() {

  // User data (you can move this to a context or fetch from API)
  const userData = {
    name: "wldooon",
    email: "user@verbalingo.com",
    avatar: "/avatars/user.jpg",
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <Navigation user={userData} />

      {/* Main Content Area - Sidebar + Content */}
      <main className="flex flex-1">
        {/* Left Sidebar */}
        <SidebarCard />

        {/* Main Content */}
        <div className="flex-1 bg-card text-card-foreground shadow-sm p-4 sm:p-6 pb-12 lg:pb-6">
            {/* Discovery content only on home; routed search page handles player + AI */}
            <div className="mt-4">
              <DiscoverySection 
                onVideoSelect={(video) => {
                  console.log("Video selected:", video.title)
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
          </div>
      </main>
    </div>
  )
}
