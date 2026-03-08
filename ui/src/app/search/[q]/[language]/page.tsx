"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { usePlayerStore } from "@/stores/use-player-store"
import { useSearchStore } from "@/stores/use-search-store"
import { useInfiniteSearch } from "@/lib/useApi"
import { useEntitlements } from "@/hooks/use-entitlements"
import { useAuthStore } from "@/stores/auth-store"
import { Loader2, Bot, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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
import { NoResults } from "@/components/features/search/no-results"

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
  const [mobileTab, setMobileTab] = useState<"player" | "ai">("player")

  // Auto-switch to AI tab when a word meaning is requested (mobile)
  useEffect(() => {
    if (externalPrompt) setMobileTab("ai")
  }, [externalPrompt])

  // Track if the search was blocked by a 429 response
  const [searchBlocked, setSearchBlocked] = useState(false)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
    refetch
  } = useInfiniteSearch(q, languageParam, categoryForContext, subCategory)

  const playlist = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page.hits || [])
  }, [data])

  const totalHits = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return 0
    return data.pages[0].total || 0
  }, [data])

  const aggregations = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return {}
    return data.pages[0].aggregations || {}
  }, [data])

  // Pre-fetch next page when nearing the end of the playlist
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return

    const clipsRemaining = playlist.length - currentVideoIndex - 1
    // If we're within 10 clips of the end, fetch the next batch seamlessly
    if (clipsRemaining <= 10) {
      fetchNextPage()
    }
  }, [currentVideoIndex, playlist.length, hasNextPage, isFetchingNextPage, fetchNextPage])

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
    resetIndex() // Reset index at the start of a new search
    refetch()

    setQuery(q)
    setCategory(categoryForContext)
    setLanguage(languageParam)

    try {
      localStorage.setItem("last_search_query", q)
    } catch { }

    setSearchQuery(q)
  }, [q, languageParam, categoryForContext, subCategory, refetch, setQuery, setCategory, setLanguage])

  // (Removed effect that resetted index on data change, which broke infinite scroll)

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
        ) : (!hasRequested || isLoading || (isFetching && playlist.length === 0)) ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className={cn(
            "mt-0 max-w-full xl:grid xl:items-start transition-[grid-template-columns] duration-300 ease-in-out",
            playlist.length === 0
              ? "xl:grid-cols-1"
              : (isAiCollapsed ? "xl:grid-cols-[1fr_48px]" : "xl:grid-cols-[1fr_560px]")
          )}>

            {/* ── Mobile/Tablet Tab Bar (below xl) ── */}
            {playlist.length > 0 && (
              <div className="xl:hidden flex items-center gap-1 px-4 pt-3 sm:px-6">
                <button
                  onClick={() => setMobileTab("player")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mobileTab === "player"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Play className="h-3.5 w-3.5" />
                  Player
                </button>
                <button
                  onClick={() => setMobileTab("ai")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mobileTab === "ai"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  AI Assistant
                </button>
              </div>
            )}

            {/* ── Player content or Empty State ── */}
            <div className={`space-y-4 p-4 sm:p-6 pb-12 xl:pb-6 ${mobileTab !== "player" ? "hidden xl:block" : ""}`}>
              {playlist.length === 0 && !isLoading && !isFetching ? (
                <NoResults query={q} />
              ) : (
                <>
                  <VideoPlayerCard
                    playlist={playlist}
                    isFetching={isFetching || isFetchingNextPage}
                    aggregations={aggregations}
                  />
                  <AudioCard
                    currentClip={playlist[currentVideoIndex]}
                    playlist={playlist}
                    totalItems={totalHits}
                    searchQuery={searchQuery}
                    onExplainWordPrompt={(prompt) => setExternalPrompt(prompt)}
                  />
                </>
              )}
            </div>

            {/* ── Mobile/Tablet AI Panel (below xl) ── */}
            {playlist.length > 0 && (
              <div className={`xl:hidden ${mobileTab !== "ai" ? "hidden" : ""}`}>
                <div className="h-[calc(100vh-10rem)] overflow-hidden bg-card">
                  <AiCompletion externalPrompt={externalPrompt} />
                </div>
              </div>
            )}

            {/* ── Desktop AI Panel (xl+) ── */}
            {playlist.length > 0 && (
              <div className="hidden xl:block relative sticky top-0 h-[calc(100vh-5rem)] border-l bg-card">

                {/* Sidebar-style toggle — sits on the left border line, outside overflow-hidden so it's never clipped */}
                <button
                  onClick={() => setIsAiCollapsed(!isAiCollapsed)}
                  className="absolute -left-3 top-8 w-6 h-6 bg-popover border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all z-50 shadow-lg cursor-pointer group"
                  title={isAiCollapsed ? "Open AI Assistant" : "Close AI Assistant"}
                >
                  {isAiCollapsed
                    ? <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    : <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
                </button>

                {/* Inner panel — overflow-hidden only here, not on the button's parent */}
                <div className="h-full overflow-hidden">
                  <div className={`absolute inset-0 transition-all duration-300 ${isAiCollapsed ? 'opacity-0 pointer-events-none translate-x-4' : 'opacity-100 translate-x-0'}`}>
                    <AiCompletion externalPrompt={externalPrompt} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}