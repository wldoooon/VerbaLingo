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
import { useTranscript, useSearch } from "@/lib/useApi"

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

  // Get all sentences in the clip window
  const clipStart = typeof currentClip?.start_time === 'number' ? currentClip.start_time : 0
  const clipEnd = typeof currentClip?.end_time === 'number' ? currentClip.end_time : clipStart + 12
  
  const sentencesInClip = transcriptData?.sentences
    ?.filter((s: any) => s.end_time > clipStart && s.start_time < clipEnd)
    .sort((a: any, b: any) => a.start_time - b.start_time) || []

  // Auto-scroll to active sentence
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
      {/* Audio Controls - Top Section */}
      <div className="flex flex-col gap-6 mb-6">
        {/* Transport controls */}
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

        {/* Volume and Speed controls */}
        <div className="flex items-center justify-between gap-6">
          {/* Volume control */}
          <div className="flex items-center gap-3 flex-1 max-w-[200px]">
            <Volume2 size={20} className="text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="cursor-pointer"
            />
          </div>

          {/* Speed controls */}
          <div className="flex items-center gap-5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setRate(s)}
                className={cn(
                  "text-base font-semibold transition-colors min-w-[40px]",
                  rate === s ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript List - Scrollable Section */}
      <div 
        ref={scrollContainerRef}
        className="max-h-[400px] overflow-y-auto rounded-2xl bg-muted/30 p-4 space-y-3 scroll-smooth"
      >
        {sentencesInClip.length > 0 ? (
          sentencesInClip.map((sentence: any, idx: number) => {
            const TIMING_LEAD = 0.08
            const adjustedTime = currentTime + TIMING_LEAD
            const isActive = adjustedTime >= sentence.start_time && adjustedTime < sentence.end_time
            
            return (
              <div
                key={`${sentence.start_time}-${idx}`}
                ref={isActive ? activeSentenceRef : null}
                className={cn(
                  "p-4 rounded-xl transition-all duration-300",
                  isActive ? "bg-card shadow-lg scale-[1.02]" : "bg-transparent hover:bg-muted/50"
                )}
              >
                {/* Timestamp */}
                <div className="text-xs text-muted-foreground font-medium mb-2">
                  {formatTime(sentence.start_time)}
                </div>
                
                {/* Sentence text with word highlighting */}
                <div className="text-lg leading-relaxed">
                  {sentence.words && sentence.words.length > 0 ? (
                    sentence.words.map((word: any, wordIdx: number) => {
                      const isCurrentWord = isActive && adjustedTime >= word.start && adjustedTime < word.end
                      const isSearchMatch = searchQuery && word.text.toLowerCase().includes(searchQuery.toLowerCase().trim())
                      
                      return (
                        <span
                          key={`${word.start}-${word.text}-${wordIdx}`}
                          className={cn(
                            "mr-2 transition-all duration-150",
                            isCurrentWord && "bg-red-500 text-white px-2 py-1 rounded font-bold scale-110 inline-block",
                            isSearchMatch && !isCurrentWord && "bg-red-500/20 text-red-500 px-1 rounded font-semibold"
                          )}
                        >
                          {word.text}
                        </span>
                      )
                    })
                  ) : (
                    <span>{sentence.sentence_text}</span>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>{currentClip?.sentence_text ?? title}</p>
          </div>
        )}
      </div>
    </div>
  )
}