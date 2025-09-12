'use client'

import dynamic from "next/dynamic"
const YouTube = dynamic(() => import("react-youtube"), { ssr: false })
import { useEffect, useState, useRef } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { Button } from "@/components/ui/button"

import { ChevronLeft, ChevronRight, Search } from "lucide-react"
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
  const { playlist, currentVideoIndex, isMuted } = state
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentClip = playlist[currentVideoIndex]
  const currentVideoId = currentClip?.video_id

  const rawStart = getClipStart(currentClip)
  const startSec = Math.max(0, Math.floor(rawStart))
  const uniqueKey = `${currentVideoId}-${currentVideoIndex}-${rawStart}`

  const [ready, setReady] = useState(false)

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

  const handleMute = () => dispatch({ type: "SET_MUTED", payload: true })
  const handleUnMute = () => dispatch({ type: "SET_MUTED", payload: false })
  const handleNextVideo = () => dispatch({ type: "NEXT_VIDEO" })
  const handlePrevVideo = () => dispatch({ type: "PREV_VIDEO" })

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
      startPolling();
    } else { // Paused, ended, buffering
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
    },
    loading: "eager",
  } as const

  const heroClass = "relative w-full h-[600px] md:h-[550px] overflow-hidden rounded-lg"

  return (
    <div className="w-full">
      {currentVideoId ? (
        <div className={heroClass}>
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              ready ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="absolute inset-0 rounded-lg border bg-muted/50 overflow-hidden">
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
            <YouTube
              key={uniqueKey}
              videoId={currentVideoId}
              opts={opts}
              onReady={(e) => {
                playerRef.current = e.target;
                try {
                  e.target.seekTo(rawStart, true)
                } catch {}
                setReady(true)
              }}
              onStateChange={onPlayerStateChange}
              onEnd={handleNextVideo}
              onMute={handleMute}
              onUnMute={handleUnMute}
              className="absolute inset-0 h-full w-full rounded-lg"
            />
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
          className={`${heroClass} flex items-center justify-center bg-muted/50 border border-dashed border-muted-foreground/25`}
        >
          <div className="text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No clips loaded</h3>
            <p className="text-muted-foreground">Search for a word to start watching clips</p>
          </div>
        </div>
      )}

      
    </div>
  )
}