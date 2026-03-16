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
  // Group sentences into chunks of 3
  const sentenceGroups = useMemo(() => {
    const groups: Sentence[][] = []
    for (let i = 0; i < sentences.length; i += 3) {
      groups.push(sentences.slice(i, i + 3))
    }
    return groups
  }, [sentences])

  // Find which group contains our target (search hit) sentence
  const targetGroupIdx = useMemo(() => {
    if (!targetSentence) return 0
    const idx = sentenceGroups.findIndex(group => 
      group.some(s => s.start_time === targetSentence.start_time)
    )
    return Math.max(0, idx)
  }, [sentenceGroups, targetSentence])

  // OPTIMIZATION: Only track the index of the active group to minimize container re-renders
  const activeGroupIdx = usePlayerStore(state => {
    const TIMING_LEAD = 0.08
    const adjustedTime = state.currentTime + TIMING_LEAD
    return sentenceGroups.findIndex((group) => {
      const s = group[0].start_time
      const e = group[group.length - 1].end_time
      return adjustedTime >= s && adjustedTime < e
    })
  })

  // THE FIX: Memory and Priority
  // We use a ref to remember where we were so we don't "jump" during silences
  const lastValidIdx = useRef(-1)
  
  // Initialize or Reset the ref when the target/sentences change
  const currentKey = `${targetSentence?.start_time}-${sentences.length}`
  const lastKey = useRef("")
  
  const centerIdx = useMemo(() => {
    // If the video changed, reset the lastValidIdx immediately
    if (currentKey !== lastKey.current) {
      lastKey.current = currentKey
      lastValidIdx.current = targetGroupIdx
    }

    if (activeGroupIdx !== -1) {
      lastValidIdx.current = activeGroupIdx
      return activeGroupIdx
    }
    
    // If no active sentence found (gap/loading), stay anchored to our memory
    return lastValidIdx.current !== -1 ? lastValidIdx.current : targetGroupIdx
  }, [activeGroupIdx, targetGroupIdx, currentKey])

  return (
    <div className="relative mt-1">
      {/* Top fade gradient */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent z-10 rounded-t-2xl" />

      <div
        ref={scrollContainerRef}
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
        className="max-h-[200px] overflow-y-auto rounded-2xl px-3 py-3 scroll-smooth flex flex-col items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
        ) : sentenceGroups.length > 0 ? (
          <>
            {/* Top Spacer for centering the first item */}
            <div className="h-[100px] shrink-0 pointer-events-none" aria-hidden="true" />
            
            {sentenceGroups.map((group, groupIdx) => (
              <SentenceGroup
                key={`${group[0].start_time}-${groupIdx}`}
                group={group}
                groupIdx={groupIdx}
                centerIdx={centerIdx}
                searchQuery={searchQuery}
                activeSentenceRef={activeSentenceRef}
                targetSentenceRef={targetSentenceRef}
                isTargetGroup={targetSentence ? group.some(s => s.start_time === targetSentence.start_time) : false}
                onSearchWord={onSearchWord}
                onExplainWordInContext={onExplainWordInContext}
              />
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