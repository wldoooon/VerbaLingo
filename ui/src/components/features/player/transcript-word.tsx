"use client"

import { memo, useState } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Sparkles, Bookmark } from "lucide-react"
import { usePlayerStore } from "@/stores/use-player-store"

type TranscriptWordProps = {
  wordText: string
  start: number
  end: number
  isSearchMatch: boolean
  onSearchWord?: (word: string) => void
  onExplainWordInContext?: (word: string) => void
}

export const TranscriptWord = memo(({
  wordText,
  start,
  end,
  isSearchMatch,
  onSearchWord,
  onExplainWordInContext,
}: TranscriptWordProps) => {
  const [isOpen, setIsOpen] = useState(false)

  // CRITICAL OPTIMIZATION: Only subscribe to the highlight state of THIS specific word.
  // Component will only re-render when isCurrentWord toggles.
  const isCurrentWord = usePlayerStore(state => {
    const TIMING_LEAD = 0.08
    const adjustedTime = state.currentTime + TIMING_LEAD
    return adjustedTime >= start && adjustedTime < end
  })

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex"
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "mr-1 px-0.8 py-0.5 border-2 border-transparent rounded-md transition-colors duration-200 ease-in-out text-left inline-flex items-center",
              isSearchMatch && !isCurrentWord &&
              "bg-primary text-primary-foreground font-semibold",
              isCurrentWord &&
              "border-primary font-semibold bg-accent/20",
              !isCurrentWord && !isSearchMatch && "hover:bg-accent/40 hover:text-foreground",
            )}
          >
            {wordText || "\u00A0"}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 p-3 rounded-[1.3rem] border border-border/50 bg-popover/80 backdrop-blur-xl shadow-xl"
          align="start"
        >
          <div className="space-y-1 text-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground px-1">
              {wordText}
            </div>
            <div className="h-px w-full bg-border/60 my-1" />
            <button
              className="w-full flex items-center gap-2 text-left px-2 py-1 rounded-md hover:bg-muted/80"
              onClick={() => onSearchWord?.(wordText)}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span>Search clips for "{wordText}"</span>
            </button>
            <div className="h-px w-full bg-border/60 my-1" />
            <button
              className="w-full flex items-center gap-2 text-left px-2 py-1 rounded-md hover:bg-muted/80"
              onClick={() => onExplainWordInContext?.(wordText)}
            >
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span>Meaning in this context</span>
            </button>
            <div className="h-px w-full bg-border/60 my-1" />
            <button className="w-full flex items-center gap-2 text-left px-2 py-1 rounded-md hover:bg-muted/80">
              <Bookmark className="h-4 w-4 text-muted-foreground" />
              <span>Save word</span>
            </button>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  )
})

TranscriptWord.displayName = "TranscriptWord"
