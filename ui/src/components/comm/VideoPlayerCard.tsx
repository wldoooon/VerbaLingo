"use client"

import dynamic from "next/dynamic"
const YouTube = dynamic(() => import("react-youtube"), { ssr: false })
import { useEffect, useState, useRef } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useSearch } from "@/lib/useApi"
import { YouTubePlayer } from "react-youtube"

function getClipStart(clip: any): number {
  if (!clip) return 0
  if (typeof clip.start === "number") return clip.start
  if (typeof clip.start_time === "number") return clip.start_time
  return 0
}

type VideoPlayerCardProps = {
  className?: string
}

export default function VideoPlayerCard({ className }: VideoPlayerCardProps) {
  const { state, dispatch } = usePlayerContext()
  const { currentVideoIndex, isMuted } = state
  
  // Read playlist from React Query cache
  const { query, category } = useSearchParams()
  const { data } = useSearch(query, category)
  const playlist = data?.hits || []
  
  const playerRef = useRef<YouTubePlayer | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Defensive: clamp currentVideoIndex to valid range
  const validIndex = Math.max(0, Math.min(currentVideoIndex, playlist.length - 1))
  const currentClip = playlist[validIndex]
  const currentVideoId = currentClip?.video_id

  const rawStart = getClipStart(currentClip)
  const startSec = Math.max(0, Math.floor(rawStart))
  const uniqueKey = `${currentVideoId}-${currentVideoIndex}-${rawStart}`

  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setReady(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [uniqueKey])

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime()
      if (typeof currentTime === 'number') {
        dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime })
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

  return (
    <div className={className}>
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
              ;(window as any).youtubePlayer = e.target
            }}
            onStateChange={onPlayerStateChange}
            className="absolute inset-0 w-full h-full"
            iframeClassName="w-full h-full"
          />
        )}
      </div>
    </div>
  )
}
