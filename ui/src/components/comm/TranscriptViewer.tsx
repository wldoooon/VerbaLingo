"use client"

import { useEffect, useState, useRef } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare } from "lucide-react"

interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
  speaker?: string
}

// Mock transcript data
const mockTranscript: TranscriptSegment[] = [
  { id: 1, start: 0, end: 3, text: "Welcome to this amazing video tutorial.", speaker: "Host" },
  { id: 2, start: 3, end: 7, text: "Today we're going to learn about web development.", speaker: "Host" },
  { id: 3, start: 7, end: 12, text: "First, let's talk about the fundamentals of HTML and CSS.", speaker: "Host" },
  { id: 4, start: 12, end: 16, text: "HTML provides the structure of web pages.", speaker: "Host" },
  { id: 5, start: 16, end: 21, text: "While CSS handles the styling and layout.", speaker: "Host" },
  { id: 6, start: 21, end: 26, text: "JavaScript adds interactivity to your websites.", speaker: "Host" },
  {
    id: 7,
    start: 26,
    end: 31,
    text: "These three technologies form the foundation of modern web development.",
    speaker: "Host",
  },
  { id: 8, start: 31, end: 36, text: "Let's dive deeper into each of these technologies.", speaker: "Host" },
  {
    id: 9,
    start: 36,
    end: 41,
    text: "Starting with HTML, which stands for HyperText Markup Language.",
    speaker: "Host",
  },
  {
    id: 10,
    start: 41,
    end: 46,
    text: "HTML uses tags to define the structure and content of web pages.",
    speaker: "Host",
  },
  { id: 11, start: 46, end: 51, text: "Common HTML tags include headings, paragraphs, and links.", speaker: "Host" },
  {
    id: 12,
    start: 51,
    end: 56,
    text: "CSS, or Cascading Style Sheets, controls the visual presentation.",
    speaker: "Host",
  },
  {
    id: 13,
    start: 56,
    end: 61,
    text: "You can change colors, fonts, layouts, and animations with CSS.",
    speaker: "Host",
  },
  {
    id: 14,
    start: 61,
    end: 66,
    text: "JavaScript brings your web pages to life with dynamic behavior.",
    speaker: "Host",
  },
  {
    id: 15,
    start: 66,
    end: 71,
    text: "You can handle user interactions and update content in real-time.",
    speaker: "Host",
  },
]

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

  // Simulate current playback time (in a real app, this would come from the video player)
  useEffect(() => {
    if (playlist.length === 0) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [playlist.length])

  // Reset time when video changes
  useEffect(() => {
    setCurrentTime(0)
    setActiveSegmentId(null)
  }, [currentVideoIndex])

  // Find active segment based on current time
  useEffect(() => {
    const activeSegment = mockTranscript.find((segment) => currentTime >= segment.start && currentTime < segment.end)

    if (activeSegment && activeSegment.id !== activeSegmentId) {
      setActiveSegmentId(activeSegment.id)
    }
  }, [currentTime, activeSegmentId])

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && scrollAreaRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [activeSegmentId])

  const handleSegmentClick = (segment: TranscriptSegment) => {
    setCurrentTime(segment.start)
    setActiveSegmentId(segment.id)
    // In a real app, you would seek the video player to this time
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

      {/* Transcript Content */}
      <ScrollArea className="h-[calc(100%-3rem)] p-3" ref={scrollAreaRef}>
        <div className="space-y-2">
          {mockTranscript.map((segment) => {
            const isActive = segment.id === activeSegmentId
            const isPast = currentTime > segment.end
            const isFuture = currentTime < segment.start

            return (
              <div
                key={segment.id}
                ref={isActive ? activeSegmentRef : null}
                onClick={() => handleSegmentClick(segment)}
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
                    {formatTime(segment.start)}
                  </Badge>
                  {segment.speaker && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {segment.speaker}
                    </Badge>
                  )}
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
                  {segment.text}
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
