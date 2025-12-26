"use client"

import { RefObject, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Sparkles, Bookmark } from "lucide-react"

type Word = { text: string; start: number; end: number }

function normalizeTranscriptWords(words: Word[]): Word[] {
  if (!words || words.length === 0) return []

  const normalized: Word[] = []

  // First pass: normalize split words
  const tempWords: Word[] = []
  for (const w of words) {
    const text = (w.text || "").trim()
    if (!text) continue

    if (text.includes(" ")) {
      const parts = text.split(/\s+/)
      const totalLength = parts.reduce((acc, p) => acc + p.length, 0)
      const duration = w.end - w.start
      let currentTime = w.start

      parts.forEach((part) => {
        const weight = totalLength > 0 ? part.length / totalLength : 1 / parts.length
        const partDuration = duration * weight

        tempWords.push({
          text: part,
          start: currentTime,
          end: currentTime + partDuration,
        })
        currentTime += partDuration
      })
    } else {
      tempWords.push(w)
    }
  }

  // Second pass: cap long durations to average
  if (tempWords.length > 0) {
    const totalDuration = tempWords.reduce((acc, w) => acc + (w.end - w.start), 0)
    const avgDuration = totalDuration / tempWords.length

    // Cap at average duration or 0.7s, whichever is smaller
    // This ensures highlights don't linger on long words
    const capThreshold = Math.min(avgDuration, 0.7)

    for (const w of tempWords) {
      const duration = w.end - w.start
      if (duration > capThreshold) {
        normalized.push({
          ...w,
          end: w.start + capThreshold
        })
      } else {
        normalized.push(w)
      }
    }
  }

  return normalized
}

type Sentence = {
  start_time: number
  end_time: number
  sentence_text?: string
  words?: Word[]
}

type TranscriptBoxProps = {
  sentences: Sentence[]
  searchQuery: string
  currentTime: number
  isTranscriptLoading: boolean
  scrollContainerRef: RefObject<HTMLDivElement | null>
  activeSentenceRef: RefObject<HTMLDivElement | null>
  targetSentenceRef: RefObject<HTMLDivElement | null>
  targetSentence: Sentence | undefined
  lastActiveSentenceIdxRef: RefObject<number>
  onSearchWord?: (word: string) => void
  onExplainWordInContext?: (payload: { word: string; sentence: string }) => void
}
export const TranscriptBox = ({
  sentences,
  searchQuery,
  currentTime,
  isTranscriptLoading,
  scrollContainerRef,
  activeSentenceRef,
  targetSentenceRef,
  targetSentence,
  lastActiveSentenceIdxRef,
  onSearchWord,
  onExplainWordInContext,
}: TranscriptBoxProps) => {
  const [openWordKey, setOpenWordKey] = useState<string | null>(null)

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
        ) : sentences.length > 0 ? (
          (() => {
            // Group sentences into chunks of 3
            const sentenceGroups: Sentence[][] = []
            for (let i = 0; i < sentences.length; i += 3) {
              sentenceGroups.push(sentences.slice(i, i + 3))
            }

            return sentenceGroups.map((group, groupIdx) => {
              const groupStart = group[0].start_time
              const groupEnd = group[group.length - 1].end_time

              const TIMING_LEAD = 0.08

              // If video is at adjacent start (loading) but we have a specific search target, 
              // force the UI to focus on the target sentence immediately.
              const isInitialLoad = currentTime < 1 && targetSentence

              const adjustedTime = isInitialLoad
                ? targetSentence!.start_time + 0.01
                : currentTime + TIMING_LEAD

              const isActive =
                adjustedTime >= groupStart &&
                adjustedTime < groupEnd

              const isTargetGroup =
                targetSentence && group.some(s => s.start_time === targetSentence.start_time)

              const activeGroupIdx = sentenceGroups.findIndex((g) => {
                const s = g[0].start_time
                const e = g[g.length - 1].end_time
                return adjustedTime >= s && adjustedTime < e
              })

              if (activeGroupIdx !== -1 && lastActiveSentenceIdxRef.current !== null) {
                lastActiveSentenceIdxRef.current = activeGroupIdx
              }

              const centerIdx = lastActiveSentenceIdxRef.current ?? 0
              const distance = Math.abs(groupIdx - centerIdx)
              if (distance > 1) return null

              return (
                <div
                  key={`${groupStart}-${groupIdx}`}
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
                    {group.map((sentence, sIdx) => (
                      <span key={`${sentence.start_time}-${sIdx}`}>
                        {(() => {
                          const query = searchQuery.toLowerCase().trim()
                          const rawWords = (sentence.words as Word[] | undefined) || []
                          const words = normalizeTranscriptWords(rawWords)

                          if (words.length > 0) {
                            const wordNodes = words.map((w, wi) => {
                              const wordText = (w.text || "").trim()
                              const isCurrentWord =
                                adjustedTime >= w.start &&
                                adjustedTime < w.end
                              const queryParts = query.split(/\s+/).filter(part => part.length > 0)
                              const isSearchMatch = queryParts.length > 0 && queryParts.some(part => wordText.toLowerCase().includes(part))

                              const key = `${sentence.start_time}-${w.start}-${wi}`
                              const isOpen = openWordKey === key

                              return (
                                <Popover
                                  key={key}
                                  open={isOpen}
                                  onOpenChange={(next) => {
                                    setOpenWordKey(next ? key : null)
                                  }}
                                >
                                  <div
                                    onMouseEnter={() => setOpenWordKey(key)}
                                    onMouseLeave={() => setOpenWordKey((current) => (current === key ? null : current))}
                                    className="inline-flex"
                                  >
                                    <PopoverTrigger asChild>
                                      <button
                                        type="button"
                                        className={cn(
                                          "mr-2 px-1.5 py-0.5 border-2 border-transparent rounded-md transition-colors duration-200 ease-in-out text-left inline-flex items-center",
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
                                          onClick={() => {
                                            const sentenceText =
                                              sentence.sentence_text ||
                                              words.map((ww: Word) => ww.text).join(" ")
                                            onExplainWordInContext?.({
                                              word: wordText,
                                              sentence: sentenceText,
                                            })
                                          }}
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
                            return <>{wordNodes}</>
                          }

                          const text = sentence.sentence_text || ""

                          // If Typesense returned <mark> tags, render as HTML
                          if (text.includes("<mark>")) {
                            return (
                              <span
                                className="relative z-10 mr-1"
                                dangerouslySetInnerHTML={{
                                  __html: text.replace(
                                    /<mark>/g,
                                    '<mark class="bg-primary text-primary-foreground px-1 rounded font-semibold">'
                                  )
                                }}
                              />
                            )
                          }

                          // Fallback: client-side highlighting if no mark tags
                          if (!query) return <span className="relative z-10 mr-1">{text}</span>
                          const regex = new RegExp(`(${query})`, "gi")
                          const parts = text.split(regex)
                          return parts.map((part: string, partIdx: number) => {
                            const isMatch = part.toLowerCase() === query.toLowerCase()
                            return (
                              <span
                                key={partIdx}
                                className={cn(
                                  "relative z-10 mr-1",
                                  isMatch &&
                                  "bg-primary text-primary-foreground px-1 rounded font-semibold",
                                )}
                              >
                                {part}
                              </span>
                            )
                          })
                        })()}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })
          })()
        ) : null}
      </div>

      {/* Bottom fade gradient */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent z-10 rounded-b-2xl" />
    </div >
  )
}
