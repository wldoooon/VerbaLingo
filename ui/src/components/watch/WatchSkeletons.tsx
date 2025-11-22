import { Skeleton } from "@/components/ui/skeleton"

export function VideoPlayerSkeleton() {
    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <Skeleton className="w-full aspect-video rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    )
}

export function TranscriptSkeleton() {
    return (
        <div className="w-full h-full flex flex-col space-y-3 p-4 bg-card/50 rounded-2xl border border-border/50">
            <Skeleton className="h-6 w-1/3 mb-4" />
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-8 shrink-0" />
                    <Skeleton className="h-4 w-full" />
                </div>
            ))}
        </div>
    )
}

export function AiCompletionSkeleton() {
    return (
        <div className="w-full h-full flex flex-col space-y-4 p-6 bg-card rounded-2xl border border-border/50">
            <div className="flex items-center justify-center mb-6">
                <Skeleton className="h-20 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />

            <div className="space-y-3 mt-8">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        </div>
    )
}
