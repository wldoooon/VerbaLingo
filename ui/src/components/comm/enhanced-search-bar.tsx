"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, ChevronRight, Play, Clock, Film, Tv, Gamepad2, Book, Music, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDebouncedValue } from "@mantine/hooks"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/animate-ui/components/radix/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearch } from "@/lib/useApi"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import type { Clips } from "@/lib/types"

// Category configuration with icons
const CATEGORIES = [
  { value: null, label: "All Categories", icon: Sparkles, color: "text-purple-500" },
  { value: "movies", label: "Movies", icon: Film, color: "text-blue-500" },
  { value: "tv", label: "TV Shows", icon: Tv, color: "text-green-500" },
  { value: "games", label: "Games", icon: Gamepad2, color: "text-orange-500" },
  { value: "books", label: "Books", icon: Book, color: "text-pink-500" },
  { value: "music", label: "Music", icon: Music, color: "text-indigo-500" },
] as const

export default function EnhancedSearchBar() {
  const [open, setOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState("")
  const [localCategory, setLocalCategory] = useState<string | null>(null)
  
  // Debounce search query for real-time search (300ms)
  const [debouncedQuery] = useDebouncedValue(localQuery, 300)
  
  const { query, category, setQuery, setCategory } = useSearchParams()
  const { dispatch } = usePlayerContext()
  
  const { data, error, isLoading, refetch } = useSearch(
    debouncedQuery,
    localCategory,
  )

  // Auto-search on debounced query change
  useEffect(() => {
    if (debouncedQuery.trim() && open) {
      refetch()
    }
  }, [debouncedQuery, localCategory, refetch, open])

  // Handle Enter key for random clip selection
  const handleRandomSelection = useCallback(() => {
    if (data?.hits.length) {
      const randomIndex = Math.floor(Math.random() * data.hits.length)
      dispatch({ type: 'SET_INDEX', payload: randomIndex })
      setQuery(debouncedQuery.trim())
      setCategory(localCategory)
      setOpen(false)
    }
  }, [data, dispatch, debouncedQuery, localCategory, setQuery, setCategory])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && debouncedQuery.trim()) {
      handleRandomSelection()
    }
  }

  // Handle specific clip selection
  const handleClipSelect = useCallback((clipIndex: number) => {
    dispatch({ type: 'SET_INDEX', payload: clipIndex })
    setQuery(debouncedQuery.trim())
    setCategory(localCategory)
    setOpen(false)
  }, [dispatch, debouncedQuery, localCategory, setQuery, setCategory])

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Reset on dialog close
  useEffect(() => {
    if (!open) {
      setLocalQuery("")
      setLocalCategory(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-10 justify-between text-muted-foreground cursor-text hover:bg-transparent hover:text-muted-foreground rounded-full"
        >
          Search for a word...
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="p-0 gap-0 max-w-7xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] fixed"
        overlayClassName="backdrop-blur-md bg-black/60"
        showCloseButton={true}
      >
        <DialogTitle className="sr-only">Search for video clips</DialogTitle>
        
        {/* Search Input Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search for a word or phrase..."
            className="w-full h-10 border-none bg-transparent p-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          {data?.hits.length && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-medium text-foreground">{data.total}</span> results
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground/80">Press Enter for random</span>
            </div>
          )}
        </div>

        {/* Main Content: Sidebar + Results */}
        <div className="flex h-[calc(85vh-73px)]">
          {/* Category Sidebar */}
          <CategorySidebar
            selectedCategory={localCategory}
            onSelectCategory={setLocalCategory}
            resultsCount={data?.hits.length || 0}
          />

          {/* Results Grid */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {isLoading && <SearchLoadingSkeleton />}
                {error && (
                  <div className="text-center py-12">
                    <p className="text-sm text-destructive">{error.message}</p>
                  </div>
                )}
                {!isLoading && !error && !data && !localQuery.trim() && (
                  <EmptyState />
                )}
                {!isLoading && !error && localQuery.trim() && !data?.hits.length && (
                  <NoResultsState query={localQuery} />
                )}
                {data?.hits && data.hits.length > 0 && (
                  <VideoResultsGrid
                    clips={data.hits}
                    onClipSelect={handleClipSelect}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Category Sidebar Component
function CategorySidebar({ 
  selectedCategory, 
  onSelectCategory,
  resultsCount 
}: { 
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  resultsCount: number
}) {
  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-foreground">Categories</h3>
        <p className="text-xs text-muted-foreground mt-1">Filter your search</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.value
            
            return (
              <motion.button
                key={category.label}
                onClick={() => onSelectCategory(category.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", isSelected ? "" : category.color)} />
                <span className="flex-1 text-left">{category.label}</span>
                {isSelected && resultsCount > 0 && (
                  <span className="text-xs bg-background/20 px-1.5 py-0.5 rounded">
                    {resultsCount}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// Video Results Grid Component
function VideoResultsGrid({ 
  clips, 
  onClipSelect 
}: { 
  clips: Clips[]
  onClipSelect: (index: number) => void 
}) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {clips.map((clip, index) => (
        <VideoThumbnail
          key={`${clip.video_id}-${clip.start_time}-${index}`}
          clip={clip}
          index={index}
          onSelect={onClipSelect}
        />
      ))}
    </motion.div>
  )
}

// Video Thumbnail Component with Lazy Loading
function VideoThumbnail({ 
  clip, 
  index, 
  onSelect 
}: { 
  clip: Clips
  index: number
  onSelect: (index: number) => void 
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "100px"
  })

  const thumbnailUrl = `https://i.ytimg.com/vi/${clip.video_id}/mqdefault.jpg`
  const duration = Math.round(clip.end_time - clip.start_time)

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={() => onSelect(index)}
    >
      <div className="relative rounded-lg overflow-hidden bg-muted border border-border hover:border-primary transition-all shadow-sm hover:shadow-md">
        {/* Thumbnail Image */}
        <div className="relative aspect-video bg-muted">
          {inView ? (
            <>
              <img
                src={thumbnailUrl}
                alt={clip.sentence_text}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-primary rounded-full p-3">
                    <Play className="h-6 w-6 text-primary-foreground fill-current" />
                  </div>
                </div>
              </div>
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration}s
              </div>
            </>
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
            "{clip.sentence_text}"
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="truncate">{clip.video_title || 'Video'}</span>
            {clip.category && (
              <>
                <span>•</span>
                <span className="capitalize">{clip.category}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Loading Skeleton
function SearchLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden border border-border">
          <Skeleton className="aspect-video w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Empty State (no search yet)
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <Search className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Start your search</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Type a word or phrase to find video clips. Select a category to narrow your results.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <kbd className="px-2 py-1 bg-muted rounded border text-foreground font-mono">Enter</kbd>
        <span>to select random clip</span>
      </div>
    </motion.div>
  )
}

// No Results State
function NoResultsState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        We couldn't find any clips for "<span className="font-medium text-foreground">{query}</span>". 
        Try a different word or phrase.
      </p>
    </motion.div>
  )
}
