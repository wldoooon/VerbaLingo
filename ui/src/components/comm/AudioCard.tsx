"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Pause, Play, AudioLines } from "lucide-react"
import ElasticSlider from "@/components/ElasticSlider"

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
    <div className={cn("w-full rounded-[28px] bg-card text-foreground p-5 sm:p-6 shadow-lg", className)}>
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
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        <div className="text-sm tabular-nums text-muted-foreground w-16">-{formatTime(remaining)}</div>

        <div className="hidden sm:block w-52">
          <ElasticSlider defaultValue={volume} startingValue={0} maxValue={100} />
        </div>
      </div>

      {/* Title */}
      <div className="mt-5 text-center">
        <p className="text-xl sm:text-2xl font-semibold leading-tight">{title}</p>
      </div>

      {/* Speeds */}
      <div className="mt-6 flex items-center justify-center gap-8">
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


