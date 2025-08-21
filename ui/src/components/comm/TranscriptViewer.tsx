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
  const { playlist, currentVideoIndex } = state
  const [currentTime, setCurrentTime] = useState(0)
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const activeSegmentRef = useRef<HTMLDivElement>(null)

  const currentVideo = playlist[currentVideoIndex];
  const videoId = currentVideo?.video_id;

  const { data, isLoading, isError } = useTranscript(videoId);

  useEffect(() => {
    if (playlist.length === 0) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [playlist.length])

  useEffect(() => {
    setCurrentTime(0)
    setActiveSegmentId(null)
  }, [currentVideoIndex])

  useEffect(() => {
    if (data) {
      const activeSegmentIndex = data.sentences.findIndex((segment) => currentTime >= segment.start_time && currentTime < segment.end_time)
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
    setCurrentTime(segment.start_time)
    setActiveSegmentId(index)
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
                  {segment.sentence_text}
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