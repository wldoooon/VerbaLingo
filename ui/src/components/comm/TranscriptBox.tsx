"use client"

import { RefObject, useState } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Sparkles, Bookmark } from "lucide-react"

type Word = { text: string; start: number; end: number }

// Helper to handle cases where backend returns full sentences as single "words"
function normalizeTranscriptWords(words: Word[]): Word[] {
  if (!words || words.length === 0) return []

  const normalized: Word[] = []

  for (const w of words) {
    const text = (w.text || "").trim()
    if (!text) continue

    // If word has spaces, it's likely a sentence/phrase that needs splitting
    if (text.includes(" ")) {
      const parts = text.split(/\s+/)
      const totalLength = parts.reduce((acc, p) => acc + p.length, 0)
      const duration = w.end - w.start
      let currentTime = w.start

      parts.forEach((part) => {
        // Distribute duration based on character length (linear interpolation)
        const weight = totalLength > 0 ? part.length / totalLength : 1 / parts.length
        const partDuration = duration * weight

        normalized.push({
          text: part,
          start: currentTime,
          end: currentTime + partDuration,
        })
        currentTime += partDuration
      })
    } else {
      normalized.push(w)
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
  scrollContainerRef: RefObject<HTMLDivElement>
  activeSentenceRef: RefObject<HTMLDivElement>
  targetSentenceRef: RefObject<HTMLDivElement>
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
      <div
        ref={scrollContainerRef}
        className="max-h-[200px] overflow-y-auto rounded-2xl bg-card px-3 py-3 scroll-smooth flex flex-col items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {isTranscriptLoading ? (
          <div className="w-full py-8 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/40 border-t-red-500 animate-spin" />
          </div>
        ) : sentences.length > 0 ? (
          sentences.map((sentence: any, idx: number) => {
            const TIMING_LEAD = 0.08
            const adjustedTime = currentTime + TIMING_LEAD

            const isActive =
              adjustedTime >= sentence.start_time &&
              adjustedTime < sentence.end_time
            const isTargetSentence =
              targetSentence && sentence.start_time === targetSentence.start_time

            const activeSentenceIdx = sentences.findIndex((s: any) => {
              return (
                adjustedTime >= s.start_time &&
                adjustedTime < s.end_time
              )
            })

            if (activeSentenceIdx !== -1 && lastActiveSentenceIdxRef.current !== null) {
              lastActiveSentenceIdxRef.current = activeSentenceIdx
            }

            const centerIdx = lastActiveSentenceIdxRef.current ?? 0
            const distance = Math.abs(idx - centerIdx)
            if (distance > 1) return null

            return (
              <div
                key={`${sentence.start_time}-${idx}`}
                ref={
                  isActive
                    ? activeSentenceRef
                    : isTargetSentence
                      ? targetSentenceRef
                      : null
                }
                className={cn(
                  "mb-3 rounded-2xl border transition-all duration-300 ease-in-out bg-card/80 flex items-center justify-center text-center",
                  idx === centerIdx
                    ? "p-4 shadow-lg shadow-red-500/20 border-red-500/80 scale-[1.01]"
                    : "p-3 opacity-70 hover:opacity-100",
                  idx === centerIdx - 1 &&
                  "origin-bottom scale-[0.97] translate-y-1",
                  idx === centerIdx + 1 &&
                  "origin-top scale-[0.97] -translate-y-1",
                )}
              >
                <div className="relative text-lg leading-relaxed inline-block">
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
                        const isSearchMatch =
                          !!query && wordText.toLowerCase().includes(query)

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
                                    "mr-2 pb-0.5 border-b-2 border-transparent transition-all duration-300 ease-in-out text-left inline-flex items-end",
                                    isSearchMatch && !isCurrentWord &&
                                    "border-b-red-400",
                                    isCurrentWord &&
                                    "border-b-red-500 font-semibold",
                                    "hover:border-b-muted-foreground/70 hover:text-foreground",
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
                    if (!query) return <span className="relative z-10">{text}</span>
                    const regex = new RegExp(`(${query})`, "gi")
                    const parts = text.split(regex)
                    return parts.map((part: string, partIdx: number) => {
                      const isMatch = part.toLowerCase() === query
                      return (
                        <span
                          key={partIdx}
                          className={cn(
                            "relative z-10",
                            isMatch &&
                            "border-b-2 border-b-red-500 font-semibold pb-0.5",
                          )}
                        >
                          {part}
                        </span>
                      )
                    })
                  })()}
                </div>
              </div>
            )
          })
        ) : null}
      </div>
    </div>
  )
}
