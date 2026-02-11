"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { usePlayerStore } from "@/stores/use-player-store"
import { useSearchStore } from "@/stores/use-search-store"
import { useSearch } from "@/lib/useApi"
import { Loader2 } from "lucide-react"

// Dynamic imports for heavy components
const VideoPlayerCard = dynamic(() => import("@/components/features/player/video-player-card"), {
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded-xl" />,
  ssr: false
})
const AudioCard = dynamic(() => import("@/components/features/player/audio-card"), {
  ssr: false
})
const AiCompletion = dynamic(() => import("@/components/ai-completion").then(mod => mod.AiCompletion), {
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
  ssr: false
})

export default function RoutedSearchPage() {
  const params = useParams<{ q: string; language: string }>()
  const searchParams = useSearchParams()

  const q = decodeURIComponent(params.q || "")
  const languageParam = decodeURIComponent(params.language || "english")

  const categoryParam = searchParams.get("category")
  const categoryForContext = categoryParam || null

  const { setQuery, setCategory, setLanguage, subCategory } = useSearchStore()
  const { currentVideoIndex, resetIndex } = usePlayerStore()

  const [externalPrompt, setExternalPrompt] = useState<string | null>(null)
  const [hasRequested, setHasRequested] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data, refetch, isLoading, isFetching } = useSearch(q, languageParam, categoryForContext, subCategory)
  const playlist = useMemo(() => data?.hits || [], [data])

  useEffect(() => {
    if (!q || !q.trim()) return

    setHasRequested(true)
    refetch()

    setQuery(q)
    setCategory(categoryForContext)
    setLanguage(languageParam)

    try {
      localStorage.setItem("last_search_query", q)
    } catch { }

    setSearchQuery(q)
  }, [q, languageParam, categoryForContext, subCategory, refetch, setQuery, setCategory, setLanguage])

  useEffect(() => {
    if (data && data.hits && data.hits.length > 0) {
      resetIndex()
    }
  }, [data, resetIndex])

  return (
    <>
      <div className="flex-1 bg-transparent text-card-foreground">
        {(!hasRequested || isLoading || isFetching) ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-0 max-w-full lg:grid lg:grid-cols-[1fr_560px] lg:items-start">
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

            <div className="hidden lg:flex lg:flex-col lg:ml-0 lg:mr-0 sticky top-0 h-[calc(100vh-5rem)] overflow-hidden border-l">
              <AiCompletion externalPrompt={externalPrompt} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}