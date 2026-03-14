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
    <div className={cn("relative w-full rounded-3xl bg-card text-foreground p-3 sm:p-5 shadow-2xl overflow-hidden", className)}>
      {/* Clip Count Indicator - Absolute Top Right for Mobile/Desktop */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[10px] sm:text-xs font-bold text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/20 z-20">
        {currentVideoIndex + 1} <span className="opacity-50">/</span> {totalItems || playlist.length}
      </div>

      <div className="flex flex-col gap-3">
        {/* Compact Control Row */}
        <div className="flex items-center justify-between gap-2 mt-4 sm:mt-0">
          
          {/* Volume - Compact for Mobile */}
          <div className="flex items-center gap-2">
             <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
                  <Volume2 size={18} className="text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-3 rounded-xl border-border/50" side="top">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Volume</p>
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setVolume(val[0])}
                    className="cursor-pointer"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Transport Controls - Compact & Centered */}
          <div className="flex items-center justify-center gap-1 sm:gap-4 flex-1">
            {isThrottled && (
              <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-center rounded-2xl bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg p-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-xs font-bold text-foreground">Whoa, slow down!</p>
                  <div className="h-1 w-20 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((cooldownSeconds - cooldownLeft) / cooldownSeconds) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted"
              onClick={() => guardedAction(prevVideo)}
              disabled={isThrottled}
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted"
              onClick={() => guardedAction(skipBackward)}
              disabled={isThrottled}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex-shrink-0"
              onClick={() => guardedAction(togglePlayPause)}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted"
              onClick={() => guardedAction(skipForward)}
              disabled={isThrottled}
            >
              <RotateCcw className="w-4 h-4 scale-x-[-1]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted"
              onClick={() => guardedAction(nextVideo)}
              disabled={isThrottled}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Speed & Repeat Group */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 rounded-full hover:bg-muted transition-colors", targetSentence ? "text-primary" : "text-muted-foreground")}
              onClick={() => guardedAction(repeatTargetSentence)}
              disabled={!targetSentence || isThrottled}
            >
              <Repeat className="w-4 h-4" />
            </Button>

            <Popover open={speedPopoverOpen} onOpenChange={setSpeedPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-1 px-2 rounded-lg hover:bg-muted font-bold">
                  <span className="text-xs">{rate}x</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-4 rounded-2xl shadow-xl border-border/50" align="end" side="top">
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Speed</span>
                  <div className="relative px-2 pb-6">
                    <Slider
                      value={[speeds.indexOf(rate)]}
                      max={speeds.length - 1}
                      step={1}
                      onValueChange={(val) => setRate(speeds[val[0]])}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between mt-2">
                       {speeds.map((s) => (
                         <span key={s} className={cn("text-[10px] font-bold", rate === s ? "text-primary" : "text-muted-foreground")}>{s}</span>
                       ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
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