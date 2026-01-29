import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { useMemo, useState, useCallback, useEffect } from "react"
import "./style.css"

const storage = new Storage({
    area: "local"
})

interface VideoClip {
    video_id: string
    start: number
    end?: number
    text?: string
    word?: string
}

function SidePanel() {
    const [targetWord] = useStorage<string>({
        key: "target_word",
        instance: storage
    }, "")

    const [playerStatus, setPlayerStatus] = useState<string>("")
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLooping, setIsLooping] = useState(false)
    
    // Test clips for demonstration
    const testClips: VideoClip[] = useMemo(() => [
        {
            video_id: "dQw4w9WgXcQ",
            start: 0,
            end: 10,
            text: "Never gonna give you up, never gonna let you down",
            word: "never"
        },
        {
            video_id: "9bZkp7q19f0",
            start: 10,
            end: 20,
            text: "Gangnam Style, hey sexy lady",
            word: "style"
        },
        {
            video_id: "kJQP7kiw5Fk",
            start: 5,
            end: 15,
            text: "Slowly, slowly, despacito",
            word: "slowly"
        }
    ], [])

    const [currentClipIndex, setCurrentClipIndex] = useState(0)

    // Listen for player events from background/offscreen
    useEffect(() => {
        const listener = (message: any) => {
            console.log("Sidepanel received:", message)
            if (message.type === "PLAYER_READY") {
                setPlayerStatus("▶️ Playing...")
                setIsPlaying(true)
            }
            if (message.type === "PLAYER_ERROR") {
                setPlayerStatus("❌ Error: " + message.error)
                setIsPlaying(false)
            }
            if (message.type === "CLIP_ENDED") {
                if (!isLooping) {
                    setPlayerStatus("✅ Clip finished")
                    setIsPlaying(false)
                }
            }
        }
        chrome.runtime.onMessage.addListener(listener)
        return () => chrome.runtime.onMessage.removeListener(listener)
    }, [isLooping])

    const playClip = useCallback(async (clip: VideoClip) => {
        setPlayerStatus("🎬 Loading clip...")
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: "PLAY_CLIP",
                clip
            })
            
            if (response?.success) {
                setPlayerStatus("⏳ Buffering...")
                setIsPlaying(true)
            } else {
                setPlayerStatus("⚠️ " + (response?.error || "Could not play"))
                setIsPlaying(false)
            }
        } catch (error) {
            console.error("Failed to play clip:", error)
            setPlayerStatus("❌ Failed to play clip")
            setIsPlaying(false)
        }
    }, [])

    const replay = useCallback(async () => {
        try {
            await chrome.runtime.sendMessage({ action: "REPLAY" })
            setPlayerStatus("🔄 Replaying...")
            setIsPlaying(true)
        } catch (e) {
            console.error("Replay error:", e)
        }
    }, [])

    const toggleLoop = useCallback(async () => {
        const newLoop = !isLooping
        setIsLooping(newLoop)
        try {
            await chrome.runtime.sendMessage({ action: "SET_LOOP", loop: newLoop })
        } catch (e) {
            console.error("Toggle loop error:", e)
        }
    }, [isLooping])

    const playNext = useCallback(() => {
        const nextIndex = (currentClipIndex + 1) % testClips.length
        setCurrentClipIndex(nextIndex)
        playClip(testClips[nextIndex])
    }, [currentClipIndex, testClips, playClip])

    const playPrev = useCallback(() => {
        const prevIndex = (currentClipIndex - 1 + testClips.length) % testClips.length
        setCurrentClipIndex(prevIndex)
        playClip(testClips[prevIndex])
    }, [currentClipIndex, testClips, playClip])

    const currentClip = testClips[currentClipIndex]

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
            <div className="flex items-center gap-2 mb-4">
                <h1 className="text-xl font-bold text-teal-400">VerbaLingo</h1>
                <span className="bg-teal-900 text-teal-200 text-xs px-2 py-1 rounded">BETA</span>
            </div>

            {/* Now Playing Card */}
            {currentClip && (
                <div className="w-full bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-gray-400 text-xs mb-2">Now Playing:</p>
                    <div className="flex items-center gap-3 mb-3">
                        <img 
                            src={`https://img.youtube.com/vi/${currentClip.video_id}/mqdefault.jpg`}
                            alt=""
                            className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                            <p className="text-sm text-white">
                                {currentClip.text || `Video: ${currentClip.video_id}`}
                            </p>
                            {currentClip.word && (
                                <span className="text-xs bg-teal-800 text-teal-200 px-2 py-0.5 rounded mt-1 inline-block">
                                    {currentClip.word}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={playPrev}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                            title="Previous"
                        >⏮️</button>
                        <button 
                            onClick={replay}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                            title="Replay"
                        >🔄</button>
                        <button 
                            onClick={toggleLoop}
                            className={`p-2 rounded-lg transition ${
                                isLooping 
                                    ? "bg-teal-600 hover:bg-teal-500" 
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                            title={isLooping ? "Loop On" : "Loop Off"}
                        >🔁</button>
                        <button 
                            onClick={playNext}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                            title="Next"
                        >⏭️</button>
                    </div>

                    {/* Status */}
                    {playerStatus && (
                        <p className="text-xs text-center mt-2 text-gray-400">{playerStatus}</p>
                    )}
                </div>
            )}

            <div className="flex-1 w-full flex flex-col items-center justify-start space-y-4 overflow-auto">
                <div className="w-full text-center">
                    <p className="text-gray-400 text-sm mb-2">Detected Word:</p>
                    <div className="text-2xl font-bold text-teal-300 break-words">
                        {targetWord || "Select text on any page"}
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Search manually..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                    defaultValue={targetWord}
                />

                <button 
                    className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-2 rounded-lg transition-all"
                    onClick={() => playClip(testClips[currentClipIndex])}
                >
                    🔍 Find Video Context
                </button>

                {/* Clip list */}
                <div className="w-full space-y-2">
                    <p className="text-gray-400 text-sm">Available Clips:</p>
                    {testClips.map((clip, index) => (
                        <div 
                            key={`${clip.video_id}-${index}`}
                            onClick={() => {
                                setCurrentClipIndex(index)
                                playClip(clip)
                            }}
                            className={`w-full p-3 rounded-lg cursor-pointer transition-all ${
                                index === currentClipIndex 
                                    ? "bg-teal-900 border border-teal-500" 
                                    : "bg-gray-800 hover:bg-gray-700 border border-transparent"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <img 
                                    src={`https://img.youtube.com/vi/${clip.video_id}/default.jpg`}
                                    alt=""
                                    className="w-16 h-12 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">
                                        {clip.text || `Video at ${clip.start}s`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        ⏱ {clip.start}s
                                        {clip.word && (
                                            <span className="ml-2 bg-teal-800 text-teal-200 px-1.5 py-0.5 rounded">
                                                {clip.word}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info */}
                <div className="w-full mt-4 p-3 bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-400 text-center">
                        🎧 Audio plays in background via Offscreen API.
                        Video thumbnail shows the clip context.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SidePanel
