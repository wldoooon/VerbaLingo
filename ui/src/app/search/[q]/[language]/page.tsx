"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { usePlayerStore } from "@/stores/use-player-store"
import { useSearchStore } from "@/stores/use-search-store"
import { useSearch } from "@/lib/useApi"
import { useEntitlements } from "@/hooks/use-entitlements"
import { useAuthStore } from "@/stores/auth-store"
import { Loader2, PanelRightClose, PanelRightOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

// Lightweight — no need to lazy-load
import { SearchLimitWall } from "@/components/features/search-limit-wall"

export default function RoutedSearchPage() {
  const params = useParams<{ q: string; language: string }>()
  const searchParams = useSearchParams()

  const q = decodeURIComponent(params.q || "")
  const languageParam = decodeURIComponent(params.language || "english")

  const categoryParam = searchParams.get("category")
  const categoryForContext = categoryParam || null

  const { setQuery, setCategory, setLanguage, subCategory } = useSearchStore()
  const { currentVideoIndex, resetIndex } = usePlayerStore()

  // Entitlements: check if the user still has search access
  const { hasAccess, isLoaded } = useEntitlements("search")
  const authStatus = useAuthStore((s) => s.status)
  const isAnonymous = authStatus !== "authenticated"

  const [externalPrompt, setExternalPrompt] = useState<string | null>(null)
  const [hasRequested, setHasRequested] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAiCollapsed, setIsAiCollapsed] = useState(false)

  // Track if the search was blocked by a 429 response
  const [searchBlocked, setSearchBlocked] = useState(false)

  const { data, refetch, isLoading, isFetching, error } = useSearch(q, languageParam, categoryForContext, subCategory)
  const playlist = useMemo(() => data?.hits || [], [data])

  // Detect 429 from the search error (Axios wraps it in error.response)
  useEffect(() => {
    if (error) {
      const axiosErr = error as any
      if (axiosErr?.response?.status === 429) {
        setSearchBlocked(true)
      }
    }
  }, [error])

  // If user logs in while the wall is showing, un-block and retry
  useEffect(() => {
    if (!isAnonymous && searchBlocked) {
      setSearchBlocked(false)
      refetch()
    }
  }, [isAnonymous, searchBlocked, refetch])

  // Also un-block if entitlements restore access (e.g. after login)
  useEffect(() => {
    if (isLoaded && hasAccess && searchBlocked) {
      setSearchBlocked(false)
      refetch()
    }
  }, [isLoaded, hasAccess, searchBlocked, refetch])

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

  // Show the signup wall if:
  // 1. We got a 429 from the backend (searchBlocked), OR
  // 2. Entitlements say no access AND user is anonymous (already blocked before search)
  const showWall = searchBlocked || (isLoaded && !hasAccess && isAnonymous)

  return (
    <>
      <div className="flex-1 bg-transparent text-card-foreground">
        {showWall ? (
          /* ── Signup Wall ── */
          <SearchLimitWall />
        ) : (!hasRequested || isLoading || isFetching) ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className={`mt-0 max-w-full lg:grid lg:items-start transition-[grid-template-columns] duration-300 ease-in-out ${isAiCollapsed ? 'lg:grid-cols-[1fr_48px]' : 'lg:grid-cols-[1fr_560px]'}`}>
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

            <div className="hidden lg:flex lg:flex-col lg:ml-0 lg:mr-0 sticky top-0 h-[calc(100vh-5rem)] overflow-hidden border-l bg-card">
              {/* Collapsed strip */}
              <button
                onClick={() => setIsAiCollapsed(!isAiCollapsed)}
                className={`flex flex-col items-center gap-2 w-full pt-5 transition-opacity duration-200 ${isAiCollapsed ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none absolute'
                  }`}
                title="Open AI Assistant"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <PanelRightOpen className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase -rotate-180" style={{ writingMode: 'vertical-rl' }}>AI Assistant</span>
              </button>

              {/* Full panel */}
              <div className={`absolute inset-0 transition-all duration-300 ${isAiCollapsed ? 'opacity-0 pointer-events-none translate-x-4' : 'opacity-100 translate-x-0'}`}>
                {/* Close button inside panel */}
                <button
                  onClick={() => setIsAiCollapsed(true)}
                  className="absolute right-3 top-3 z-30 h-8 w-8 rounded-full border bg-background/80 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Close AI Assistant"
                >
                  <PanelRightClose className="h-4 w-4" />
                </button>
                <AiCompletion externalPrompt={externalPrompt} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}