"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlayerStore } from "@/stores/use-player-store"
import { SentenceGroup } from "./sentence-group"

type Word = { text: string; start: number; end: number }
type Sentence = {
  start_time: number
  end_time: number
  sentence_text?: string
  words?: Word[]
}

type TranscriptBoxProps = {
  sentences: Sentence[]
  searchQuery: string
  isTranscriptLoading: boolean
  targetSentence: Sentence | undefined
  onSearchWord?: (word: string) => void
  onExplainWordInContext?: (payload: { word: string; sentence: string }) => void
}

export const TranscriptBox = ({
  sentences,
  searchQuery,
  isTranscriptLoading,
  targetSentence,
  onSearchWord,
  onExplainWordInContext,
}: TranscriptBoxProps) => {
  const currentTime = usePlayerStore(state => state.currentTime)

  // Find the trio: Previous, Active, and Next
  const trio = useMemo(() => {
    const TIMING_LEAD = 0.08
    const t = currentTime + TIMING_LEAD
    
    // Find active index
    let activeIdx = sentences.findIndex(s => t >= s.start_time && t < s.end_time)
    
    // Fallback to target if not found
    if (activeIdx === -1 && targetSentence) {
      activeIdx = sentences.findIndex(s => s.start_time === targetSentence.start_time)
    }

    if (activeIdx === -1) return null

    return {
      prev: sentences[activeIdx - 1],
      active: sentences[activeIdx],
      next: sentences[activeIdx + 1],
      activeIdx
    }
  }, [currentTime, sentences, targetSentence])

  return (
    <div className="relative mt-2 h-[220px] flex items-center justify-center rounded-3xl bg-card/40 border border-primary/5 shadow-inner overflow-hidden">
      {/* Immersive background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 opacity-50" />
      
      <div className="relative w-full px-4">
        <AnimatePresence mode="wait">
          {isTranscriptLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <Skeleton className="h-6 w-3/4 rounded-full opacity-30" />
              <Skeleton className="h-6 w-1/2 rounded-full opacity-10" />
            </motion.div>
          ) : trio ? (
            <motion.div
              key={trio.active.start_time}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center gap-4 py-4"
            >
              {/* Previous Context */}
              <div className="opacity-20 scale-95 blur-[0.5px] transition-all duration-300 pointer-events-none hidden sm:block">
                {trio.prev && (
                  <SentenceGroup
                    group={[trio.prev]}
                    searchQuery={searchQuery}
                    onSearchWord={onSearchWord}
                    onExplainWordInContext={onExplainWordInContext}
                  />
                )}
              </div>

              {/* ACTIVE FOCUS */}
              <div className="opacity-100 scale-100 shadow-sm transition-all duration-300">
                <SentenceGroup
                  group={[trio.active]}
                  searchQuery={searchQuery}
                  onSearchWord={onSearchWord}
                  onExplainWordInContext={onExplainWordInContext}
                />
              </div>

              {/* Next Context */}
              <div className="opacity-20 scale-95 blur-[0.5px] transition-all duration-300 pointer-events-none hidden sm:block">
                {trio.next && (
                  <SentenceGroup
                    group={[trio.next]}
                    searchQuery={searchQuery}
                    onSearchWord={onSearchWord}
                    onExplainWordInContext={onExplainWordInContext}
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground/40 italic text-sm text-center"
            >
              Waiting for playback...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}