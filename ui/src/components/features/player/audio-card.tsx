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
  Gauge,
  Globe,
} from "lucide-react"
import { usePlayerStore } from "@/stores/use-player-store"
import { useSearchStore } from "@/stores/use-search-store"
import { useTranscript, useTranslateBatch, useTranslationPrefetch } from "@/lib/useApi"
import { useRouter } from "next/navigation"
import type { TranscriptSentence, Clips } from "@/lib/types"
import { formatTime } from "@/lib/player-utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TranscriptBox } from "./transcript-box"
import { DecorIcon } from "@/components/ui/decor-icon"

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


// ── Speed Picker ────────────────────────────────────────────────────────────
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

function SpeedPicker({ currentRate, onSelect }: { currentRate: number; onSelect: (s: number) => void }) {
  const MIN_H = 14
  const MAX_H = 56
  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Playback Speed</span>
        <span className="text-base font-black text-primary font-mono tabular-nums">{currentRate}x</span>
      </div>

      {/* Bars + labels */}
      <div className="flex items-end gap-1">
        {SPEEDS.map((s) => {
          const isActive = currentRate === s
          const h = Math.round(MIN_H + (s / 2) * (MAX_H - MIN_H))
          return (
            <button
              key={s}
              onClick={() => onSelect(s)}
              className="flex flex-col items-center gap-2 flex-1 group cursor-pointer"
            >
              <div
                className={cn(
                  "w-full rounded-sm transition-all duration-150",
                  isActive
                    ? "bg-primary"
                    : "bg-muted-foreground/20 group-hover:bg-muted-foreground/50"
                )}
                style={{ height: h }}
              />
              <span className={cn(
                "text-[9px] font-bold leading-none transition-colors whitespace-nowrap",
                isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
              )}>
                {s}x
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
// ────────────────────────────────────────────────────────────────────────────

const TRANSLATION_LANGUAGES = [
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "tr", label: "Turkish" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "zh-CN", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "hi", label: "Hindi" },
  { code: "ko", label: "Korean" },
  { code: "vi", label: "Vietnamese" },
]

function TranslationPicker({
  current,
  onSelect,
}: {
  current: string | null
  onSelect: (code: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Translate to</span>
        {current && (
          <button
            onClick={() => onSelect(null)}
            className="text-[10px] font-bold text-destructive hover:underline"
          >
            Off
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {TRANSLATION_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(current === lang.code ? null : lang.code)}
            className={cn(
              "text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              current === lang.code
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────

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
  const speeds = SPEEDS

  // Separate popovers for mobile and desktop to avoid state conflicts on resize
  const [mobileSpeedOpen, setMobileSpeedOpen] = useState(false)
  const [desktopSpeedOpen, setDesktopSpeedOpen] = useState(false)
  const [mobileTranslationOpen, setMobileTranslationOpen] = useState(false)
  const [desktopTranslationOpen, setDesktopTranslationOpen] = useState(false)

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
    player,
  } = usePlayerStore()

  // Initialize from persisted store values so they survive tab switches and refreshes
  const [rate, setRate] = useState(() => storedRate || defaultRate)
  const [volume, setVolume] = useState(() => storedVolume ?? 100)

  const router = useRouter()

  const { setQuery, setCategory, language: storeLanguage, translationLang, setTranslationLang } = useSearchStore()
  const activeLanguage = propLanguage || storeLanguage || "english"

  // True end of playlist — all clips loaded AND at last one
  const isAtEnd = currentVideoIndex >= playlist.length - 1 &&
    playlist.length >= (totalItems ?? playlist.length) &&
    playlist.length > 0

  // Fetch transcript — guard against undefined clip to avoid empty-ID requests
  const transcriptFetchStart = useRef<number>(performance.now())
  useEffect(() => {
    if (currentClip?.video_id) {
      transcriptFetchStart.current = performance.now()
      console.log(`[PERF] transcript REQUESTED  video=${currentClip.video_id}  idx=${currentVideoIndex}`)
    }
  }, [currentClip?.video_id, currentVideoIndex])

  const { data: transcriptData, isPending: isTranscriptLoading } = useTranscript(
    !isParentLoading && !!currentClip ? (currentClip.video_id || "") : "",
    activeLanguage,
    currentClip?.position
  )

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

  // Log when transcript data arrives
  useEffect(() => {
    if (transcriptData && currentClip?.video_id) {
      const ms = Math.round(performance.now() - transcriptFetchStart.current)
      const cached = ms < 10 // came from React Query cache
      console.log(`[PERF] transcript ARRIVED  video=${currentClip.video_id}  sentences=${transcriptData.sentences?.length ?? 0}  +${ms}ms${cached ? ' (CACHE HIT)' : ''}`)
    }
  }, [transcriptData, currentClip?.video_id])

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

  // Translate all sentences in one batch call — result cached forever by React Query
  const { data: translationData, isPending: isTranslationLoading } = useTranslateBatch(
    sentencesInClip,
    currentClip?.video_id || "",
    currentClip?.position,
    translationLang,
  )

  // Prefetch translations for next 2 clips whenever index or language changes
  useTranslationPrefetch(playlist, currentVideoIndex, translationLang, activeLanguage)

  // Map index → translated text — index is stable and avoids float key issues
  const translatedMap = useMemo(() => {
    if (!translationData?.translations || !sentencesInClip.length) return {}
    return Object.fromEntries(
      translationData.translations.map((t, i) => [i, t])
    )
  }, [translationData, sentencesInClip])

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
  const targetSentence = useMemo(() => {
    const clipStartTime = currentClip?.start_time !== undefined ? currentClip.start_time : (currentClip as any)?.start;
    
    if (clipStartTime !== undefined) {
      // Find the closest sentence by start_time
      let closest = null;
      let minDiff = Infinity;
      for (const sentence of sentencesInClip) {
        const diff = Math.abs(sentence.start_time - clipStartTime);
        if (diff < minDiff) {
          minDiff = diff;
          closest = sentence;
        }
      }
      // Only accept if it's reasonably close (e.g., within 2 seconds)
      if (closest && minDiff < 2.0) {
        return closest;
      }
    }
    
    // Fallback to text search
    const fallback = sentencesInClip.find((sentence: any) => {
      const text = sentence.sentence_text || ""
      const query = searchQuery.toLowerCase().trim()
      return query && text.toLowerCase().includes(query)
    })
    return fallback;
  }, [sentencesInClip, currentClip?.start_time, (currentClip as any)?.start, searchQuery])

  // Auto-play when target sentence is found.
  // Also re-runs when `player` becomes non-null so it retries if the transcript
  // resolved before the YouTube iframe was ready (race condition fix).
  useEffect(() => {
    if (targetSentence && !hasStartedPlayback.current && player) {
      const startTime = Math.max(0, targetSentence.start_time - PLAYBACK_START_OFFSET)
      seekTo(startTime)
      play()
      hasStartedPlayback.current = true
    }
  }, [targetSentence, player, seekTo, play])

  return (
    <div className="relative border border-border/70 p-2.5">
      <DecorIcon position="top-left" />
      <DecorIcon position="top-right" />
      <DecorIcon position="bottom-left" />
      <DecorIcon position="bottom-right" />
    <div className={cn("relative w-full rounded-3xl bg-card text-foreground p-3 sm:p-4 shadow-inner", className)}>

      {/* ── CARD HEADER ── */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          {currentClip?.video_title && (
            <span className="text-[11px] text-muted-foreground/60 truncate hidden sm:block">
              — {currentClip.video_title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {currentClip?.category && (
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30 border border-border/20 px-1.5 py-0.5 rounded-sm">
              {typeof currentClip.category === "string"
                ? currentClip.category
                : (currentClip.category as any)?.title ?? (currentClip.category as any)?.type ?? ""}
            </span>
          )}
          <span className="text-[10px] font-medium text-muted-foreground/50 tabular-nums">
            {currentVideoIndex + 1}<span className="opacity-40 mx-0.5">/</span>{totalItems || playlist.length}
          </span>
        </div>
      </div>

      {/* ── MOBILE COMPACT CONTROLS (< md) ── */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
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
              <PopoverContent className="w-[260px] p-4 rounded-2xl" side="top" align="end">
                <SpeedPicker currentRate={rate} onSelect={(r) => { setRate(r); setPlaybackRate(r) }} />
              </PopoverContent>
            </Popover>
            <Popover open={mobileTranslationOpen} onOpenChange={setMobileTranslationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-9 w-9", translationLang ? "text-primary" : "")}
                >
                  <Globe size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-4 rounded-2xl" side="top" align="end">
                <TranslationPicker current={translationLang} onSelect={setTranslationLang} />
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
            <Button size="icon" className="h-12 w-12 rounded-full bg-primary cursor-pointer" onClick={() => guardedAction(togglePlayPause)}>
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
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

        {/* Speed + Translation controls */}
        <div className="flex items-center gap-2 flex-1 max-w-[220px] justify-end">
          <Popover open={desktopTranslationOpen} onOpenChange={setDesktopTranslationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn("gap-2 cursor-pointer", translationLang ? "text-primary" : "")}
              >
                <Globe size={18} />
                <span className="font-semibold text-xs">
                  {translationLang
                    ? TRANSLATION_LANGUAGES.find(l => l.code === translationLang)?.label ?? translationLang
                    : "Translate"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-4 rounded-2xl shadow-xl" align="end">
              <TranslationPicker current={translationLang} onSelect={setTranslationLang} />
            </PopoverContent>
          </Popover>
          <Popover open={desktopSpeedOpen} onOpenChange={setDesktopSpeedOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
                <Gauge size={18} />
                <span className="font-semibold">{rate}x</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4 rounded-2xl shadow-xl" align="end">
              <SpeedPicker currentRate={rate} onSelect={(r) => { setRate(r); setPlaybackRate(r) }} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border-t border-border/20 mb-1" />
      <TranscriptBox
        sentences={sentencesInClip}
        searchQuery={searchQuery}
        isTranscriptLoading={isTranscriptLoading}
        isTranslationLoading={!!translationLang && isTranslationLoading}
        translatedMap={translatedMap}
        targetSentence={targetSentence}
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
    </div>
  )
}
