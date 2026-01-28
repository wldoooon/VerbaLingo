import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { useMemo, useState } from "react"
import ExtensionVideoPlayer, { type VideoClip } from "./components/ExtensionVideoPlayer"
import "./style.css"

const storage = new Storage({
    area: "local"
})

function SidePanel() {
    const [targetWord] = useStorage<string>({
        key: "target_word",
        instance: storage
    }, "")

    const [testClip, setTestClip] = useState<VideoClip | null>(null)
    const defaultClip = useMemo<VideoClip>(
        () => ({
            video_id: "dQw4w9WgXcQ",  // Rick Astley - Never Gonna Give You Up (always available)
            start: 0
        }),
        []
    )

    const openInYouTube = (clip: VideoClip | null) => {
        if (!clip) return
        const startSeconds = Math.floor(Math.max(0, clip.start))
        const url = `https://www.youtube.com/watch?v=${clip.video_id}&t=${startSeconds}s`
        try {
            chrome.tabs.create({ url })
        } catch {
            window.open(url, "_blank")
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
            <div className="flex items-center gap-2 mb-6">
                <h1 className="text-xl font-bold text-teal-400">VerbaLingo</h1>
                <span className="bg-teal-900 text-teal-200 text-xs px-2 py-1 rounded">DEV</span>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-start space-y-4">
                <div className="w-full text-center mb-4">
                    <p className="text-gray-400 text-sm mb-2">Detected Word:</p>
                    <div className="text-2xl font-bold text-teal-300 break-words">
                        {targetWord || "Waiting for selection..."}
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Search manually..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                    defaultValue={targetWord}
                />

                <button className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-2 rounded-lg transition-all">
                    Find Video Context
                </button>

                <div className="w-full">
                    <button
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-all"
                        onClick={() => setTestClip(defaultClip)}
                    >
                        Test YouTube Player
                    </button>
                    <button
                        className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-all"
                        onClick={() => openInYouTube(testClip ?? defaultClip)}
                    >
                        Open Video in YouTube
                    </button>
                    <div className="mt-3">
                        <ExtensionVideoPlayer clip={testClip} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SidePanel
