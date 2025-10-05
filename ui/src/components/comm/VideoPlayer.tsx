'use client'

import dynamic from "next/dynamic"
const YouTube = dynamic(() => import("react-youtube"), { ssr: false })
import { useEffect, useState, useRef } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useSearch } from "@/lib/useApi"
import { Button } from "@/components/ui/button"

import { ChevronLeft, ChevronRight, Search, Play, Pause } from "lucide-react"
import { YouTubePlayer } from "react-youtube"

function getClipStart(clip: any): number {
  if (!clip) return 0
  if (typeof clip.start === "number") return clip.start
  if (typeof clip.start_time === "number") return clip.start_time
  return 0
}

function thumb(videoId?: string) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : ""
}

export default function VideoPlayer() {
  const { state, dispatch } = usePlayerContext()
  const { currentVideoIndex, isMuted } = state
  
  // Read playlist from React Query cache
  const { query, category } = useSearchParams()
  const { data } = useSearch(query, category)
  const playlist = data?.hits || []
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Clean up interval on video change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [uniqueKey])

  useEffect(() => {
    const ids = [playlist[currentVideoIndex + 1]?.video_id, playlist[currentVideoIndex - 1]?.video_id].filter(
      Boolean,
    ) as string[]
    ids.forEach((id) => {
      const img = new Image()
      img.src = thumb(id)
    })
  }, [playlist, currentVideoIndex])


  const handleNextVideo = () => dispatch({ type: "NEXT_VIDEO" })
  const handlePrevVideo = () => dispatch({ type: "PREV_VIDEO" })

  const handleTogglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }
  }

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime();
      if (typeof currentTime === 'number') {
        dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
      }
    }, 250);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const onPlayerStateChange = (event: { data: number }) => {
    // Playing
    if (event.data === 1) {
      setIsPlaying(true)
      startPolling();
    } else { // Paused, ended, buffering
      setIsPlaying(false)
      stopPolling();
    }
  };

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

  const heroClass = "relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px] xl:h-[700px] overflow-hidden rounded-2xl"

  // Transcript overlay removed; handled in AudioCard

  return (
    <div className="w-full">
      {currentVideoId ? (
        <div className={`${heroClass} border shadow-lg`}>
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              ready ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="absolute inset-0 rounded-2xl border bg-muted/50 overflow-hidden">
              {currentVideoId && (
                <img
                  src={thumb(currentVideoId) || "/placeholder.svg"}
                  alt=""
                  decoding="async"
                  className="h-full w-full object-cover scale-105 blur-sm"
                />
              )}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-background/15 to-transparent animate-[shimmer_1.6s_infinite]"
                style={{ backgroundSize: "200% 100%" }}
              />
            </div>
          </div>

          <div className={`absolute inset-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
          {/* Transparent overlay to block direct iframe interactions */}
            <div className="absolute inset-0 z-10" />
            <YouTube
              key={uniqueKey}
              videoId={currentVideoId}
              opts={opts}
              onReady={(e) => {
                playerRef.current = e.target;
                try {
                  // Expose simple global controls for other components (e.g., AudioCard)
                  ;(window as any).playerPlayClip = () => playerRef.current?.playVideo()
                  ;(window as any).playerPauseClip = () => playerRef.current?.pauseVideo()
                  ;(window as any).playerToggleClip = () => {
                    try {
                      const state = playerRef.current?.getPlayerState?.()
                      // 1 = playing per YT API
                      if (state === 1) {
                        playerRef.current?.pauseVideo()
                      } else {
                        playerRef.current?.playVideo()
                      }
                    } catch {}
                  }
                } catch {}
                try {
                  e.target.seekTo(rawStart, true)
                } catch {}
                setReady(true)
              }}
              onStateChange={onPlayerStateChange}
              onEnd={handleNextVideo}
              className="absolute inset-0 h-full w-full rounded-2xl"
            />
            {/* Transcript overlay removed */}
          </div>

          <style jsx>{`
            @keyframes shimmer {
              0% {
                background-position: 200% 0;
              }
              100% {
                background-position: -200% 0;
              }
            }
          `}</style>
        </div>
      ) : (
        <div
          className={`${heroClass} flex items-center justify-center bg-muted/50 border border-dashed border-muted-foreground/25 shadow-lg`}
        >
          <div className="text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No clips loaded</h3>
            <p className="text-muted-foreground">Search for a word to start watching clips</p>
          </div>
        </div>
      )}

      {/* Removed inline Play/Pause control below the video */}
    </div>
  )
}