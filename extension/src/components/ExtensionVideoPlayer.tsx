import { useMemo } from "react"
import { cn } from "../lib/utils"

export type VideoClip = {
    video_id: string
    start: number
    end?: number
    text?: string
}

interface ExtensionVideoPlayerProps {
    clip: VideoClip | null
    className?: string
    onReady?: () => void
    onPlay?: () => void
    onPause?: () => void
}

export default function ExtensionVideoPlayer({
    clip,
    className,
    onReady,
    onPlay,
    onPause
}: ExtensionVideoPlayerProps) {
    // IMPORTANT:
    // Chrome MV3 extension pages enforce a strict CSP that blocks remote scripts.
    // `react-youtube` depends on loading https://www.youtube.com/iframe_api (remote script),
    // which results in a black player inside the extension.
    // A plain iframe embed does not require remote scripts and works reliably.

    const embedSrc = useMemo(() => {
        if (!clip) return ""
        const startSeconds = Math.floor(Math.max(0, clip.start - 1))

        // IMPORTANT: Do NOT set the 'origin' parameter when embedding from a chrome-extension:// URL.
        // YouTube rejects chrome-extension:// as a valid origin, causing Error 152/153.
        // The declarativeNetRequest rules in background.ts inject the proper Referer and Origin headers.
        const params = new URLSearchParams({
            autoplay: "1",
            playsinline: "1",
            start: String(startSeconds),
            modestbranding: "1",
            rel: "0",
            iv_load_policy: "3",
            fs: "0",
            mute: "0",  // Enable audio
            enablejsapi: "0"  // Disable JS API to avoid cross-origin issues
        })

        return `https://www.youtube.com/embed/${clip.video_id}?${params.toString()}`
    }, [clip])

    if (!clip) {
        return (
            <div className={cn("w-full h-full bg-gray-900 flex items-center justify-center text-gray-500", className)}>
                No Video Selected
            </div>
        )
    }

    return (
        <div
            className={cn("relative w-full overflow-hidden rounded-xl bg-black", className)}
            style={{ aspectRatio: "16 / 9" }}
        >
            <iframe
                key={embedSrc}
                src={embedSrc}
                className="absolute inset-0 h-full w-full border-none"
                title="VerbaLingo Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => {
                    onReady?.()
                    onPlay?.()
                }}
            />
        </div>
    )
}
