"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Pause, Play, AudioLines, ChevronLeft, ChevronRight } from "lucide-react"
import ElasticSlider from "@/components/ElasticSlider"
import { usePlayerContext } from "@/context/PlayerContext"
import { useTranscript } from "@/lib/useApi"

type AudioCardProps = {
  src: string
  title: string
  className?: string
  defaultRate?: number
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${rem.toString().padStart(2, "0")}`
}

export default function AudioCard({ src, title, className, defaultRate = 1 }: AudioCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [rate, setRate] = useState(defaultRate)
  const [volume] = useState(50)
  const { state, dispatch } = usePlayerContext()
  const { playlist, currentVideoIndex } = state
  const currentClip = playlist[currentVideoIndex]
  const prevSentence = playlist[currentVideoIndex - 1]?.sentence_text
  const nextSentence = playlist[currentVideoIndex + 1]?.sentence_text
  const { data: transcript } = useTranscript(currentClip?.video_id)
  const [searchWord, setSearchWord] = useState("")
  useEffect(() => {
    try {
      const q = localStorage.getItem('last_search_query') || ""
      setSearchWord(q.trim().toLowerCase())
    } catch {}
  }, [currentClip?.video_id])

  function renderHighlightedSentence(text?: string) {
    if (!text) return null
    const parts = text.split(/(\s+)/)
    return parts.map((w, i) => {
      const isSpace = /\s+/.test(w)
      const norm = w.normalize('NFKD').replace(/[^\p{L}\p{N}']/gu, '').toLowerCase()
      const hit = !isSpace && searchWord && norm === searchWord
      return (
        <span key={i} className={hit ? "bg-primary/80 text-primary-foreground rounded px-1" : ""}>{w}</span>
      )
    })
  }

  const speeds = useMemo(() => [1, 1.25, 1.5, 2], [])

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

      {/* Top controls (no middle progress bar) */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
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
        </Button>

        <div className="text-sm tabular-nums text-muted-foreground w-16">-{formatTime(remaining)}</div>
      </div>

      {/* Volume control docked on the right side */}
      <div className="hidden sm:block absolute right-4 top-4 w-44">
        <ElasticSlider defaultValue={volume} startingValue={0} maxValue={100} />
      </div>

      {/* Middle transport + neighbor sentences */}
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <button
          className="justify-self-start h-10 w-10 rounded-full bg-muted hover:bg-muted/80 grid place-items-center"
          onClick={() => dispatch({ type: "PREV_VIDEO" })}
          aria-label="Previous clip"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="px-4 text-center">
          <p className="text-xl sm:text-2xl font-semibold leading-tight">
            {renderHighlightedSentence(currentClip?.sentence_text ?? title)}
          </p>
        </div>
        <button
          className="justify-self-end h-10 w-10 rounded-full bg-muted hover:bg-muted/80 grid place-items-center"
          onClick={() => dispatch({ type: "NEXT_VIDEO" })}
          aria-label="Next clip"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="col-span-3 mt-3 flex items-center justify-between text-muted-foreground">
          <span className="max-w-[40%] truncate text-sm">{prevSentence ? `← ${prevSentence}` : ""}</span>
          <span className="max-w-[40%] truncate text-right text-sm">{nextSentence ? `${nextSentence} →` : ""}</span>
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


