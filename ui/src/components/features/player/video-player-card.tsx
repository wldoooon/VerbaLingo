"use client"

import YouTube, { YouTubePlayer } from "react-youtube"
import { useRef, useEffect } from "react"
import { usePlayerStore } from "@/stores/use-player-store"
import { useSearchStore } from "@/stores/use-search-store"
import { FacetChips } from "@/components/comm/FacetChips"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Clips } from "@/lib/types"

function getClipStart(clip: any): number {
  if (!clip) return 0
  let start = 0
  if (typeof clip.start === "number") start = clip.start
  else if (typeof clip.start_time === "number") start = clip.start_time

  // Start 2.5s early to ensure context before the keyword
  return Math.max(0, start - 2.5)
}

type VideoPlayerCardProps = {
  playlist: Clips[]
  isFetching?: boolean
  aggregations?: Record<string, number>
  className?: string
}

export default function VideoPlayerCard({
  playlist,
  isFetching,
  aggregations,
  className
}: VideoPlayerCardProps) {
  const {
    currentVideoIndex,
    isMuted,
    playbackRate,
    setCurrentTime,
    setPlayerState,
    setPlayer,
    player: activePlayer,
    resetIndex
  } = usePlayerStore()
  const router = useRouter()

  // Read playlist from React Query cache
  const { category, language, subCategory, setSubCategory, lastAggregations, setLastAggregations } = useSearchStore()

  // Tracking for logic isolation
  const lastSeekedClipId = useRef<string | null>(null)

  // Sync aggregations only when there is no sub-category (to keep "all chips" context)
  useEffect(() => {
    if (aggregations && !subCategory) {
      setLastAggregations(aggregations);
    }
  }, [aggregations, subCategory, setLastAggregations]);

  // Dual Player Logic (Pool of 2: Active + Buffer)
  const activeKey = (['A', 'B'] as const)[currentVideoIndex % 2]

  const windowIndices = [currentVideoIndex, currentVideoIndex + 1]

  const indexA = windowIndices.find(i => i % 2 === 0)
  const indexB = windowIndices.find(i => i % 2 === 1)

  const clipA = indexA !== undefined ? playlist[indexA] : undefined
  const clipB = indexB !== undefined ? playlist[indexB] : undefined

  const playerARef = useRef<YouTubePlayer | null>(null)
  const playerBRef = useRef<YouTubePlayer | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Safe wrapper for all YouTube player calls.
   */
  const safeCall = (player: YouTubePlayer | null, fn: string, ...args: any[]) => {
    try {
      if (player && typeof (player as any)[fn] === 'function') {
        (player as any)[fn](...args)
      }
    } catch {
      // ignore
    }
  }

  // Sync global playerRef & JIT Seek + Audio Isolation
  const activeClipId = activeKey === 'A' ? clipA?.video_id : clipB?.video_id

  useEffect(() => {
    // 1. Identify and set the globally active player instance for controls
    let currentActive: YouTubePlayer | null = null
    if (activeKey === 'A') currentActive = playerARef.current
    if (activeKey === 'B') currentActive = playerBRef.current
    
    // Always update the active player ref in store when it shifts
    setPlayer(currentActive)

    const syncSinglePlayer = (key: 'A' | 'B', player: YouTubePlayer | null) => {
      if (!player) return
      const isActuallyActive = key === activeKey
      const clip = key === 'A' ? clipA : clipB
      if (!clip) return

      if (isActuallyActive) {
        // ACTIVE PLAYER configuration
        
        // Only seek if this is the FIRST time we are seeing this video ID as active
        if (lastSeekedClipId.current !== clip.video_id) {
            safeCall(player, 'seekTo', getClipStart(clip), true)
            lastSeekedClipId.current = clip.video_id
        }
        
        safeCall(player, 'playVideo')
        safeCall(player, 'setPlaybackRate', playbackRate)

        // Apply global mute state
        if (isMuted) {
          safeCall(player, 'mute')
        } else {
          safeCall(player, 'unMute')
          safeCall(player, 'setVolume', 100)
        }
      } else {
        // BACKGROUND PLAYER - explicitly mute and ensure it's playing (buffering) if it's the next video
        safeCall(player, 'mute')
        safeCall(player, 'playVideo') // Keep it playing in background to buffer
      }
    }

    syncSinglePlayer('A', playerARef.current)
    syncSinglePlayer('B', playerBRef.current)

  }, [activeKey, activeClipId, isMuted, playbackRate, setPlayer, clipA?.video_id, clipB?.video_id])

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const currentTime = activePlayer?.getCurrentTime()
      if (typeof currentTime === 'number') {
        setCurrentTime(currentTime)
      }
    }, 100)
  }

  const stopPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const onStateChange = (event: { data: number; target: any }, key: 'A' | 'B') => {
    if (key !== activeKey) {
      if (event.data === 1 && typeof event.target.mute === 'function') {
        event.target.mute()
      }
      return
    }

    const isNowPlaying = event.data === 1

    if (isNowPlaying && !isMuted) {
      event.target.unMute()
    }

    setPlayerState({ isPlaying: isNowPlaying })

    if (isNowPlaying) startPolling()
    else stopPolling()
  }

  // Effect: Recycled players must be manually seeked when their video changes.
  useEffect(() => {
    playerARef.current = null          
    if (clipA) {
      safeCall(playerARef.current, 'seekTo', getClipStart(clipA), true)
      if (activeKey !== 'A') safeCall(playerARef.current, 'playVideo')
    }
  }, [clipA?.video_id])

  useEffect(() => {
    playerBRef.current = null
    if (clipB) {
      safeCall(playerBRef.current, 'seekTo', getClipStart(clipB), true)
      if (activeKey !== 'B') safeCall(playerBRef.current, 'playVideo')
    }
  }, [clipB?.video_id])


  const onReady = (event: { target: YouTubePlayer }, key: 'A' | 'B') => {
    if (key === 'A') playerARef.current = event.target
    if (key === 'B') playerBRef.current = event.target

    let clip: any = null
    if (key === 'A') clip = clipA
    if (key === 'B') clip = clipB

    if (clip) {
      safeCall(event.target, 'seekTo', getClipStart(clip), true)
    }

    if (key === activeKey) {
      setPlayer(event.target)
      safeCall(event.target, 'getDuration') 
      try { setPlayerState({ duration: event.target.getDuration() }) } catch { }
      if (!isMuted) safeCall(event.target, 'unMute')
    } else {
      safeCall(event.target, 'mute')
      safeCall(event.target, 'playVideo') // Buffer background
    }
  }

  const getOpts = (clip: any) => ({
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      mute: 1,
      start: Math.max(0, Math.floor(getClipStart(clip))),
      modestbranding: 1,
      rel: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      cc_load_policy: 0,
      loop: 1,
      playlist: clip?.video_id,
    },
    loading: "eager",
  } as const)

  // Handle facet selection
  const handleFacetSelect = (facet: string) => {
    if (facet === subCategory) {
      setSubCategory(null); // Deselect
    } else {
      setSubCategory(facet);
    }
    // Reset index if we change category
    resetIndex();
  }

  return (
    <div className={className}>
      <FacetChips
        aggregations={lastAggregations || aggregations}
        onSelect={handleFacetSelect}
        selectedCategory={subCategory}
        isLoading={isFetching}
        className="mb-3 -mt-2"
      />
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] overflow-hidden rounded-2xl bg-black shadow-inner">

        {/* Layer A */}
        <div className={cn("absolute inset-0 w-full h-full transition-opacity duration-300",
          activeKey === 'A' ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}>
          {clipA && (
            <YouTube
              videoId={clipA.video_id}
              opts={getOpts(clipA)}
              onReady={(e) => onReady(e, 'A')}
              onStateChange={(e) => onStateChange(e, 'A')}
              className="w-full h-full"
              iframeClassName="w-full h-full border-none"
            />
          )}
        </div>

        {/* Layer B */}
        <div className={cn("absolute inset-0 w-full h-full transition-opacity duration-300",
          activeKey === 'B' ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}>
          {clipB && (
            <YouTube
              videoId={clipB.video_id}
              opts={getOpts(clipB)}
              onReady={(e) => onReady(e, 'B')}
              onStateChange={(e) => onStateChange(e, 'B')}
              className="w-full h-full"
              iframeClassName="w-full h-full border-none"
            />
          )}
        </div>

      </div>
    </div>
  )
}
