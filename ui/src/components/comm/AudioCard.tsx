"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react"
import ElasticSlider from "@/components/ElasticSlider"
import { usePlayerContext } from "@/context/PlayerContext"
import { useTranscript } from "@/lib/useApi"

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
        key={index}
        className={cn(
          "mr-2 transition-colors duration-200",
          isCurrentWord && "bg-blue-500 text-white px-1 rounded font-semibold",
          isSearchMatch && !isCurrentWord && "bg-yellow-300 text-black px-1 rounded"
        )}
      >
        {word.text}
      </span>
    )
  })
}

export default function AudioCard({ src, title, className, defaultRate = 1, searchQuery = "" }: AudioCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [rate, setRate] = useState(defaultRate)
  const [volume] = useState(50)
  const { state, dispatch } = usePlayerContext()
  const { playlist, currentVideoIndex, currentTime } = state
  const currentClip = playlist[currentVideoIndex]
  
  // Get transcript data for the current video
  const { data: transcriptData } = useTranscript(currentClip?.video_id || "")

  const speeds = [1, 1.25, 1.5, 2]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = rate
  }, [rate])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  function onLoaded() {
    const audio = audioRef.current
    if (!audio) return
    setDuration(audio.duration || 0)
  }

  function onTimeUpdate() {
    const audio = audioRef.current
    if (!audio) return
    setCurrent(audio.currentTime)
  }

  function onSeek(value: number) {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrent(value)
  }

  const remaining = Math.max(0, duration - current)

  return (
    <div className={cn("relative w-full rounded-[28px] bg-card text-foreground p-5 sm:p-6 shadow-lg", className)}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={onLoaded}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top controls */}
      <div className="flex items-center gap-3">
        <div className="text-sm tabular-nums text-muted-foreground w-16">-{formatTime(remaining)}</div>
      </div>

      {/* Volume control docked on the right side */}
      <div className="hidden sm:block absolute right-4 top-4 w-44">
        <ElasticSlider defaultValue={volume} startingValue={0} maxValue={100} />
      </div>

      {/* Centered transport controls at top overlay */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 flex items-center gap-3 z-10">
        <button
          className="h-9 w-9 rounded-full bg-muted hover:bg-muted/80 grid place-items-center shadow"
          onClick={() => dispatch({ type: "PREV_VIDEO" })}
          aria-label="Previous clip"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:opacity-90 grid place-items-center shadow"
          onClick={() => {
            try {
              (window as any).playerToggleClip?.()
              setIsPlaying((p) => !p)
            } catch {
              togglePlay()
            }
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          className="h-9 w-9 rounded-full bg-muted hover:bg-muted/80 grid place-items-center shadow"
          onClick={() => dispatch({ type: "NEXT_VIDEO" })}
          aria-label="Next clip"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Title */}
      <div className="mt-6">
        <div className="text-center text-xl sm:text-2xl font-semibold leading-tight px-4">
          {transcriptData && transcriptData.sentences.length > 0 ? (
            // Find the sentence that matches the current clip
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
              // Fallback to sentence text if no words available
              return currentClip?.sentence_text ?? title
            })()
          ) : (
            currentClip?.sentence_text ?? title
          )}
        </div>
      </div>

      {/* Speeds */}
      <div className="mt-4 flex items-center justify-center gap-8">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setRate(s)}
            className={cn(
              "text-base sm:text-lg font-semibold transition-colors",
              rate === s ? "text-white" : "text-white/50 hover:text-white/80"
            )}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}