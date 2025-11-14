"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  Repeat,
  Gauge
} from "lucide-react"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useTranscript, useSearch } from "@/lib/useApi"
import type { TranscriptSentence } from "@/lib/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type AudioCardProps = {
  src: string
  title: string
  className?: string
  defaultRate?: number
  searchQuery?: string
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rem = s % 60
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`
    : `${m}:${rem.toString().padStart(2, "0")}`
}

function renderWordsWithHighlighting(
  words: { text: string; start: number; end: number }[],
  currentTime: number,
  searchQuery: string
) {
  if (!words || words.length === 0) {
    return <span>No words available</span>
  }

  const query = searchQuery.toLowerCase().trim()
  // Small lead to compensate for player time polling latency
  const TIMING_LEAD_SECONDS = 0.08
  const adjustedTime = currentTime + TIMING_LEAD_SECONDS
  
  return words.map((word, index) => {
    const isCurrentWord = adjustedTime >= word.start && adjustedTime < word.end
    const isSearchMatch = query && word.text.toLowerCase().includes(query)
    
    return (
      <span
        key={`${word.start}-${word.text}`}
        className={cn(
          "mr-2 transition-colors duration-20",
          isCurrentWord && "border-5 border-red-500 px-1 rounded font-semibold",
          isSearchMatch && !isCurrentWord && "bg-red-500 text-white px-1 rounded"
        )}
      >
        {word.text}
      </span>
    )
  })
}

export default function AudioCard({ src, title, className, defaultRate = 1, searchQuery = "" }: AudioCardProps) {
  const [rate, setRate] = useState(defaultRate)
  const [volume, setVolume] = useState(100)
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
  const [speedPopoverOpen, setSpeedPopoverOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const activeSentenceRef = useRef<HTMLDivElement>(null)
  
  // Get player state and controls from context
  const { state, dispatch, playerState, controls } = usePlayerContext()
  const { currentVideoIndex, currentTime } = state
  const { isPlaying, duration } = playerState
  
  // Read playlist from React Query cache
  const { query, category } = useSearchParams()
  const { data } = useSearch(query, category)
  const playlist = data?.hits || []
  
  // Defensive: clamp currentVideoIndex to valid range
  const validIndex = Math.max(0, Math.min(currentVideoIndex, playlist.length - 1))
  const currentClip = playlist[validIndex]
  
  // Get transcript data for the current video
  const { data: transcriptData, isLoading: isTranscriptLoading } = useTranscript(currentClip?.video_id || "")

  // Sync playback rate with context controls
  useEffect(() => {
    controls.setPlaybackRate(rate)
  }, [rate, controls])

  // Sync volume with context controls
  useEffect(() => {
    controls.setVolume(volume)
  }, [volume, controls])

  // Skip backward 10 seconds using context controls
  function skipBackward() {
    const newTime = Math.max(0, currentTime - 10)
    controls.seekTo(newTime)
  }

  // Skip forward 10 seconds using context controls
  function skipForward() {
    const newTime = Math.min(duration, currentTime + 10)
    controls.seekTo(newTime)
  }

  // Toggle play/pause using context controls
  function togglePlayPause() {
    if (isPlaying) {
      controls.pause()
    } else {
      controls.play()
    }
  }

  // Repeat the target sentence (sentence with search word)
  const repeatTargetSentence = () => {
    if (targetSentence) {
      controls.seekTo(targetSentence.start_time)
      if (!isPlaying) {
        controls.play()
      }
    }
  }

  // Get ALL sentences from the transcript (not just the clip window)
  const allSentences = transcriptData?.sentences || []
  
  // Sort by start time
  const sentencesInClip = [...allSentences].sort((a: any, b: any) => a.start_time - b.start_time)

  // Find the sentence that contains the search query
  const targetSentenceRef = useRef<HTMLDivElement>(null)
  const hasScrolledToTarget = useRef(false)
  const lastActiveSentenceIdx = useRef<number>(0)

  const targetSentence = sentencesInClip.find((sentence: any) => {
    const text = sentence.sentence_text || ""
    const query = searchQuery.toLowerCase().trim()
    return query && text.toLowerCase().includes(query)
  })

  // Auto-scroll to target sentence on mount - CONSTRAINED to transcript box only
  useEffect(() => {
    if (targetSentenceRef.current && scrollContainerRef.current && !hasScrolledToTarget.current) {
      // Calculate scroll position manually to avoid affecting global scroll
      const container = scrollContainerRef.current
      const target = targetSentenceRef.current
      
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      
      // Calculate the offset within the container
      const relativeTop = targetRect.top - containerRect.top + container.scrollTop
      const scrollTo = relativeTop - (container.clientHeight / 2) + (targetRect.height / 2)
      
      // Scroll ONLY the container, not the page
      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      })
      
      hasScrolledToTarget.current = true
      
      // Start playback after scroll completes (500ms delay)
      setTimeout(() => {
        if (!isPlaying && targetSentence) {
          controls.seekTo(targetSentence.start_time)
          controls.play()
        }
      }, 500)
    }
  }, [targetSentence, scrollContainerRef, controls, isPlaying])

  // Auto-scroll to active sentence during playback - CONSTRAINED to transcript box only
  useEffect(() => {
    if (activeSentenceRef.current && scrollContainerRef.current && isPlaying) {
      const container = scrollContainerRef.current
      const active = activeSentenceRef.current
      
      const containerRect = container.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      
      // Calculate the offset within the container
      const relativeTop = activeRect.top - containerRect.top + container.scrollTop
      const scrollTo = relativeTop - (container.clientHeight / 2) + (activeRect.height / 2)
      
      // Scroll ONLY the container, not the page
      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      })
    }
  }, [currentTime, isPlaying])

  return (
    <div className={cn("relative w-full rounded-3xl bg-card text-foreground p-6 sm:p-8 shadow-2xl", className)}>
      {/* Audio Controls - All in one row */}
      <div className="flex items-center justify-between gap-6 mb-6">
        {/* Volume control - Left side */}
        <div className="flex items-center gap-3 flex-1 max-w-[180px]">
          <Volume2 size={20} className="text-muted-foreground flex-shrink-0" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(val) => setVolume(val[0])}
            className="cursor-pointer"
          />
        </div>

        {/* Transport controls - Center */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full hover:bg-muted"
              onClick={() => dispatch({ type: "PREV_VIDEO" })}
              aria-label="Previous clip"
            >
              <SkipBack size={20} />
            </Button>
            <span className="text-xs text-muted-foreground">Previous</span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full hover:bg-muted"
              onClick={skipBackward}
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw size={20} />
            </Button>
            <span className="text-xs text-muted-foreground">-10s</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </Button>
            <span className="text-xs text-muted-foreground">{isPlaying ? "Pause" : "Play"}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full hover:bg-muted"
              onClick={skipForward}
              aria-label="Forward 10 seconds"
            >
              <RotateCcw size={20} className="scale-x-[-1]" />
            </Button>
            <span className="text-xs text-muted-foreground">+10s</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full hover:bg-muted disabled:opacity-50"
              onClick={repeatTargetSentence}
              disabled={!targetSentence}
              aria-label="Repeat target sentence"
              title="Repeat sentence with search word"
            >
              <Repeat size={20} />
            </Button>
            <span className="text-xs text-muted-foreground">Repeat</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full hover:bg-muted"
              onClick={() => dispatch({ type: "NEXT_VIDEO" })}
              aria-label="Next clip"
            >
              <SkipForward size={20} />
            </Button>
            <span className="text-xs text-muted-foreground">Next</span>
          </div>
        </div>

        {/* Speed controls - Right side */}
        <div className="flex items-center gap-4 flex-1 max-w-[180px] justify-end">
          <Popover open={speedPopoverOpen} onOpenChange={setSpeedPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Gauge size={18} />
                <span className="font-semibold">{rate}x</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Playback Speed</span>
                  <span className="text-sm font-semibold text-red-500">{rate}x</span>
                </div>
                <Slider
                  value={[speeds.indexOf(rate)]}
                  max={speeds.length - 1}
                  step={1}
                  onValueChange={(val) => setRate(speeds[val[0]])}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {speeds.map((s) => (
                    <span key={s}>{s}x</span>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Transcript List - Scrollable Section with fade effect */}
      <div className="relative">
        {/* Top fade overlay */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 rounded-t-2xl" />
        
        <div 
          ref={scrollContainerRef}
          className="max-h-[200px] overflow-y-auto rounded-2xl bg-muted/30 px-4 space-y-3 scroll-smooth flex flex-col justify-center items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Spacer to push content to center */}
          <div className="flex-1 min-h-[60px]"></div>
          
          {isTranscriptLoading ? (
            <div className="w-full py-8 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/40 border-t-red-500 animate-spin" />
            </div>
          ) : sentencesInClip.length > 0 ? (
            sentencesInClip.map((sentence: any, idx: number) => {
              const TIMING_LEAD = 0.08
              const adjustedTime = currentTime + TIMING_LEAD
              const isActive = adjustedTime >= sentence.start_time - 0.7 && adjustedTime < (sentence.end_time - 0.9)
              const isTargetSentence = targetSentence && sentence.start_time === targetSentence.start_time
              
              // Find active sentence index
              const activeSentenceIdx = sentencesInClip.findIndex((s: any) => {
                return adjustedTime >= s.start_time - 0.7 && adjustedTime < (s.end_time - 0.9)
              })
              
              // Update last active index when we find an active sentence
              if (activeSentenceIdx !== -1) {
                lastActiveSentenceIdx.current = activeSentenceIdx
              }
              
              // Use last active index (keeps showing last sentence until next one activates)
              const centerIdx = lastActiveSentenceIdx.current
              
              // Only render sentence + 1 before + 1 after (3 total)
              const distance = Math.abs(idx - centerIdx)
              if (distance > 1) return null
              
              return (
                <div
                  key={`${sentence.start_time}-${idx}`}
                  ref={isActive ? activeSentenceRef : (isTargetSentence ? targetSentenceRef : null)}
                  className={cn(
                    "p-4 rounded-xl transition-all duration-300 ease-in-out",
                    isActive
                      ? "border-b-2 border-red-500/60 pb-3 opacity-100"
                      : "opacity-70 hover:opacity-90"
                  )}
                >
                  {/* Sentence text with per-word active highlighting */}
                  <div className="relative text-lg leading-relaxed">
                    {(() => {
                      const query = searchQuery.toLowerCase().trim()
                      const words = (sentence.words as { text: string; start: number; end: number }[] | undefined) || []

                      if (words.length > 0) {
                        const wordNodes = words.map((w, wi) => {
                          const wordText = (w.text || '').trim()
                          // Simple, robust window: active while time is within the word bounds
                          const isCurrentWord = adjustedTime >= w.start - 0.7 && adjustedTime < w.end - 0.9
                          const isSearchMatch = !!query && wordText.toLowerCase().includes(query)
                          return (
                            <span
                              key={`${w.start}-${wi}`}
                              className={cn(
                                "mr-2 transition-all duration-300 ease-in-out",
                                isSearchMatch && !isCurrentWord && "bg-red-500 text-white px-1 rounded",
                                isCurrentWord && "ring-2 ring-red-500 ring-offset-2 ring-offset-muted px-1 rounded font-medium"
                              )}
                            >
                              {wordText || '\u00A0'}
                            </span>
                          )
                        })
                        return <>{wordNodes}</>
                      }

                      // Fallback: no word timings, keep original sentence-level rendering
                      const text = sentence.sentence_text || ""
                      if (!query) return <span className="relative z-10">{text}</span>
                      const regex = new RegExp(`(${query})`, 'gi')
                      const parts = text.split(regex)
                      return parts.map((part: string, partIdx: number) => {
                        const isMatch = part.toLowerCase() === query
                        return (
                          <span
                            key={partIdx}
                            className={cn(
                              "relative z-10",
                              isMatch && "bg-red-500 text-white px-2 py-1 rounded font-bold"
                            )}
                          >
                            {part}
                          </span>
                        )
                      })
                    })()}
                  </div>
                  {/* Translation removed as requested */}
                </div>
              )
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>{currentClip?.sentence_text ?? title}</p>
            </div>
          )}
          
          {/* Spacer to push content to center */}
          <div className="flex-1 min-h-[60px]"></div>
        </div>
        
        {/* Bottom fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 rounded-b-2xl" />
      </div>
    </div>
  )
}

// Translation UI removed from AudioCard as requested

// Simple sentence progress (0..1) using only sentence start/end and desired offsets
function computeSentenceProgress(sentence: TranscriptSentence, currentTime: number) {
  const lead = 0.08
  const preOffset = 0.7
  const postOffset = 0.9
  const t = currentTime + lead
  const start = (sentence.start_time ?? 0) - preOffset
  const end = (sentence.end_time ?? 0) - postOffset
  const span = Math.max(0.001, end - start)
  const p = (t - start) / span
  return Math.min(Math.max(p, 0), 1)
}