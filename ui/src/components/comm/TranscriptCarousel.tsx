'use client'

import { useEffect, useState, useRef } from "react"
import { usePlayerContext } from "@/context/PlayerContext"
import { useTranscript } from "@/lib/useApi"
import useEmblaCarousel from 'embla-carousel-react'

export default function TranscriptCarousel() {
  const { state } = usePlayerContext()
  const { playlist, currentVideoIndex, currentTime } = state
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });

  const currentVideo = playlist[currentVideoIndex];
  const videoId = currentVideo?.video_id;

  const { data, isLoading, isError } = useTranscript(videoId);

  useEffect(() => {
    setActiveSegmentId(null)
  }, [currentVideoIndex])

  useEffect(() => {
    if (data) {
      const adjustedTime = currentTime + 3; 
      const activeSegmentIndex = data.sentences.findIndex((segment) => {
        if (adjustedTime >= segment.start_time && adjustedTime < segment.end_time) {
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
    if (emblaApi && activeSegmentId !== null) {
      emblaApi.scrollTo(activeSegmentId);
    }
  }, [emblaApi, activeSegmentId]);

  if (isLoading || isError || !data) {
    return (
        <div className="text-center text-lg">
            <span className="text-zinc-400">{isLoading ? "Loading transcript..." : isError ? "Error loading transcript" : "No transcript available"}</span>
        </div>
    )
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
            {data.sentences.map((segment, index) => {
                const isActive = index === activeSegmentId
                return (
                    <div className="flex-shrink-0 w-full" key={index}>
                        <p className={`text-center text-lg transition-colors duration-200 ${isActive ? "text-white font-semibold" : "text-zinc-400"}`}>
                            {segment.sentence_text}
                        </p>
                    </div>
                )
            })}
        </div>
    </div>
  )
}
