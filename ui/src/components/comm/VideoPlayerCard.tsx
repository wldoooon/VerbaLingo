"use client"

import YouTube, { YouTubePlayer } from "react-youtube"
import { useRef, useEffect } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchStore } from "@/store/useSearchStore"
import { useSearch } from "@/lib/useApi"
import { FacetChips } from "@/components/comm/FacetChips"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

function getClipStart(clip: any): number {
  if (!clip) return 0
  let start = 0
  if (typeof clip.start === "number") start = clip.start
  else if (typeof clip.start_time === "number") start = clip.start_time

  // Start 2.5s early to ensure context before the keyword
  return Math.max(0, start - 2.5)
}

type VideoPlayerCardProps = {
  className?: string
}

export default function VideoPlayerCard({ className }: VideoPlayerCardProps) {
  const { state, dispatch, playerRef, setPlayerState } = usePlayerContext()
  const { currentVideoIndex, isMuted } = state
  const router = useRouter()

  // Read playlist from React Query cache
  const { query, category, language } = useSearchStore()
  const { data } = useSearch(query, language, category)
  const playlist = data?.hits || []

  // Triple Player Logic (Pool of 3)
  const activeKey = (['A', 'B', 'C'] as const)[currentVideoIndex % 3]

  const windowIndices = [currentVideoIndex, currentVideoIndex + 1, currentVideoIndex + 2]

  const indexA = windowIndices.find(i => i % 3 === 0)
  const indexB = windowIndices.find(i => i % 3 === 1)
  const indexC = windowIndices.find(i => i % 3 === 2)

  const clipA = indexA !== undefined ? playlist[indexA] : undefined
  const clipB = indexB !== undefined ? playlist[indexB] : undefined
  const clipC = indexC !== undefined ? playlist[indexC] : undefined

  const playerARef = useRef<YouTubePlayer | null>(null)
  const playerBRef = useRef<YouTubePlayer | null>(null)
  const playerCRef = useRef<YouTubePlayer | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sync global playerRef & JIT Seek
  useEffect(() => {
    let newActivePlayer: YouTubePlayer | null = null
    if (activeKey === 'A') newActivePlayer = playerARef.current
    if (activeKey === 'B') newActivePlayer = playerBRef.current
    if (activeKey === 'C') newActivePlayer = playerCRef.current

    playerRef.current = newActivePlayer

    if (newActivePlayer && typeof newActivePlayer.playVideo === 'function') {
      // JIT Seek: Ensure the transition lands on the exact frame
      const activeClip = activeKey === 'A' ? clipA : activeKey === 'B' ? clipB : clipC
      if (activeClip) {
        const start = getClipStart(activeClip)
        newActivePlayer.seekTo(start, true)
      }

      newActivePlayer.playVideo()

      if (isMuted) {
        if (typeof newActivePlayer.mute === 'function') newActivePlayer.mute()
      } else {
        if (typeof newActivePlayer.unMute === 'function') {
          newActivePlayer.unMute()
          try { newActivePlayer.setVolume(100) } catch { }
        }
      }
    }
  }, [activeKey, playerRef, isMuted, clipA, clipB, clipC])

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
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const onStateChange = (event: { data: number; target: any }, key: 'A' | 'B' | 'C') => {
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

    setPlayerState(prev => ({ ...prev, isPlaying: isNowPlaying }))

    if (isNowPlaying) startPolling()
    else stopPolling()
  }

  // Effect: Recycled players must be manually seeked when their video changes
  useEffect(() => {
    if (playerARef.current && clipA) {
      playerARef.current.seekTo(getClipStart(clipA), true)
      if (activeKey !== 'A') playerARef.current.playVideo()
    }
  }, [clipA?.video_id])

  useEffect(() => {
    if (playerBRef.current && clipB) {
      playerBRef.current.seekTo(getClipStart(clipB), true)
      if (activeKey !== 'B') playerBRef.current.playVideo()
    }
  }, [clipB?.video_id])

  useEffect(() => {
    if (playerCRef.current && clipC) {
      playerCRef.current.seekTo(getClipStart(clipC), true)
      if (activeKey !== 'C') playerCRef.current.playVideo()
    }
  }, [clipC?.video_id])


  const onReady = (event: { target: YouTubePlayer }, key: 'A' | 'B' | 'C') => {
    if (key === 'A') playerARef.current = event.target
    if (key === 'B') playerBRef.current = event.target
    if (key === 'C') playerCRef.current = event.target

    let clip: any = null
    if (key === 'A') clip = clipA
    if (key === 'B') clip = clipB
    if (key === 'C') clip = clipC

    if (clip) {
      const start = getClipStart(clip)
      event.target.seekTo(start, true)
    }

    if (key === activeKey) {
      playerRef.current = event.target
      setPlayerState(prev => ({ ...prev, duration: event.target.getDuration() }))
      if (!isMuted) event.target.unMute()
    } else {
      event.target.mute()
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
    // Maintain current path (e.g. /search/[q]/[language]) 
    // and append category as a query parameter ?category=...
    const params = new URLSearchParams(window.location.search)
    params.set('category', facet)

    // Reset index if we change category
    params.delete('i')

    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  return (
    <div className={className}>
      <FacetChips
        aggregations={data?.aggregations}
        onSelect={handleFacetSelect}
        className="mb-3 -mt-2"
      />
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] overflow-hidden rounded-2xl bg-black">

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
              iframeClassName="w-full h-full"
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
              iframeClassName="w-full h-full"
            />
          )}
        </div>

        {/* Layer C */}
        <div className={cn("absolute inset-0 w-full h-full transition-opacity duration-300",
          activeKey === 'C' ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}>
          {clipC && (
            <YouTube
              videoId={clipC.video_id}
              opts={getOpts(clipC)}
              onReady={(e) => onReady(e, 'C')}
              onStateChange={(e) => onStateChange(e, 'C')}
              className="w-full h-full"
              iframeClassName="w-full h-full"
            />
          )}
        </div>

      </div>
    </div>
  )
}
