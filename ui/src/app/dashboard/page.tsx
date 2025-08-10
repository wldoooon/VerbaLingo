"use client"

import { PlayerProvider } from "@/context/PlayerContext"
import { AppSidebar } from "@/components/app-sidebar"
import SearchBar from "@/components/comm/SearchBar"
import VideoPlayer from "@/components/comm/VideoPlayer"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <PlayerProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Search Section */}
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2">Video Clip Search</h1>
                <p className="text-muted-foreground">Search for any word and discover video clips that contain it</p>
              </div>
              <div className="flex justify-center">
                <SearchBar />
              </div>
            </div>

            {/* Video Player Section */}
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
              <VideoPlayer />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PlayerProvider>
  )
}
