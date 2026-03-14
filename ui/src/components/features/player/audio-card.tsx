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

  const guardedAction = (fn: () => void) => {
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
  }

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
}

export default function AudioCard({
  currentClip,
  playlist,
  totalItems,
  className,
  defaultRate = 1,
  searchQuery = "",
  onExplainWordPrompt
}: AudioCardProps & { onExplainWordPrompt?: (prompt: string) => void }) {
  const [rate, setRate] = useState(defaultRate)
  const [volume, setVolume] = useState(100)
  const router = useRouter()
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
  const [speedPopoverOpen, setSpeedPopoverOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const activeSentenceRef = useRef<HTMLDivElement>(null)

  const { isThrottled, cooldownLeft, guardedAction, cooldownSeconds } = useSpamGuard()

  const PLAYBACK_START_OFFSET = 0.2

  // Get player state and controls from Zustand store
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
    setVolume: setPlayerVolume
  } = usePlayerStore()

  // Read settings from store
  const { language, setQuery, setCategory } = useSearchStore()

  // Fetch transcript for current video
  const { data: transcriptData, isLoading: isTranscriptLoading } = useTranscript(currentClip?.video_id || "", language, currentClip?.position)

  // Sync playback rate with store
  useEffect(() => {
    setPlaybackRate(rate)
  }, [rate, setPlaybackRate])

  // Sync volume with store
  useEffect(() => {
    setPlayerVolume(volume)
  }, [volume, setPlayerVolume])

  // Skip backward 10 seconds
  function skipBackward() {
    const newTime = Math.max(0, currentTime - 10)
    seekTo(newTime)
  }

  // Skip forward 10 seconds
  function skipForward() {
    const newTime = Math.min(duration, currentTime + 10)
    seekTo(newTime)
  }

  // Toggle play/pause
  function togglePlayPause() {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  // Repeat the target sentence (sentence with search word)
  const repeatTargetSentence = () => {
    if (targetSentence) {
      const startTime = Math.max(0, targetSentence.start_time - PLAYBACK_START_OFFSET)
      seekTo(startTime)
      if (!isPlaying) {
        play()
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
    // Match by start time with a small tolerance (0.1s) to handle float precision
    if (currentClip?.start_time !== undefined) {
      return Math.abs(sentence.start_time - currentClip.start_time) < 0.1
    }

    // Fallback to text matching
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
          const startTime = Math.max(0, targetSentence.start_time - PLAYBACK_START_OFFSET)
          seekTo(startTime)
          play()
        }
      }, 500)
    }
  }, [targetSentence, scrollContainerRef, seekTo, play, isPlaying])

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
    <div className={cn("relative w-full rounded-3xl bg-card text-foreground p-3 sm:p-6 shadow-2xl", className)}>

      {/* ── MOBILE COMPACT CONTROLS (< md) ── */}
      <div className="md:hidden flex flex-col gap-3">
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
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => guardedAction(prevVideo)}><SkipBack size={16} /></Button>
            <Button size="icon" className="h-10 w-10 rounded-full" onClick={() => guardedAction(togglePlayPause)}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => guardedAction(nextVideo)}><SkipForward size={16} /></Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className={cn("h-9 w-9", targetSentence ? "text-primary" : "")} onClick={() => guardedAction(repeatTargetSentence)}><Repeat size={16} /></Button>
            <Popover open={speedPopoverOpen} onOpenChange={setSpeedPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-2 font-bold text-xs">{rate}x</Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" side="top" align="end">
                <Slider value={[speeds.indexOf(rate)]} max={speeds.length - 1} step={1} onValueChange={(v) => setRate(speeds[v[0]])} />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground">
                  {speeds.map(s => <span key={s}>{s}</span>)}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* ── DESKTOP FULL CONTROLS (>= md) ── */}
      <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-4 mb-2">
        {/* Clip Count Indicator */}
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
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full cursor-pointer" onClick={() => guardedAction(prevVideo)}><SkipBack size={20} /></Button>
            <span className="text-xs text-muted-foreground">Previous</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full cursor-pointer" onClick={() => guardedAction(skipBackward)}><RotateCcw size={20} /></Button>
            <span className="text-xs text-muted-foreground">-10s</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button size="icon" className="h-16 w-16 rounded-full bg-primary cursor-pointer" onClick={() => guardedAction(togglePlayPause)}>
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </Button>
            <span className="text-xs text-muted-foreground">{isPlaying ? "Pause" : "Play"}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full cursor-pointer" onClick={() => guardedAction(skipForward)}><RotateCcw size={20} className="scale-x-[-1]" /></Button>
            <span className="text-xs text-muted-foreground">+10s</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full cursor-pointer" onClick={() => guardedAction(repeatTargetSentence)} disabled={!targetSentence}><Repeat size={20} /></Button>
            <span className="text-xs text-muted-foreground">Repeat</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full cursor-pointer" onClick={() => guardedAction(nextVideo)}><SkipForward size={20} /></Button>
            <span className="text-xs text-muted-foreground">Next</span>
          </div>
        </div>

        {/* Speed controls */}
        <div className="flex items-center gap-4 flex-1 max-w-[180px] justify-end">
          <Popover open={speedPopoverOpen} onOpenChange={setSpeedPopoverOpen}>
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
        scrollContainerRef={scrollContainerRef}
        activeSentenceRef={activeSentenceRef}
        targetSentenceRef={targetSentenceRef}
        targetSentence={targetSentence}
        onSearchWord={(word) => {
          const clean = word.trim()
          if (!clean) return

          // Update global search context
          setQuery(clean)
          setCategory(null)

          // Navigate to routed search page including current language from store
          try {
            const encoded = encodeURIComponent(clean)
            router.push(`/search/${encoded}/${language.toLowerCase()}`)
          } catch {
            // ignore navigation errors for now
          }
        }}
        onExplainWordInContext={({ word, sentence }) => {
          const prompt = `Explain the meaning and nuance of the word "${word}" specifically in this sentence. Focus on how it is used here, any implied tone or register, and give 2-3 additional example sentences with similar usage.\n\nSentence: "${sentence}"`
          onExplainWordPrompt?.(prompt)
        }}
      />
    </div >
  )
}