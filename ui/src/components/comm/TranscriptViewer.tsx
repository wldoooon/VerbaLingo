'use client'

import { useEffect, useState, useRef } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { useTranscript } from "@/lib/useApi"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, Loader, AlertTriangle } from "lucide-react"
import { TranscriptSentence } from "@/lib/types"

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default function TranscriptViewer() {
  const { state } = usePlayerContext()
  const { playlist, currentVideoIndex, currentTime } = state
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const activeSegmentRef = useRef<HTMLDivElement>(null)
  const [searchWord, setSearchWord] = useState<string>("")

  const currentVideo = playlist[currentVideoIndex];
  const videoId = currentVideo?.video_id;

  const { data, isLoading, isError } = useTranscript(videoId);

  useEffect(() => {
    setActiveSegmentId(null)
  }, [currentVideoIndex])

  useEffect(() => {
    try {
      const q = localStorage.getItem('last_search_query') || ""
      setSearchWord(q.trim().toLowerCase())
    } catch {}
  }, [])

  useEffect(() => {
    if (data) {
      const adjustedTime = currentTime + 3; 
      console.log("Current time:", currentTime, "Adjusted time:", adjustedTime);
      const activeSegmentIndex = data.sentences.findIndex((segment) => {
        if (adjustedTime >= segment.start_time && adjustedTime < segment.end_time) {
          console.log("Active segment:", segment);
          return true;
        }
        return false;
      })
      if (activeSegmentIndex !== -1 && activeSegmentIndex !== activeSegmentId) {
        setActiveSegmentId(activeSegmentIndex)
      }
    }
  }, [currentTime, activeSegmentId, data])

  useEffect(() => {
    if (activeSegmentRef.current && scrollAreaRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [activeSegmentId])

  const handleSegmentClick = (segment: TranscriptSentence, index: number) => {
    setActiveSegmentId(index)
  }

  function renderSegmentText(segment: TranscriptSentence, isActive: boolean) {
    const text = segment.sentence_text
    if (!text) return null
    const words = text.split(/(\s+)/) // keep spaces
    // Compute current word index if active using even distribution across the segment
    let activeWordIdx = -1
    if (isActive) {
      const adjustedTime = currentTime + 3
      const duration = Math.max(0.001, segment.end_time - segment.start_time)
      const elapsed = Math.min(Math.max(0, adjustedTime - segment.start_time), duration)
      const onlyWords = text.split(/\s+/)
      const idx = Math.min(onlyWords.length - 1, Math.floor((elapsed / duration) * onlyWords.length))
      // Map back to index in words-with-spaces array
      let count = 0
      for (let i = 0; i < words.length; i++) {
        if (!/\s+/.test(words[i])) {
          if (count === idx) {
            activeWordIdx = i
            break
          }
          count++
        }
      }
    }
    return words.map((w, i) => {
      const normalized = w.replace(/[^\p{L}\p{N}']/gu, '').toLowerCase()
      const isSpace = /\s+/.test(w)
      const isSearchHit = !isSpace && searchWord && normalized === searchWord
      const isCurrent = i === activeWordIdx
      const cls = isSpace
        ? ""
        : isCurrent
          ? "bg-primary/80 text-primary-foreground rounded px-0.5"
          : isSearchHit
            ? "underline decoration-wavy decoration-primary/70"
            : ""
      return (
        <span key={i} className={cls}>{w}</span>
      )
    })
  }

  if (playlist.length === 0) {
    return (
      <div className="w-full h-[350px] md:h-[400px] rounded-lg bg-muted/30 p-4 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-2">No Transcript Available</h3>
          <p className="text-muted-foreground text-sm">Select a video clip to view its transcript</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
        <div className="w-full h-[350px] md:h-[400px] rounded-lg bg-muted/30 p-4 flex items-center justify-center">
            <div className="text-center">
                <Loader className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-spin" />
                <h3 className="text-base font-semibold mb-2">Loading Transcript...</h3>
                <p className="text-muted-foreground text-sm">Please wait a moment</p>
            </div>
        </div>
    )
  }

  if (isError) {
      return (
          <div className="w-full h-[350px] md:h-[400px] rounded-lg bg-muted/30 p-4 flex items-center justify-center">
              <div className="text-center">
                  <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
                  <h3 className="text-base font-semibold mb-2">Error Loading Transcript</h3>
                  <p className="text-muted-foreground text-sm">There was a problem fetching the transcript.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="w-full h-[350px] md:h-[400px] rounded-lg bg-muted/30">
      {/* Header */}
      <div className="p-3 bg-muted/50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-sm">Transcript</h3>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-3rem)] p-3" ref={scrollAreaRef}>
        <div className="space-y-2">
          {data?.sentences.map((segment, index) => {
            const isActive = index === activeSegmentId
            const isPast = currentTime > segment.end_time
            const isFuture = currentTime < segment.start_time

            return (
              <div
                key={index}
                ref={isActive ? activeSegmentRef : null}
                onClick={() => handleSegmentClick(segment, index)}
                className={`group relative p-2.5 rounded-md cursor-pointer transition-all duration-200 ${
                  isActive ? "bg-primary/10 shadow-sm" : isPast ? "bg-muted/30 hover:bg-muted/50" : "hover:bg-muted/50"
                }`}
              >
                {/* Time Badge */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`text-xs font-mono px-1.5 py-0.5 ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {formatTime(segment.start_time)}
                  </Badge>
                </div>

                {/* Transcript Text */}
                <p
                  className={`text-xs leading-relaxed transition-colors duration-200 ${
                    isActive
                      ? "text-foreground font-medium"
                      : isPast
                        ? "text-muted-foreground"
                        : isFuture
                          ? "text-muted-foreground/70"
                          : "text-foreground"
                  }`}
                >
                  {renderSegmentText(segment, isActive)}
                </p>

                {/* Active Indicator */}
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}