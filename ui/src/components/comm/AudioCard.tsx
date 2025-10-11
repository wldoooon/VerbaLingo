"use client"

import { useEffect, useRef, useState } from "react"
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
  Share2,
  Bookmark,
  Settings,
  Maximize2
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
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${rem.toString().padStart(2, "0")}`
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
  
  return words.map((word, index) => {
    const isCurrentWord = currentTime >= word.start && currentTime < word.end
    const isSearchMatch = query && word.text.toLowerCase().includes(query)
    
    return (
      <span
        key={`${word.start}-${word.text}`}
        className={cn(
          "mr-2 transition-colors duration-20",
          isCurrentWord && "bg-red-500 text-white px-1 rounded font-semibold",
          isSearchMatch && !isCurrentWord && "bg-green-500 text-white px-1 rounded"
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
  const { state, dispatch } = usePlayerContext()
  const { currentVideoIndex, currentTime } = state
  
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

  // Get duration and playing state from window.playerToggleClip reference
  // The YouTube player in VideoPlayerCard exposes these
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Poll for YouTube player state
    const interval = setInterval(() => {
      const player = (window as any).youtubePlayer
      if (player && player.getDuration) {
        const dur = player.getDuration()
        if (dur > 0) setDuration(dur)
        
        const state = player.getPlayerState()
        setIsPlaying(state === 1) // 1 = playing
      }
    }, 500)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const player = (window as any).youtubePlayer
    if (player && player.setPlaybackRate) {
      player.setPlaybackRate(rate)
    }
  }, [rate])

  useEffect(() => {
    const player = (window as any).youtubePlayer
    if (player && player.setVolume) {
      player.setVolume(volume)
    }
  }, [volume])

  function onSeek(value: number[]) {
    const player = (window as any).youtubePlayer
    if (player && player.seekTo) {
      player.seekTo(value[0], true)
    }
  }

  function skipBackward() {
    const player = (window as any).youtubePlayer
    if (player && player.seekTo) {
      const newTime = Math.max(0, currentTime - 10)
      player.seekTo(newTime, true)
    }
  }

  function skipForward() {
    const player = (window as any).youtubePlayer
    if (player && player.seekTo) {
      const newTime = Math.min(duration, currentTime + 10)
      player.seekTo(newTime, true)
    }
  }

  const remaining = Math.max(0, duration - currentTime)

  return (
    <div className={cn("relative w-full rounded-3xl bg-card text-foreground p-6 sm:p-8 pt-4 shadow-2xl", className)}>
      {/* Progress slider at top with time markers */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2">
          <span className="tabular-nums">{formatTime(currentTime)}</span>
          <span className="tabular-nums">-{formatTime(remaining)}</span>
        </div>
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={onSeek}
          className="cursor-pointer [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
        />
      </div>

      {/* Transcript sentence with word highlighting */}
      <div className="min-h-[80px] flex items-center justify-center">
        <div className="text-center text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed px-6">
          {transcriptData && transcriptData.sentences.length > 0 ? (
            (() => {
              const matchingSentence = transcriptData.sentences.find(
                sentence => sentence.sentence_text === currentClip?.sentence_text
              )
              if (matchingSentence && matchingSentence.words) {
                return renderWordsWithHighlighting(
                  matchingSentence.words,
                  currentTime,
                  searchQuery
                )
              }
              return currentClip?.sentence_text ?? title
            })()
          ) : (
            currentClip?.sentence_text ?? title
          )}
        </div>
      </div>

      {/* Centered transport controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full hover:bg-muted"
          onClick={() => dispatch({ type: "PREV_VIDEO" })}
          aria-label="Previous clip"
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full hover:bg-muted"
          onClick={skipBackward}
          aria-label="Rewind 10 seconds"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl"
          onClick={() => {
            try {
              (window as any).playerToggleClip?.()
            } catch (e) {
              console.error("Failed to toggle playback", e)
            }
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full hover:bg-muted"
          onClick={skipForward}
          aria-label="Forward 10 seconds"
        >
          <RotateCcw className="h-5 w-5 scale-x-[-1]" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full hover:bg-muted"
          onClick={() => dispatch({ type: "NEXT_VIDEO" })}
          aria-label="Next clip"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom row: Volume, Speed controls, and Action buttons */}
      <div className="flex items-center justify-between gap-6">
        {/* Volume control */}
        <div className="flex items-center gap-3 flex-1 max-w-[200px]">
          <Volume2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-1 justify-end max-w-[200px]">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}