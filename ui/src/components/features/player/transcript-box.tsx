"use client"

import { RefObject, useState, useMemo, useEffect, useRef } from "react"
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
  scrollContainerRef: RefObject<HTMLDivElement | null>
  activeSentenceRef: RefObject<HTMLDivElement | null>
  targetSentenceRef: RefObject<HTMLDivElement | null>
  targetSentence: Sentence | undefined
  onSearchWord?: (word: string) => void
  onExplainWordInContext?: (payload: { word: string; sentence: string }) => void
  isHoveredParent?: boolean
  onHoverChange?: (hovered: boolean) => void
}

export const TranscriptBox = ({
  sentences,
  searchQuery,
  isTranscriptLoading,
  scrollContainerRef,
  activeSentenceRef,
  targetSentenceRef,
  targetSentence,
  onSearchWord,
  onExplainWordInContext,
  isHoveredParent,
  onHoverChange,
}: TranscriptBoxProps) => {
  // No more merging! Each sentence is its own individual group
  const flatGroups = useMemo(() => {
    return sentences.map(s => [s])
  }, [sentences])

  // Find which index contains our target (search hit) sentence
  const targetIdx = useMemo(() => {
    if (!targetSentence) return 0
    const idx = sentences.findIndex(s => s.start_time === targetSentence.start_time)
    return Math.max(0, idx)
  }, [sentences, targetSentence])

  // Track the active sentence index
  const activeIdx = usePlayerStore(state => {
    const TIMING_LEAD = 0.08
    const adjustedTime = state.currentTime + TIMING_LEAD
    return sentences.findIndex((s) => adjustedTime >= s.start_time && adjustedTime < s.end_time)
  })

  // THE FIX: Memory and Priority
  const lastValidIdx = useRef(-1)
  const currentKey = `${targetSentence?.start_time}-${sentences.length}`
  const lastKey = useRef("")
  
  const centerIdx = useMemo(() => {
    if (currentKey !== lastKey.current) {
      lastKey.current = currentKey
      lastValidIdx.current = targetIdx
    }

    if (activeIdx !== -1) {
      lastValidIdx.current = activeIdx
      return activeIdx
    }
    return lastValidIdx.current !== -1 ? lastValidIdx.current : targetIdx
  }, [activeIdx, targetIdx, currentKey])

  return (
    <div className="relative mt-1">
      {/* Top fade gradient */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent z-10 rounded-t-2xl" />

      <div
        ref={scrollContainerRef}
        className="max-h-[200px] overflow-hidden rounded-2xl px-3 py-3 scroll-smooth flex flex-col items-stretch touch-action-none pointer-events-none"
      >
        {isTranscriptLoading ? (
          <div className="w-full py-4 space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-2 px-6">
              <Skeleton className="h-4 w-[90%] rounded-full opacity-40" />
              <Skeleton className="h-4 w-[75%] rounded-full opacity-20" />
            </div>
            <div className="flex flex-col items-center gap-2 px-6">
              <Skeleton className="h-4 w-[85%] rounded-full opacity-30" />
              <Skeleton className="h-4 w-[60%] rounded-full opacity-10" />
            </div>
          </div>
        ) : flatGroups.length > 0 ? (
          <>
            {/* Top Spacer for centering the first item */}
            <div className="h-[100px] shrink-0 pointer-events-none" aria-hidden="true" />
            
            {flatGroups.map((group: Sentence[], groupIdx: number) => (
              <div key={`${group[0].start_time}-${groupIdx}`} className="pointer-events-auto">
                <SentenceGroup
                  group={group}
                  groupIdx={groupIdx}
                  centerIdx={centerIdx}
                  searchQuery={searchQuery}
                  activeSentenceRef={activeSentenceRef}
                  targetSentenceRef={targetSentenceRef}
                  isTargetGroup={targetSentence ? group.some((s: Sentence) => s.start_time === targetSentence.start_time) : false}
                  onSearchWord={onSearchWord}
                  onExplainWordInContext={onExplainWordInContext}
                />
              </div>
            ))}

            {/* Bottom Spacer for centering the last item */}
            <div className="h-[100px] shrink-0 pointer-events-none" aria-hidden="true" />
          </>
        ) : null}
      </div>

      {/* Bottom fade gradient */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent z-10 rounded-b-2xl" />
    </div >
  )
}