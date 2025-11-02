"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { SidebarCard } from "@/components/SidebarCard"
import VideoPlayerCard from "@/components/comm/VideoPlayerCard"
import AudioCard from "@/components/comm/AudioCard"
import { AiCompletion } from "@/components/ai-completion"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams as useSearchParamsCtx } from "@/context/SearchParamsContext"
import { useSearch } from "@/lib/useApi"

export default function RoutedSearchPage() {
  const params = useParams<{ q: string; language: string }>()
  const q = decodeURIComponent(params.q || "")
  const languageParam = decodeURIComponent(params.language || "General")

  const categoryForContext: string | null = languageParam === "General" ? null : languageParam

  const { setQuery, setCategory } = useSearchParamsCtx()
  const { state, dispatch } = usePlayerContext()

  // Local searchQuery for AudioCard subtitle
  const [searchQuery, setSearchQuery] = useState("")

  // Use a dedicated query instance here and manually fetch on mount
  const { data, refetch } = useSearch(q, categoryForContext)
  const playlist = useMemo(() => data?.hits || [], [data])

  useEffect(() => {
    // Sync URL params into global search context
    setQuery(q)
    setCategory(categoryForContext)

    // Persist last query for components relying on it
    try {
      if (q) localStorage.setItem("last_search_query", q)
    } catch {}

    setSearchQuery(q)

    // Fetch results to populate React Query cache so VideoPlayerCard can read it
    if (q && q.trim()) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, languageParam])

  // Reset video index when new results arrive
  useEffect(() => {
    if (data && data.hits && data.hits.length > 0) {
      dispatch({ type: "RESET_INDEX" })
    }
  }, [data, dispatch])

  const userData = {
    name: "wldooon",
    email: "user@verbalingo.com",
    avatar: "/avatars/user.jpg",
  }

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
          {/* Always render the player+AI layout for routed search */}
          <div className="mt-0 max-w-full lg:grid lg:grid-cols-[1fr_560px] lg:items-stretch lg:gap-2">
            {/* Left: Player + Audio */}
            <div className="space-y-2">
              <VideoPlayerCard />
              <AudioCard
                src={
                  playlist[state.currentVideoIndex]?.video_id
                    ? `https://www.youtube.com/watch?v=${playlist[state.currentVideoIndex].video_id}`
                    : ""
                }
                title={playlist[state.currentVideoIndex]?.sentence_text ?? ""}
                searchQuery={searchQuery}
              />
            </div>

            {/* Right: AI */}
            <div className="hidden lg:flex lg:flex-col lg:ml-0 lg:mr-0">
              <AiCompletion />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
