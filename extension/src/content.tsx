import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import cssText from "data-text:./style.css"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
}

export const getStyle = () => {
    const style = document.createElement("style")
    style.textContent = cssText
    return style
}

const storage = new Storage({
    area: "local"
})

export default function SelectionBubble() {
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null)
    const [selectedText, setSelectedText] = useState("")

    useEffect(() => {
        const handleMouseUp = (e: MouseEvent) => {
            const selection = window.getSelection()?.toString().trim()

            if (selection && selection.length > 0) {
                const range = window.getSelection()?.getRangeAt(0)
                const rect = range?.getBoundingClientRect()

                if (rect) {
                    setPosition({
                        x: rect.left + window.scrollX + (rect.width / 2) - 40,
                        y: rect.top + window.scrollY - 40
                    })
                    setSelectedText(selection)
                }
            } else {
                setPosition(null)
            }
        }

        document.addEventListener("mouseup", handleMouseUp)
        return () => document.removeEventListener("mouseup", handleMouseUp)
    }, [])

    if (!position) return null

    return (
        <button
            onClick={async () => {
                try {
                    console.log("🟢 [VerbaLingo] 1. Bubble Clicked. Word:", selectedText)

                    // 1. Save to Storage
                    console.log("🟢 [VerbaLingo] 2. Saving to Storage...")
                    await storage.set("target_word", selectedText)
                    console.log("🟢 [VerbaLingo] 3. Save Success.")

                    // 2. Send Message
                    console.log("🟢 [VerbaLingo] 4. Sending OPEN_PANEL message...")
                    const response = await chrome.runtime.sendMessage({ action: "OPEN_PANEL" })
                    console.log("🟢 [VerbaLingo] 5. Message Response:", response)

                    setPosition(null)
                } catch (err) {
                    console.error("🔴 [VerbaLingo] ERROR:", err)
                    alert("VerbaLingo Error: " + err.message)
                }
            }}
            style={{
                position: "absolute",
                top: position.y,
                left: position.x,
                zIndex: 2147483647,
                backgroundColor: "#14b8a6",
                color: "white",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                fontWeight: "bold",
                fontSize: "14px"
            }}
        >
            Search "{selectedText.length > 15 ? selectedText.substring(0, 12) + "..." : selectedText}"
        </button>
    )
}
