"use client"

import { useEffect, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "@/context/SearchParamsContext"
import { VideoPlayerSkeleton, TranscriptSkeleton, AiCompletionSkeleton } from "./WatchSkeletons"

// Dynamic imports for heavy components
const VideoPlayerCard = dynamic(
    () => import("@/components/comm/VideoPlayerCard"),
    {
        ssr: false,
        loading: () => <VideoPlayerSkeleton />
    }
)

const AudioCard = dynamic(
    () => import("@/components/comm/AudioCard"),
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
    const { setQuery, setCategory } = useSearchParams()

    const decoded = word ? decodeURIComponent(word) : ""

    useEffect(() => {
        if (decoded) {
            setQuery(decoded)
            setCategory(null)
        }
    }, [decoded, setQuery, setCategory])

    return null
}

export default function WatchClientPage({ word }: { word: string }) {
    // PREFETCHING OPTIMIZATION: Start fetching data immediately while child components load
    useSearch(decodeURIComponent(word), null)

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
                            <VideoPlayerCard />
                        </Suspense>
                        <Suspense fallback={<TranscriptSkeleton />}>
                            <AudioCard
                                src=""
                                title=""
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
