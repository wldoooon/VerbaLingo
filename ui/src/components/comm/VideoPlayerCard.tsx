"use client"

import dynamic from "next/dynamic"
const YouTube = dynamic(() => import("react-youtube"), { ssr: false })
import { useEffect, useState, useRef } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useSearch, useTranscript } from "@/lib/useApi"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { YouTubePlayer } from "react-youtube"
import ElasticSlider from "@/components/ElasticSlider"

function getClipStart(clip: any): number {
  if (!clip) return 0
  if (typeof clip.start === "number") return clip.start
  if (typeof clip.start_time === "number") return clip.start_time
  return 0
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
          "mr-2 transition-colors duration-200",
          isCurrentWord && "bg-red-500 text-white px-1 rounded font-semibold",
          isSearchMatch && !isCurrentWord && "bg-green-500 text-white px-1 rounded"
        )}
      >
        {word.text}
      </span>
    )
  })
}

type VideoPlayerCardProps = {
  className?: string
  searchQuery?: string
}

export default function VideoPlayerCard({ className, searchQuery = "" }: VideoPlayerCardProps) {
  const { state, dispatch } = usePlayerContext()
  const { currentVideoIndex, isMuted, currentTime } = state
  
  // Read playlist from React Query cache
  const { query, category } = useSearchParams()
  const { data } = useSearch(query, category)
  const playlist = data?.hits || []
  
  const playerRef = useRef<YouTubePlayer | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [rate, setRate] = useState(1)
  const [volume] = useState(50)

  // Defensive: clamp currentVideoIndex to valid range
  const validIndex = Math.max(0, Math.min(currentVideoIndex, playlist.length - 1))
  const currentClip = playlist[validIndex]
  const currentVideoId = currentClip?.video_id

  const rawStart = getClipStart(currentClip)
  const startSec = Math.max(0, Math.floor(rawStart))
  const uniqueKey = `${currentVideoId}-${currentVideoIndex}-${rawStart}`

  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  
  // Get transcript data for the current video
  const { data: transcriptData } = useTranscript(currentClip?.video_id || "")

  const speeds = [1, 1.25, 1.5, 2]

  useEffect(() => {
    setReady(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [uniqueKey])

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate)
    }
  }, [rate])

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime()
      const duration = playerRef.current?.getDuration()
      if (typeof currentTime === 'number') {
        dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime })
      }
      if (typeof duration === 'number') {
        setDuration(duration)
      }
    }, 250)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleTogglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }
  }

  const onPlayerStateChange = (event: { data: number }) => {
    if (event.data === 1) {
      setIsPlaying(true)
      startPolling()
    } else {
      setIsPlaying(false)
      stopPolling()
    }
  }

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      mute: isMuted ? 1 : 0,
      start: startSec,
      modestbranding: 1,
      rel: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      cc_load_policy: 0,
    },
    loading: "eager",
  } as const

  const remaining = Math.max(0, duration - currentTime)

  return (
    <div className="space-y-2">
      {/* Video Player */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px] xl:h-[700px] overflow-hidden rounded-2xl">
        {!ready && currentVideoId && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg)`,
            }}
          />
        )}
        {currentVideoId && (
          <YouTube
            key={uniqueKey}
            videoId={currentVideoId}
            opts={opts}
            onReady={(e) => {
              playerRef.current = e.target
              setReady(true)
              ;(window as any).playerToggleClip = handleTogglePlay
            }}
            onStateChange={onPlayerStateChange}
            className="absolute inset-0 w-full h-full"
            iframeClassName="w-full h-full"
          />
        )}
      </div>

      {/* Audio Card Controls */}
      <div className={cn("relative w-full rounded-[28px] bg-card text-foreground p-5 sm:p-6 shadow-lg border-2 border-border", className)}>
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
            onClick={handleTogglePlay}
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

        {/* Title with word highlighting */}
        <div className="mt-6">
          <div className="text-center text-xl sm:text-2xl font-semibold leading-tight px-4">
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
                return currentClip?.sentence_text ?? "Loading..."
              })()
            ) : (
              currentClip?.sentence_text ?? "Loading..."
            )}
          </div>
        </div>

        {/* Playback speeds */}
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
    </div>
  )
}
