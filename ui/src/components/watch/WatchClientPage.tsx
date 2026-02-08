"use client"

import { useEffect, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { useSearchStore } from "@/stores/use-search-store"
import { usePlayerStore } from "@/stores/use-player-store"
import { VideoPlayerSkeleton, TranscriptSkeleton, AiCompletionSkeleton } from "./WatchSkeletons"

// Dynamic imports for heavy components
const VideoPlayerCard = dynamic(
    () => import("@/components/features/player/video-player-card"),
    {
        ssr: false,
        loading: () => <VideoPlayerSkeleton />
    }
)

const AudioCard = dynamic(
    () => import("@/components/features/player/audio-card"),
    {
        ssr: false,
        loading: () => <TranscriptSkeleton />
    }
)

const AiCompletion = dynamic(
    () => import("@/components/ai-completion").then(mod => mod.AiCompletion),
    {
        ssr: false,
        loading: () => <AiCompletionSkeleton />
    }
)

import { useSearch } from "@/lib/useApi"

function SearchParamSyncer({ word }: { word: string }) {
    const { setQuery } = useSearchStore()

    const decoded = word ? decodeURIComponent(word) : ""

    useEffect(() => {
        if (decoded) {
            setQuery(decoded)
        }
    }, [decoded, setQuery])

    return null
}

export default function WatchClientPage({ word }: { word: string }) {
    const { category, language, subCategory } = useSearchStore()
    const { currentVideoIndex, resetIndex } = usePlayerStore()

    // Reset index when word changes
    useEffect(() => {
        resetIndex()
    }, [word, resetIndex])

    // PREFETCHING & DATA: Use the hook and capture the results
    const { data, isFetching } = useSearch(decodeURIComponent(word), language, category, subCategory)
    const playlist = data?.hits || []

    const [externalPrompt, setExternalPrompt] = useState<string | null>(null)

    return (
        <>
            <SearchParamSyncer word={word} />

            {/* Main Content */}
            <div className="flex-1">
                <div className="mt-0 max-w-full lg:grid lg:grid-cols-[1fr_560px] lg:items-start">
                    {/* Left: Player + Audio */}
                    <div className="space-y-4 p-4 sm:p-6 pb-12 lg:pb-6">
                        <Suspense fallback={<VideoPlayerSkeleton />}>
                            <VideoPlayerCard
                                playlist={playlist}
                                isFetching={isFetching}
                                aggregations={data?.aggregations}
                            />
                        </Suspense>
                        <Suspense fallback={<TranscriptSkeleton />}>
                            <AudioCard
                                currentClip={playlist[currentVideoIndex]}
                                playlist={playlist}
                                totalItems={data?.total}
                                searchQuery={decodeURIComponent(word)}
                                onExplainWordPrompt={setExternalPrompt}
                            />
                        </Suspense>
                    </div>

                    {/* Right: AI */}
                    <div className="hidden lg:flex lg:flex-col lg:ml-0 lg:mr-0 sticky top-0 h-[calc(100vh-5rem)] overflow-hidden border-l">
                        <Suspense fallback={<AiCompletionSkeleton />}>
                            <AiCompletion externalPrompt={externalPrompt} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </>
    )
}
