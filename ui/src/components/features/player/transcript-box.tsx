"use client"

import { useMemo, useRef } from "react"
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
  // THE STICKY ENGINE: Remembers where we are to prevent jumping during gaps
  const lastValidIdx = useRef<number>(-1)
  const lastKey = useRef("")

  // Zustand selector: only returns a NEW value (and triggers re-render) when the
  // active sentence INDEX changes — not on every currentTime tick.
  // Lead is scaled with playbackRate: at 2× speed the rAF lag doubles in video-time.
  const activeSentenceIdx = usePlayerStore(state => {
    const TIMING_LEAD = 0.05 * state.playbackRate
    const t = state.currentTime + TIMING_LEAD
    return sentences.findIndex(s => t >= s.start_time && t < s.end_time)
  })

  // Find the trio: Previous, Active, and Next
  const trio = useMemo(() => {
    if (sentences.length === 0) return null

    let activeIdx = activeSentenceIdx

    // Video/Clip changed? Reset memory to the target hit
    const currentKey = `${targetSentence?.start_time}-${sentences.length}`
    if (currentKey !== lastKey.current) {
      lastKey.current = currentKey
      const targetIdx = targetSentence
        ? sentences.findIndex(s => s.start_time === targetSentence.start_time)
        : 0
      lastValidIdx.current = Math.max(0, targetIdx)
    }

    // Update memory if we found a new active sentence
    if (activeIdx !== -1) {
      lastValidIdx.current = activeIdx
    } else {
      // SILENCE detected: Use the last known sentence (Sticky Mode)
      activeIdx = lastValidIdx.current
    }

    if (activeIdx === -1) return null

    // Safety: index could be stale/out-of-bounds after a video switch
    const active = sentences[activeIdx]
    if (!active) return null

    return {
      prev: sentences[activeIdx - 1],
      active,
      next: sentences[activeIdx + 1],
      activeIdx
    }
  }, [activeSentenceIdx, sentences, targetSentence])

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
