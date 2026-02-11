"use client"

import { memo, RefObject } from "react"
import { cn } from "@/lib/utils"
import { TranscriptWord } from "./transcript-word"
import { usePlayerStore } from "@/stores/use-player-store"
import { normalizeTranscriptWords } from "@/lib/player-utils"

type Word = { text: string; start: number; end: number }
type Sentence = {
  start_time: number
  end_time: number
  sentence_text?: string
  words?: Word[]
}

type SentenceGroupProps = {
  group: Sentence[]
  groupIdx: number
  centerIdx: number
  searchQuery: string
  activeSentenceRef: RefObject<HTMLDivElement | null>
  targetSentenceRef: RefObject<HTMLDivElement | null>
  isTargetGroup: boolean | null
  onSearchWord?: (word: string) => void
  onExplainWordInContext?: (payload: { word: string; sentence: string }) => void
}

export const SentenceGroup = memo(({
  group,
  groupIdx,
  centerIdx,
  searchQuery,
  activeSentenceRef,
  targetSentenceRef,
  isTargetGroup,
  onSearchWord,
  onExplainWordInContext,
}: SentenceGroupProps) => {
  const groupStart = group[0].start_time
  const groupEnd = group[group.length - 1].end_time

  // Only re-render the group opacity/blur when the active state changes
  const isActive = usePlayerStore(state => {
    const TIMING_LEAD = 0.08
    const adjustedTime = state.currentTime + TIMING_LEAD
    return adjustedTime >= groupStart && adjustedTime < groupEnd
  })

  const distance = Math.abs(groupIdx - centerIdx)
  if (distance > 1) return null

  return (
    <div
      ref={
        isActive
          ? activeSentenceRef
          : isTargetGroup
            ? targetSentenceRef
            : null
      }
      className={cn(
        "mb-1 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-center text-center px-4",
        groupIdx === centerIdx
          ? "opacity-100 scale-100 blur-none py-5"
          : "opacity-30 scale-95 blur-[0.5px] py-1 grayscale",
      )}
    >
      <div className="relative text-base leading-relaxed inline-block">
        {group.map((sentence, sIdx) => {
          const query = searchQuery.toLowerCase().trim()
          const rawWords = (sentence.words as Word[] | undefined) || []
          const words = normalizeTranscriptWords(rawWords)

          return (
            <span key={`${sentence.start_time}-${sIdx}`}>
              {words.map((w, wi) => {
                const wordText = (w.text || "").trim()
                const queryParts = query.split(/\s+/).filter(part => part.length > 0)
                const isSearchMatch = queryParts.length > 0 && queryParts.some(part => {
                  const cleanWord = wordText.toLowerCase().replace(/[.,!?;:()\[\]{}"']/g, '');
                  return cleanWord === part.toLowerCase();
                })

                return (
                  <TranscriptWord
                    key={`${sentence.start_time}-${w.start}-${wi}`}
                    wordText={wordText}
                    start={w.start}
                    end={w.end}
                    isSearchMatch={isSearchMatch}
                    onSearchWord={onSearchWord}
                    onExplainWordInContext={(word) => {
                      const sentenceText =
                        sentence.sentence_text ||
                        words.map((ww: Word) => ww.text).join(" ")
                      onExplainWordInContext?.({
                        word,
                        sentence: sentenceText,
                      })
                    }}
                  />
                )
              })}
            </span>
          )
        })}
      </div>
    </div>
  )
})

SentenceGroup.displayName = "SentenceGroup"
