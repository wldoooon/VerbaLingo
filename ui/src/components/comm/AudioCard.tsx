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
  Volume2
} from "lucide-react"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useTranscript, useSearch, useTranslate } from "@/lib/useApi"

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
  const { data: transcriptData } = useTranscript(currentClip?.video_id || "")

  const speeds = [1, 1.25, 1.5, 2]

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

  // Get ALL sentences from the transcript (not just the clip window)
  const allSentences = transcriptData?.sentences || []
  
  // Sort by start time
  const sentencesInClip = [...allSentences].sort((a: any, b: any) => a.start_time - b.start_time)

  // Find the sentence that contains the search query
  const targetSentenceRef = useRef<HTMLDivElement>(null)
  const hasScrolledToTarget = useRef(false)

  const targetSentence = sentencesInClip.find((sentence: any) => {
    const text = sentence.sentence_text || ""
    const query = searchQuery.toLowerCase().trim()
    return query && text.toLowerCase().includes(query)
  })

  // Auto-scroll to target sentence on mount, then scroll to active sentence during playback
  useEffect(() => {
    if (targetSentenceRef.current && scrollContainerRef.current && !hasScrolledToTarget.current) {
      // Scroll to target sentence first
      targetSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      hasScrolledToTarget.current = true
      
      // Start playback after scroll completes (500ms delay)
      setTimeout(() => {
        if (!isPlaying && targetSentence) {
          // Seek to the target sentence start time
          controls.seekTo(targetSentence.start_time)
          controls.play()
        }
      }, 500)
    }
  }, [targetSentence, scrollContainerRef, controls, isPlaying])

  // Auto-scroll to active sentence during playback
  useEffect(() => {
    if (activeSentenceRef.current && scrollContainerRef.current && isPlaying) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
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
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full hover:bg-muted"
            onClick={() => dispatch({ type: "PREV_VIDEO" })}
            aria-label="Previous clip"
          >
            <SkipBack size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full hover:bg-muted"
            onClick={skipBackward}
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw size={20} />
          </Button>

          <Button
            size="icon"
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full hover:bg-muted"
            onClick={skipForward}
            aria-label="Forward 10 seconds"
          >
            <RotateCcw size={20} className="scale-x-[-1]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full hover:bg-muted"
            onClick={() => dispatch({ type: "NEXT_VIDEO" })}
            aria-label="Next clip"
          >
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Speed controls - Right side */}
        <div className="flex items-center gap-4 flex-1 max-w-[180px] justify-end">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setRate(s)}
              className={cn(
                "text-base font-semibold transition-colors",
                rate === s ? "text-red-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Transcript List - Scrollable Section with fade effect */}
      <div className="relative">
        {/* Top fade overlay */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 rounded-t-2xl" />
        
        <div 
          ref={scrollContainerRef}
          className="max-h-[200px] overflow-y-auto rounded-2xl bg-muted/30 px-4 space-y-3 scroll-smooth scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50 flex flex-col justify-center items-center"
        >
          {/* Spacer to push content to center */}
          <div className="flex-1 min-h-[60px]"></div>
          
          {sentencesInClip.length > 0 ? (
            sentencesInClip.map((sentence: any, idx: number) => {
              const TIMING_LEAD = 0.08
              const adjustedTime = currentTime + TIMING_LEAD
              const isActive = adjustedTime >= sentence.start_time - 0.7 && adjustedTime < (sentence.end_time - 0.9)
              const isTargetSentence = targetSentence && sentence.start_time === targetSentence.start_time
              
              return (
                <div
                  key={`${sentence.start_time}-${idx}`}
                  ref={isActive ? activeSentenceRef : (isTargetSentence ? targetSentenceRef : null)}
                  className={cn(
                    "p-4 rounded-xl transition-all duration-500 ease-in-out",
                    isActive ? "bg-card shadow-lg scale-[1.02] opacity-100" : "bg-transparent hover:bg-muted/50 opacity-70"
                  )}
                >
                  {/* Sentence text - only highlight search query word */}
                  <div className="text-lg leading-relaxed">
                    {(() => {
                      const text = sentence.sentence_text || ""
                      const query = searchQuery.toLowerCase().trim()
                      
                      if (!query) {
                        return <span>{text}</span>
                      }
                      
                      // Split text and highlight only the target search query
                      const regex = new RegExp(`(${query})`, 'gi')
                      const parts = text.split(regex)
                      
                      return parts.map((part: string, partIdx: number) => {
                        const isMatch = part.toLowerCase() === query
                        return (
                          <span
                            key={partIdx}
                            className={cn(
                              isMatch && "bg-red-500 text-white px-2 py-1 rounded font-bold"
                            )}
                          >
                            {part}
                          </span>
                        )
                      })
                    })()}
                  </div>
                  {/* Translated version (Arabic) under the sentence */}
                  <SentenceTranslation text={sentence.sentence_text} source="en" target="ar" />
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

// Child component to fetch and render translation under a sentence
const SentenceTranslation = ({
  text,
  source = "en",
  target = "ar",
}: { text: string; source?: string; target?: string }) => {
  const { data, isLoading, isError } = useTranslate(text, source, target)

  if (!text) return null
  if (isLoading) {
    return <div className="text-sm text-muted-foreground mt-2">Translating…</div>
  }
  if (isError || !data?.translated) {
    return <div className="text-sm text-muted-foreground mt-2">Translation unavailable</div>
  }
  return (
    <div className="text-sm text-muted-foreground mt-2" dir="auto" aria-label="Translated sentence">
      {data.translated}
    </div>
  )
}