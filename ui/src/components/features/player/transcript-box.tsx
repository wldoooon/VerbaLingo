"use client"

import { RefObject, useState, useMemo, useEffect } from "react"
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
}: TranscriptBoxProps) => {
  // Group sentences into chunks of 3
  const sentenceGroups = useMemo(() => {
    const groups: Sentence[][] = []
    for (let i = 0; i < sentences.length; i += 3) {
      groups.push(sentences.slice(i, i + 3))
    }
    return groups
  }, [sentences])

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

  const [centerIdx, setCenterIdx] = useState(0)

  // Only update center index when the active group actually changes
  useEffect(() => {
    if (activeGroupIdx !== -1) {
      setCenterIdx(activeGroupIdx)
    }
  }, [activeGroupIdx])

  return (
    <div className="relative mt-1">
      {/* Top fade gradient */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent z-10 rounded-t-2xl" />

      <div
        ref={scrollContainerRef}
        className="max-h-[200px] overflow-y-auto rounded-2xl px-3 py-3 scroll-smooth flex flex-col items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {isTranscriptLoading ? (
          <div className="w-full py-8 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/40 border-t-primary animate-spin" />
          </div>
        ) : sentenceGroups.length > 0 ? (
          sentenceGroups.map((group, groupIdx) => (
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
          ))
        ) : null}
      </div>

      {/* Bottom fade gradient */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent z-10 rounded-b-2xl" />
    </div >
  )
}