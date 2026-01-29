import { useMemo, useCallback } from "react"
import { cn } from "../lib/utils"

export type VideoClip = {
    video_id: string
    start: number
    end?: number
    text?: string
}

interface MultiStrategyPlayerProps {
    clip: VideoClip | null
    className?: string
}

export default function MultiStrategyPlayer({
    clip,
    className
}: MultiStrategyPlayerProps) {

    const openPopupPlayer = useCallback(() => {
        if (!clip) return
        const startSeconds = Math.floor(Math.max(0, clip.start))
        
        // Open YouTube in a small popup window - THIS ACTUALLY WORKS
        const width = 640
        const height = 400
        const left = window.screen.width - width - 50
        const top = 100
        
        const url = `https://www.youtube.com/embed/${clip.video_id}?autoplay=1&start=${startSeconds}&rel=0`
        
        window.open(
            url,
            "VerbaLingo_Player",
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
        )
    }, [clip])

    const openInYouTube = useCallback(() => {
        if (!clip) return
        const startSeconds = Math.floor(Math.max(0, clip.start))
        const url = `https://www.youtube.com/watch?v=${clip.video_id}&t=${startSeconds}s`
        chrome.tabs.create({ url })
    }, [clip])

    const openPiP = useCallback(async () => {
        if (!clip) return
        const startSeconds = Math.floor(Math.max(0, clip.start))
        
        // Open in a new tab and try to trigger PiP
        const url = `https://www.youtube.com/watch?v=${clip.video_id}&t=${startSeconds}s`
        chrome.tabs.create({ url, active: true })
        
        // Note: User will need to manually enable PiP from YouTube's player controls
    }, [clip])

    const thumbnailUrl = useMemo(() => {
        if (!clip) return ""
        return `https://img.youtube.com/vi/${clip.video_id}/mqdefault.jpg`
    }, [clip])

    if (!clip) {
        return (
            <div className={cn("w-full bg-gray-800 rounded-xl p-6 text-center", className)}>
                <div className="text-gray-500 text-sm">
                    Select a word to find video examples
                </div>
            </div>
        )
    }

    return (
        <div className={cn("w-full overflow-hidden rounded-xl bg-gray-800", className)}>
            {/* Video Thumbnail Preview */}
            <div 
                className="relative cursor-pointer group"
                style={{ aspectRatio: "16 / 9" }}
                onClick={openPopupPlayer}
            >
                <img 
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                {/* Info badge */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Click to play in popup
                </div>
            </div>

            {/* Action buttons */}
            <div className="p-3 space-y-2">
                <button
                    onClick={openPopupPlayer}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <span>🎬</span> Play in Popup Window
                </button>
                
                <div className="flex gap-2">
                    <button
                        onClick={openInYouTube}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-all text-sm"
                    >
                        ▶️ YouTube Tab
                    </button>
                    <button
                        onClick={openPiP}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all text-sm"
                        title="Opens YouTube, then click PiP button on the player"
                    >
                        📺 Picture-in-Picture
                    </button>
                </div>
            </div>
        </div>
    )
}
