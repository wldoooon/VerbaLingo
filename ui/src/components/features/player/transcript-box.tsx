"use client"

import { useMemo, useEffect } from "react"
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
  onSearchWord?: (word: string) => void
  onExplainWordInContext?: (payload: { word: string; sentence: string }) => void
  onTranscriptDetermined?: (snippet: string) => void
}

export const TranscriptBox = ({
  sentences,
  searchQuery,
  isTranscriptLoading,
  onSearchWord,
  onExplainWordInContext,
  onTranscriptDetermined,
}: TranscriptBoxProps) => {
  // Zustand selector: only triggers re-render when the sentence INDEX changes.
  // Handles gaps between sentences by returning the most recently passed sentence
  // (sentences are sorted by start_time from audio-card's sanitizedSentences).
  // No refs needed — the selector itself is the sticky engine.
  const activeIdx = usePlayerStore(state => {
    if (sentences.length === 0) return -1
    const TIMING_LEAD = 0.05 * state.playbackRate
    const t = state.currentTime + TIMING_LEAD

    // Exact match: currentTime is within a sentence
    const exact = sentences.findIndex(s => t >= s.start_time && t < s.end_time)
    if (exact !== -1) return exact

    // Gap/silence: return the last sentence whose start we've passed.
    // Since sentences are sorted, scan forward and stop when we overshoot.
    let last = -1
    for (let i = 0; i < sentences.length; i++) {
      if (t >= sentences[i].start_time) last = i
      else break
    }
    return last
  })

  // Find the trio: Previous, Active, and Next.
  // Pure computation — no ref mutations, safe for Concurrent Mode.
  // When activeIdx is -1 but sentences exist, fall back to showing the first sentence.
  // This prevents the "Waiting for playback..." ghost state that occurs because
  // currentTime in the store is still 0 while the YouTube player hasn't fired
  // its first onStateChange yet.
  const trio = useMemo(() => {
    if (sentences.length === 0) return null

    const idx = activeIdx === -1 ? 0 : activeIdx
    const active = sentences[idx]
    if (!active) return null

    return {
      prev: sentences[idx - 1],
      active,
      next: sentences[idx + 1],
    }
  }, [activeIdx, sentences])

  // Broadcast the live-updating context snippet up to the AI
  useEffect(() => {
    if (trio && onTranscriptDetermined) {
      const prev = trio.prev?.sentence_text || ""
      const curr = trio.active?.sentence_text || ""
      const next = trio.next?.sentence_text || ""
      const parts: string[] = []
      if (prev) parts.push(`[Before]: "${prev}"`)
      if (curr) parts.push(`[★ Now Playing]: "${curr}"`)
      if (next) parts.push(`[After]: "${next}"`)
      onTranscriptDetermined(parts.join("\n"))
    }
  }, [trio, onTranscriptDetermined])

  return (
    <div className="relative mt-1 h-[180px] flex items-center justify-center overflow-hidden">
      {/* Simple, clean brand background */}

      <div className="relative w-full px-4">
        <AnimatePresence mode="popLayout">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "circOut" }}
              className="flex flex-col items-center gap-4 py-4"
            >
              {/* Previous Context */}
              <div className="opacity-100 scale-100 transition-all duration-300 pointer-events-none hidden sm:block">
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
              <div className="opacity-100 scale-100 transition-all duration-300 pointer-events-none hidden sm:block">
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
              key="waiting"
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
