"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Clock, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Clip = {
  video_id: string
  start?: number
  start_time?: number
  title?: string
  sentence_text?: string
}

function getStart(clip: Clip) {
  if (typeof clip?.start === "number") return clip.start
  if (typeof clip?.start_time === "number") return clip.start_time
  return 0
}

function fmt(t: number) {
  const s = Math.max(0, Math.floor(t))
  const m = Math.floor(s / 60)
  const ss = String(s % 60).padStart(2, "0")
  return `${m}:${ss}`
}

function thumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
}

export default function ClipSlider({
  clips,
  currentIndex,
  onSelect,
}: {
  clips: Clip[]
  currentIndex: number
  onSelect: (index: number) => void
}) {
  const [viewportRef, embla] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    if (!embla) return

    const onSelect = () => {
      setCanScrollPrev(embla.canScrollPrev())
      setCanScrollNext(embla.canScrollNext())
    }

    embla.on("select", onSelect)
    embla.on("reInit", onSelect)
    onSelect()
  }, [embla])

  useEffect(() => {
    if (!embla) return
    embla.reInit()
  }, [embla, clips])

  useEffect(() => {
    if (!embla) return
    embla.scrollTo(currentIndex, true)
  }, [embla, currentIndex])

  const scrollPrev = () => embla && embla.scrollPrev()
  const scrollNext = () => embla && embla.scrollNext()

  if (!clips?.length) return null

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          Video Clips ({clips.length})
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} of {clips.length}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="h-8 w-8 p-0 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="h-8 w-8 p-0 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="embla relative">
        <div ref={viewportRef} className="overflow-hidden">
          <div className="flex gap-4 transition-transform duration-300 ease-out">
            {clips.map((c, i) => {
              const active = i === currentIndex
              const t = getStart(c)
              return (
                <button
                  key={`${c.video_id}-${i}-${t}`}
                  onClick={() => onSelect(i)}
                  className={`group relative flex-[0_0_auto] basis-[200px] md:basis-[240px] focus:outline-none transition-all duration-300 hover:scale-105 ${
                    active ? "ring-2 ring-primary rounded-xl scale-105" : ""
                  }`}
                  aria-current={active ? "true" : "false"}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                    <img
                      src={thumb(c.video_id) || "/placeholder.svg"}
                      alt={c.title ?? "clip"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Play Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-black ml-0.5" />
                      </div>
                    </div>

                    {/* Time Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-mono text-white backdrop-blur-sm">
                      <Clock className="w-3 h-3" />
                      {fmt(t)}
                    </div>

                    {active && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full shadow-lg animate-pulse" />
                    )}

                    <div
                      className={`absolute inset-0 rounded-xl border-2 transition-all duration-300 ${
                        active
                          ? "border-primary shadow-lg shadow-primary/25"
                          : "border-transparent group-hover:border-primary/50"
                      }`}
                    />
                  </div>


                  <div
                    className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-300 ${
                      active ? "w-full opacity-100" : "group-hover:w-3/4 group-hover:opacity-60"
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
