"use client"

import { useEffect, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { AppSidebar } from "@/components/app-sidebar"
import { Navigation } from "@/components/Navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
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
    const [externalPrompt, setExternalPrompt] = useState<string | null>(null)

    // Mock user data
    const userData = {
        name: "Guest",
        email: "guest@verbalingo.com",
        avatar: "/avatars/user.jpg",
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Navigation user={userData} showNavMenu={false} />
                <SearchParamSyncer word={word} />

                <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
                    <div className="max-w-[1800px] mx-auto h-full">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full">
                            {/* Left Column: Video & Transcript */}
                            <div className="xl:col-span-2 flex flex-col gap-4 min-w-0">
                                {/* Video Player Section */}
                                <div className="w-full">
                                    <Suspense fallback={<VideoPlayerSkeleton />}>
                                        <VideoPlayerCard className="w-full shadow-2xl rounded-2xl overflow-hidden border border-border/50" />
                                    </Suspense>
                                </div>

                                {/* Controls & Transcript Section */}
                                <div className="w-full">
                                    <Suspense fallback={<TranscriptSkeleton />}>
                                        <AudioCard
                                            src=""
                                            title=""
                                            searchQuery={decodeURIComponent(word)}
                                            onExplainWordPrompt={setExternalPrompt}
                                            className="border border-border/50 bg-card/50 backdrop-blur-sm"
                                        />
                                    </Suspense>
                                </div>
                            </div>

                            {/* Right Column: AI Assistant */}
                            <div className="xl:col-span-1 h-full min-w-0">
                                <div className="sticky top-6 h-full">
                                    <Suspense fallback={<AiCompletionSkeleton />}>
                                        <AiCompletion externalPrompt={externalPrompt} />
                                    </Suspense>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
