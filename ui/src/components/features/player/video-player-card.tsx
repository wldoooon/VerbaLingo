"use client"

import YouTube, { YouTubePlayer } from "react-youtube"
import { useRef, useEffect, useMemo } from "react"
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

  // Exact start - NO DELAY - faster loading & more precise UX
  return Math.max(0, start)
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
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(-1)
  const mountedRef = useRef(true)
  const playerMountTimeRef = useRef<number>(performance.now())
  // Tracks whether the active player is playing — background turbo buffer waits for this
  const activeIsPlayingRef = useRef(false)

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
    activeIsPlayingRef.current = false

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
        // BACKGROUND PLAYER - explicitly mute and ensure it's cued/paused to buffer but NOT competing for bandwidth
        safeCall(player, 'mute')
        safeCall(player, 'pauseVideo') // Stop background playback to save HD bandwidth for active one
      }
    }

    syncSinglePlayer('A', playerARef.current)
    syncSinglePlayer('B', playerBRef.current)

  }, [activeKey, activeClipId, isMuted, playbackRate, setPlayer, clipA?.video_id, clipB?.video_id])

  const startPolling = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const tick = () => {
      try {
        // Always read the latest player from the store — avoids stale closure when clips change
        const t = usePlayerStore.getState().player?.getCurrentTime()
        if (typeof t === 'number' && t !== lastTimeRef.current) {
          lastTimeRef.current = t
          setCurrentTime(t)
        }
      } catch {
        // YouTube player can throw when not ready or when the iframe is being destroyed
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const stopPolling = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  // Cancel rAF, clear stale player refs, and mark unmounted on cleanup.
  // setPlayer(null) prevents AudioCard from calling playVideo() on the dead iframe after navigation.
  // mountedRef blocks the onReady setTimeout from firing on a dead player (→ null.src crash).
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      playerARef.current = null
      playerBRef.current = null
      setPlayer(null)
    }
  }, [])

  const onStateChange = (event: { data: number; target: any }, key: 'A' | 'B') => {
    const stateNames: Record<string, string> = { '-1': 'unstarted', '0': 'ended', '1': 'playing', '2': 'paused', '3': 'buffering', '5': 'cued' }
    const stateClip = key === 'A' ? clipA : clipB
    console.log(`[PERF] player${key} stateChange  state=${stateNames[String(event.data)] ?? event.data}  video=${stateClip?.video_id}  isActive=${key === activeKey}  +${Math.round(performance.now() - playerMountTimeRef.current)}ms`)

    if (key !== activeKey) {
      if (event.data === 1) {
        safeCall(event.target, 'mute')
      }
      return
    }

    const isNowPlaying = event.data === 1

    if (isNowPlaying && !isMuted) {
      safeCall(event.target, 'unMute')
    }

    if (isNowPlaying) {
      activeIsPlayingRef.current = true
      // Upgrade to HD once the clip is actually playing — buffer at medium first for speed
      try {
        if (typeof event.target.setPlaybackQuality === 'function') {
          event.target.setPlaybackQuality('hd720')
        }
      } catch {}
    }

    setPlayerState({ isPlaying: isNowPlaying })

    if (isNowPlaying) startPolling()
    else stopPolling()
  }

  // Effect: Recycled players must be manually seeked when their video changes.
  useEffect(() => {
    if (clipA) {
      safeCall(playerARef.current, 'seekTo', getClipStart(clipA), true)
      const liveActiveKey = (['A', 'B'] as const)[usePlayerStore.getState().currentVideoIndex % 2]
      if (liveActiveKey !== 'A') safeCall(playerARef.current, 'pauseVideo')
    }
  }, [clipA?.video_id])

  useEffect(() => {
    if (clipB) {
      safeCall(playerBRef.current, 'seekTo', getClipStart(clipB), true)
      const liveActiveKey = (['A', 'B'] as const)[usePlayerStore.getState().currentVideoIndex % 2]
      if (liveActiveKey !== 'B') safeCall(playerBRef.current, 'pauseVideo')
    }
  }, [clipB?.video_id])


  const onReady = (event: { target: YouTubePlayer }, key: 'A' | 'B') => {
    if (!event.target) return
    const readyMs = Math.round(performance.now() - playerMountTimeRef.current)
    const clip = key === 'A' ? clipA : clipB
    console.log(`[PERF] player${key} onReady  video=${clip?.video_id}  isActive=${key === activeKey}  +${readyMs}ms since mount`)

    if (key === 'A') playerARef.current = event.target
    if (key === 'B') playerBRef.current = event.target

    if (clip) {
      safeCall(event.target, 'seekTo', getClipStart(clip), true)
    }

    if (key === activeKey) {
      setPlayer(event.target)
      try { 
        if (typeof event.target.getDuration === 'function') {
          setPlayerState({ duration: event.target.getDuration() }) 
        }
      } catch { }
      if (!isMuted) safeCall(event.target, 'unMute')
    } else {
      safeCall(event.target, 'mute')
      // TURBO BUFFER: wait until active player is playing before buffering background,
      // so we don't compete for bandwidth during the active player's critical load window.
      // Always read activeKey from store (fresh) to avoid stale closure bugs when the
      // user navigates to the next clip while a setTimeout is in flight.
      const getLiveActiveKey = () => (['A', 'B'] as const)[usePlayerStore.getState().currentVideoIndex % 2]

      const triggerBuffer = () => {
        if (!mountedRef.current) return
        if (key === getLiveActiveKey()) return  // this slot is now active — don't buffer/pause it
        safeCall(event.target, 'playVideo')
        setTimeout(() => {
          if (!mountedRef.current) return
          if (key !== getLiveActiveKey()) safeCall(event.target, 'pauseVideo')
        }, 1200)
      }

      const poll = setInterval(() => {
        if (!mountedRef.current) { clearInterval(poll); return }
        if (activeIsPlayingRef.current) { clearInterval(poll); triggerBuffer() }
      }, 300)
      // Fallback: start after 6s regardless so background is still cached if active stalls
      setTimeout(() => { clearInterval(poll); triggerBuffer() }, 6000)
    }
  }

  // Memoized per video_id — stable reference prevents react-youtube from
  // destroying and recreating the iframe on every render (fixes double onReady).
  // Start at medium quality so YouTube buffers faster; upgrade to hd720 once playing.
  const buildOpts = (clip: any) => ({
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
      origin: typeof window !== "undefined" ? window.location.origin : "",
      vq: 'medium',
    },
    loading: "eager",
  } as const)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optsA = useMemo(() => buildOpts(clipA), [clipA?.video_id])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optsB = useMemo(() => buildOpts(clipB), [clipB?.video_id])

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
          <YouTube
            videoId={clipA?.video_id || ""}
            opts={optsA}
            onReady={(e) => onReady(e, 'A')}
            onStateChange={(e) => onStateChange(e, 'A')}
            className="w-full h-full"
            iframeClassName="w-full h-full border-none"
          />
        </div>

        {/* Layer B */}
        <div className={cn("absolute inset-0 w-full h-full transition-opacity duration-300",
          activeKey === 'B' ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}>
          <YouTube
            videoId={clipB?.video_id || ""}
            opts={optsB}
            onReady={(e) => onReady(e, 'B')}
            onStateChange={(e) => onStateChange(e, 'B')}
            className="w-full h-full"
            iframeClassName="w-full h-full border-none"
          />
        </div>

      </div>
    </div>
  )
}
