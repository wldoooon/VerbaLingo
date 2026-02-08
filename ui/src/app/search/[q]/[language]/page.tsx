"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import VideoPlayerCard from "@/components/features/player/video-player-card"
import AudioCard from "@/components/features/player/audio-card"
import { AiCompletion } from "@/components/ai-completion"
import { usePlayerStore } from "@/stores/use-player-store"
import { useSearchStore } from "@/stores/use-search-store"
import { useSearch } from "@/lib/useApi"
import { Loader2 } from "lucide-react"
import { FacetChips } from "@/components/comm/FacetChips"

export default function RoutedSearchPage() {
  const params = useParams<{ q: string; language: string }>()
  const searchParams = useSearchParams()

  const q = decodeURIComponent(params.q || "")
  const languageParam = decodeURIComponent(params.language || "english")

  // Now Category comes from ?category=... instead of reusing the language
  const categoryParam = searchParams.get("category")
  const categoryForContext = categoryParam || null

  const { setQuery, setCategory, setLanguage, subCategory, setSubCategory } = useSearchStore()
  const { currentVideoIndex, resetIndex } = usePlayerStore()

  const [externalPrompt, setExternalPrompt] = useState<string | null>(null)
  const [hasRequested, setHasRequested] = useState(false)

  // Local searchQuery for AudioCard subtitle
  const [searchQuery, setSearchQuery] = useState("")

  // Use a dedicated query instance here and manually fetch on mount
  const { data, refetch, isLoading, isFetching } = useSearch(q, languageParam, categoryForContext, subCategory)
  const playlist = useMemo(() => data?.hits || [], [data])

  useEffect(() => {
    if (!q || !q.trim()) return

    // Start the backend fetch as early as possible
    setHasRequested(true)
    refetch()

    // Sync URL params into global search context
    setQuery(q)
    setCategory(categoryForContext)
    setLanguage(languageParam)

    // Persist last query for components relying on it
    try {
      localStorage.setItem("last_search_query", q)
    } catch { }

    setSearchQuery(q)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, languageParam])

  // Reset video index when new results arrive
  useEffect(() => {
    if (data && data.hits && data.hits.length > 0) {
      resetIndex()
    }
  }, [data, resetIndex])

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 bg-transparent text-card-foreground">
        {(!hasRequested || isLoading || isFetching) ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-0 max-w-full lg:grid lg:grid-cols-[1fr_560px] lg:items-start">
            {/* Left: Player + Audio */}
            <div className="space-y-4 p-4 sm:p-6 pb-12 lg:pb-6">
              <VideoPlayerCard
                playlist={playlist}
                isFetching={isFetching}
                aggregations={data?.aggregations}
              />
              <AudioCard
                currentClip={playlist[currentVideoIndex]}
                playlist={playlist}
                totalItems={data?.total}
                searchQuery={searchQuery}
                onExplainWordPrompt={(prompt) => setExternalPrompt(prompt)}
              />
            </div>

            {/* Right: AI */}
            <div className="hidden lg:flex lg:flex-col lg:ml-0 lg:mr-0 sticky top-0 h-[calc(100vh-5rem)] overflow-hidden border-l">
              <AiCompletion externalPrompt={externalPrompt} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
