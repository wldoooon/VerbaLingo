import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true 
}

let debounceTimer: NodeJS.Timeout | null = null

const handleMouseUp = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    const selection = window.getSelection()
    const rawText = selection?.toString() || ""
    
    const text = rawText.replace(/\s+/g, " ").trim()

    if (text && text.length >= 3) {
      console.log("[VerbalIngo] Selected text:", text)
    }
  }, 200) 
}

window.addEventListener("mouseup", handleMouseUp)

window.addEventListener("beforeunload", () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  window.removeEventListener("mouseup", handleMouseUp)
})