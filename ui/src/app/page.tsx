"use client"

import { DiscoverySection } from "@/components/DiscoverySection"
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
      <Navigation user={userData} showNavMenu={false} />

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
          </div>
      </main>
    </div>
  )
}
