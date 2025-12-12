"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import VideoPlayerCard from "@/components/comm/VideoPlayerCard"
import AudioCard from "@/components/comm/AudioCard"
import { AiCompletion } from "@/components/ai-completion"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams as useSearchParamsCtx } from "@/context/SearchParamsContext"
import { useSearch } from "@/lib/useApi"
import { Loader2 } from "lucide-react"

export default function RoutedSearchPage() {
  const params = useParams<{ q: string; language: string }>()
  const q = decodeURIComponent(params.q || "")
  const languageParam = decodeURIComponent(params.language || "General")

  const categoryForContext: string | null = languageParam === "General" ? null : languageParam

  const { setQuery, setCategory } = useSearchParamsCtx()
  const { state, dispatch } = usePlayerContext()

  const [externalPrompt, setExternalPrompt] = useState<string | null>(null)
  const [hasRequested, setHasRequested] = useState(false)

  // Local searchQuery for AudioCard subtitle
  const [searchQuery, setSearchQuery] = useState("")

  // Use a dedicated query instance here and manually fetch on mount
  const { data, refetch, isLoading } = useSearch(q, categoryForContext)
  const playlist = useMemo(() => data?.hits || [], [data])

  useEffect(() => {
    if (!q || !q.trim()) return

    // Start the backend fetch as early as possible
    setHasRequested(true)
    refetch()

    // Sync URL params into global search context
    setQuery(q)
    setCategory(categoryForContext)

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
      dispatch({ type: "RESET_INDEX" })
    }
  }, [data, dispatch])

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 bg-transparent text-card-foreground">
        {(!hasRequested || isLoading) ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-0 max-w-full lg:grid lg:grid-cols-[1fr_560px] lg:items-start">
            {/* Left: Player + Audio */}
            <div className="space-y-4 p-4 sm:p-6 pb-12 lg:pb-6">
              <VideoPlayerCard />
              <AudioCard
                src={
                  playlist[state.currentVideoIndex]?.video_id
                    ? `https://www.youtube.com/watch?v=${playlist[state.currentVideoIndex].video_id}`
                    : ""
                }
                title={playlist[state.currentVideoIndex]?.sentence_text ?? ""}
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
