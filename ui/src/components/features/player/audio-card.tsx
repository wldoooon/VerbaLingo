"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
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
import { usePlayerStore } from "@/stores/use-player-store"
import { useSearchStore } from "@/stores/use-search-store"
import { useTranscript } from "@/lib/useApi"
import { useRouter } from "next/navigation"
import type { TranscriptSentence, Clips } from "@/lib/types"
import { formatTime } from "@/lib/player-utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TranscriptBox } from "./transcript-box"

function useSpamGuard(clickWindowMs = 2000, clickLimit = 5, cooldownSeconds = 5) {
  const [isThrottled, setIsThrottled] = useState(false)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const clickTimestampsRef = useRef<number[]>([])
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Stable reference — only recreates when isThrottled changes
  const guardedAction = useCallback((fn: () => void) => {
    if (isThrottled) return

    const now = Date.now()
    clickTimestampsRef.current = clickTimestampsRef.current.filter(ts => now - ts < clickWindowMs)
    clickTimestampsRef.current.push(now)

    if (clickTimestampsRef.current.length >= clickLimit) {
      clickTimestampsRef.current = []
      setIsThrottled(true)
      setCooldownLeft(cooldownSeconds)

      let remaining = cooldownSeconds
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = setInterval(() => {
        remaining -= 1
        setCooldownLeft(remaining)
        if (remaining <= 0) {
          clearInterval(countdownTimerRef.current!)
          countdownTimerRef.current = null
          setIsThrottled(false)
        }
      }, 1000)
      return
    }

    fn()
  }, [isThrottled, clickWindowMs, clickLimit, cooldownSeconds])

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [])

  return { isThrottled, cooldownLeft, guardedAction, cooldownSeconds }
}


type AudioCardProps = {
  currentClip: Clips | undefined
  playlist: Clips[]
  totalItems?: number
  className?: string
  defaultRate?: number
  searchQuery?: string
  language?: string
  isLoading?: boolean
}

export default function AudioCard({
  currentClip,
  playlist,
  totalItems,
  className,
  defaultRate = 1,
  searchQuery = "",
  language: propLanguage,
  isLoading: isParentLoading,
  onExplainWordPrompt,
  onTranscriptDetermined
}: AudioCardProps & {
  onExplainWordPrompt?: (prompt: string) => void,
  onTranscriptDetermined?: (snippet: string) => void
}) {
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

  // Separate popovers for mobile and desktop to avoid state conflicts on resize
  const [mobileSpeedOpen, setMobileSpeedOpen] = useState(false)
  const [desktopSpeedOpen, setDesktopSpeedOpen] = useState(false)

  // Countdown for Next Button (5s Strategy)
  const [nextCooldown, setNextCooldown] = useState(0)
  const nextTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { isThrottled, cooldownLeft, guardedAction, cooldownSeconds } = useSpamGuard()

  // Start clip 0.3s before the sentence for natural listening context
  const PLAYBACK_START_OFFSET = 0.3

  // Get player state from store — volume and playbackRate are now persisted
  const {
    currentVideoIndex,
    currentTime,
    isPlaying,
    duration,
    nextVideo,
    prevVideo,
    play,
    pause,
    seekTo,
    setPlaybackRate,
    setVolume: setPlayerVolume,
    volume: storedVolume,
    playbackRate: storedRate,
  } = usePlayerStore()

  // Initialize from persisted store values so they survive tab switches and refreshes
  const [rate, setRate] = useState(() => storedRate || defaultRate)
  const [volume, setVolume] = useState(() => storedVolume ?? 100)

  const router = useRouter()

  const { setQuery, setCategory, language: storeLanguage } = useSearchStore()
  const activeLanguage = propLanguage || storeLanguage || "english"

  // True end of playlist — all clips loaded AND at last one
  const isAtEnd = currentVideoIndex >= playlist.length - 1 &&
    playlist.length >= (totalItems ?? playlist.length) &&
    playlist.length > 0

  // Fetch transcript — guard against undefined clip to avoid empty-ID requests
  const { data: transcriptData, isPending: isTranscriptLoading } = useTranscript(
    !isParentLoading && !!currentClip ? (currentClip.video_id || "") : "",
    activeLanguage,
    currentClip?.position
  )

  // Sync rate with store
  useEffect(() => {
    setPlaybackRate(rate)
  }, [rate, setPlaybackRate])

  // Sync volume with store (also persists via store's setVolume)
  useEffect(() => {
    setPlayerVolume(volume)
  }, [volume, setPlayerVolume])

  function skipBackward() {
    const newTime = Math.max(0, currentTime - 10)
    seekTo(newTime)
  }

  function skipForward() {
    const newTime = Math.min(duration, currentTime + 10)
    seekTo(newTime)
  }

  function togglePlayPause() {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const repeatTargetSentence = () => {
    if (targetSentence) {
      const startTime = Math.max(0, targetSentence.start_time - PLAYBACK_START_OFFSET)
      seekTo(startTime)
      if (!isPlaying) play()
    }
  }

  // Keyboard shortcuts — Space = play/pause, ← = -10s, → = +10s
  // Uses a ref to avoid stale closures without re-registering the listener
  const controlsRef = useRef({ togglePlayPause, skipBackward, skipForward, guardedAction })
  controlsRef.current = { togglePlayPause, skipBackward, skipForward, guardedAction }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      const { guardedAction, togglePlayPause, skipBackward, skipForward } = controlsRef.current
      if (e.code === "Space") { e.preventDefault(); guardedAction(togglePlayPause) }
      else if (e.key === "ArrowLeft") { e.preventDefault(); guardedAction(skipBackward) }
      else if (e.key === "ArrowRight") { e.preventDefault(); guardedAction(skipForward) }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  // Clean word timestamps to prevent "ghost highlights"
  const sanitizedSentences = useMemo(() => {
    const raw = transcriptData?.sentences || []
    return [...raw].sort((a, b) => a.start_time - b.start_time).map(sentence => {
      if (!sentence.words) return sentence

      const words = [...sentence.words]
      for (let i = 0; i < words.length; i++) {
        const current = words[i]
        const next = words[i + 1]
        const MAX_WORD_DURATION = 0.45
        const safetyEnd = current.start + MAX_WORD_DURATION
        current.end = Math.max(current.end, current.start + 0.05)
        if (next) {
          current.end = Math.min(current.end, safetyEnd, next.start)
        } else {
          current.end = Math.min(current.end, safetyEnd)
        }
      }
      return { ...sentence, words }
    })
  }, [transcriptData])

  const sentencesInClip = sanitizedSentences
  const hasStartedPlayback = useRef(false)

  // Reset playback flags when the clip changes — use currentVideoIndex so duplicate
  // video_ids (same YouTube video at different timestamps) still re-trigger correctly
  useEffect(() => {
    hasStartedPlayback.current = false

    setNextCooldown(5)
    if (nextTimerRef.current) clearInterval(nextTimerRef.current)
    nextTimerRef.current = setInterval(() => {
      setNextCooldown(prev => {
        if (prev <= 1) {
          if (nextTimerRef.current) clearInterval(nextTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (nextTimerRef.current) clearInterval(nextTimerRef.current)
    }
  }, [currentVideoIndex]) // was currentClip?.video_id — now index-based to handle duplicates

  // Memoized so it doesn't re-scan on every render (currentTime updates cause many renders)
  const targetSentence = useMemo(() => sentencesInClip.find((sentence: any) => {
    if (currentClip?.start_time !== undefined) {
      return Math.abs(sentence.start_time - currentClip.start_time) < 0.1
    }
    const text = sentence.sentence_text || ""
    const query = searchQuery.toLowerCase().trim()
    return query && text.toLowerCase().includes(query)
  }), [sentencesInClip, currentClip?.start_time, searchQuery])

  // Auto-play when target sentence is found
  useEffect(() => {
    if (targetSentence && !hasStartedPlayback.current) {
      const startTime = Math.max(0, targetSentence.start_time - PLAYBACK_START_OFFSET)
      seekTo(startTime)
      play()
      hasStartedPlayback.current = true
    }
  }, [targetSentence, seekTo, play])

  return (
    <div className={cn("relative w-full rounded-3xl bg-card text-foreground p-3 sm:p-6 shadow-2xl", className)}>

      {/* ── MOBILE COMPACT CONTROLS (< md) ── */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Counter — z-20 to sit above controls */}
        <div className="absolute top-3 right-3 text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/20 z-20">
          {currentVideoIndex + 1} <span className="opacity-50">/</span> {totalItems || playlist.length}
        </div>

        <div className="flex items-center justify-between gap-2 mt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Volume2 size={18} className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-3 rounded-xl" side="top">
              <Slider value={[volume]} max={100} onValueChange={(val) => setVolume(val[0])} />
            </PopoverContent>
          </Popover>

          <div className="flex items-center justify-center gap-1 flex-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => guardedAction(prevVideo)}>
              <SkipBack size={16} />
            </Button>
            <Button size="icon" className="h-10 w-10 rounded-full" onClick={() => guardedAction(togglePlayPause)}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              onClick={() => guardedAction(nextVideo)}
              disabled={nextCooldown > 0 || isAtEnd}
            >
              {nextCooldown > 0 ? (
                <span className="text-[10px] font-black text-primary animate-pulse">{nextCooldown}s</span>
              ) : isAtEnd ? (
                <span className="text-[10px] font-bold text-muted-foreground">End</span>
              ) : (
                <SkipForward size={16} />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {/* Repeat — now correctly disabled on mobile when no target sentence */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9", targetSentence ? "text-primary" : "")}
              onClick={() => guardedAction(repeatTargetSentence)}
              disabled={!targetSentence}
            >
              <Repeat size={16} />
            </Button>
            <Popover open={mobileSpeedOpen} onOpenChange={setMobileSpeedOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-2 font-bold text-xs">{rate}x</Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" side="top" align="end">
                <Slider value={[speeds.indexOf(rate)]} max={speeds.length - 1} step={1} onValueChange={(v) => setRate(speeds[v[0]])} />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground">
                  {speeds.map(s => <span key={s} className={rate === s ? "text-primary" : ""}>{s}</span>)}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Mobile throttle feedback — was silent before */}
        {isThrottled && (
          <div className="flex items-center justify-center py-1">
            <p className="text-[11px] font-bold text-amber-500 animate-pulse">
              Slow down! ({cooldownLeft}s)
            </p>
          </div>
        )}
      </div>

      {/* ── DESKTOP FULL CONTROLS (>= md) ── */}
      <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-4 mb-2">
        {/* Counter — explicit z-10, sits above speed button area */}
        <div className="absolute top-4 right-4 text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/20 z-10">
          Clip {currentVideoIndex + 1} <span className="opacity-50">/</span> {totalItems || playlist.length}
        </div>

        {/* Volume control */}
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

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-4 relative">
          {isThrottled && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg px-6">
              <p className="text-xs font-bold">Slow down! ({cooldownLeft}s)</p>
            </div>
          )}

          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full cursor-pointer" onClick={() => guardedAction(prevVideo)}>
              <SkipBack size={20} />
            </Button>
            <span className="text-xs text-muted-foreground">Previous</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full cursor-pointer" onClick={() => guardedAction(skipBackward)}>
              <RotateCcw size={20} />
            </Button>
            <span className="text-xs text-muted-foreground">-10s</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button size="icon" className="h-16 w-16 rounded-full bg-primary cursor-pointer" onClick={() => guardedAction(togglePlayPause)}>
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </Button>
            <span className="text-xs text-muted-foreground">{isPlaying ? "Pause" : "Play"}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full cursor-pointer" onClick={() => guardedAction(skipForward)}>
              <RotateCcw size={20} className="scale-x-[-1]" />
            </Button>
            <span className="text-xs text-muted-foreground">+10s</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full cursor-pointer"
              onClick={() => guardedAction(repeatTargetSentence)}
              disabled={!targetSentence}
            >
              <Repeat size={20} />
            </Button>
            <span className="text-xs text-muted-foreground">Repeat</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full cursor-pointer relative"
              onClick={() => guardedAction(nextVideo)}
              disabled={nextCooldown > 0 || isAtEnd}
            >
              {nextCooldown > 0 ? (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-sm font-black text-primary animate-in zoom-in duration-300">{nextCooldown}s</span>
                </div>
              ) : isAtEnd ? (
                <span className="text-xs font-bold text-muted-foreground">End</span>
              ) : (
                <SkipForward size={20} />
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              {nextCooldown > 0 ? "Wait..." : isAtEnd ? "End" : "Next"}
            </span>
          </div>
        </div>

        {/* Speed control — separate state from mobile popover */}
        <div className="flex items-center gap-4 flex-1 max-w-[180px] justify-end">
          <Popover open={desktopSpeedOpen} onOpenChange={setDesktopSpeedOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
                <Gauge size={18} />
                <span className="font-semibold">{rate}x</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-5 rounded-2xl shadow-xl" align="end">
              <Slider value={[speeds.indexOf(rate)]} max={speeds.length - 1} step={1} onValueChange={(v) => setRate(speeds[v[0]])} />
              <div className="flex justify-between mt-3 text-xs font-bold text-muted-foreground">
                {speeds.map(s => <span key={s} className={rate === s ? "text-primary" : ""}>{s}x</span>)}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <TranscriptBox
        sentences={sentencesInClip}
        searchQuery={searchQuery}
        isTranscriptLoading={isTranscriptLoading}
        onSearchWord={(word) => {
          const clean = word.trim()
          if (!clean) return
          setQuery(clean)
          setCategory(null)
          try {
            const encoded = encodeURIComponent(clean)
            router.push(`/search/${encoded}/${activeLanguage.toLowerCase()}`)
          } catch {
            // ignore navigation errors
          }
        }}
        onExplainWordInContext={({ word, sentence }) => {
          // Language-aware prompt — no longer hardcoded to English
          const prompt = `Explain the meaning and nuance of the ${activeLanguage} word or phrase "${word}" specifically in this sentence. Focus on how it is used here, any implied tone or register, and give 2-3 additional example sentences with similar usage.\n\nSentence: "${sentence}"`
          onExplainWordPrompt?.(prompt)
        }}
        onTranscriptDetermined={onTranscriptDetermined}
      />
    </div>
  )
}
