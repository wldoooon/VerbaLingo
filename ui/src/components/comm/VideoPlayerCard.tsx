"use client"

import YouTube from "react-youtube"
import { useRef } from "react"
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
  const { state, dispatch, playerRef, setPlayerState } = usePlayerContext()
  const { currentVideoIndex, isMuted } = state

  // Read playlist from React Query cache
  const { query, category } = useSearchParams()
  const { data } = useSearch(query, category)
  const playlist = data?.hits || []

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Defensive: clamp currentVideoIndex to valid range
  const validIndex = Math.max(0, Math.min(currentVideoIndex, playlist.length - 1))
  const currentClip = playlist[validIndex]
  const currentVideoId = currentClip?.video_id

  const rawStart = getClipStart(currentClip)
  const startSec = Math.max(0, Math.floor(rawStart))

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime()
      if (typeof currentTime === 'number') {
        dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime })
      }
    }, 100)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  // Event handler: YouTube player state changed
  const onPlayerStateChange = (event: { data: number }) => {
    const isNowPlaying = event.data === 1

    setPlayerState(prev => ({ ...prev, isPlaying: isNowPlaying }))

    if (isNowPlaying) {
      startPolling()
    } else {
      stopPolling()
    }
  }

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target
    const duration = event.target.getDuration()
    setPlayerState(prev => ({ ...prev, duration }))
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
      loop: 1,
      playlist: currentVideoId,
    },
    loading: "eager",
  } as const

  return (
    <div className={className}>
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] overflow-hidden rounded-2xl bg-black">
        {/* YouTube Player */}
        {currentVideoId && (
          <YouTube
            videoId={currentVideoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            className="absolute inset-0 w-full h-full"
            iframeClassName="w-full h-full"
          />
        )}
      </div>
    </div>
  )
}
