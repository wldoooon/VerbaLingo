"use client"

import { useEffect } from "react"

/**
 * Suppresses unhandled errors from YouTube's IFrame Player API (www-widgetapi.js).
 *
 * Root cause: react-youtube's createPlayer() spawns a native Promise that resolves
 * asynchronously. If the host component unmounts before the Promise resolves (fast
 * navigation, clip change), the resolved callback tries to call methods on a now-null
 * iframe → "Cannot read properties of null (reading 'src' / 'playVideo')".
 *
 * These are unhandled rejections from a third-party script — they can't be caught with
 * try/catch or React error boundaries. Left uncaught they reach Next.js's window-level
 * error handler and render the "Application error" page.
 *
 * Fix: intercept at the window level and preventDefault() only for YouTube SDK errors,
 * so the rest of your error handling is unaffected.
 */
export function YouTubeErrorSuppressor() {
  useEffect(() => {
    const isYouTubeError = (msg: string, filename?: string): boolean => {
      const ytFiles = ["widgetapi", "www-widgetapi", "iframe_api", "base.js"]
      const ytMessages = ["playVideo", "pauseVideo", "seekTo", "Cannot read properties of null"]
      const fromYT = ytFiles.some(f => filename?.includes(f))
      const looksLikeYT = ytMessages.some(m => msg.includes(m))
      return fromYT || looksLikeYT
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || String(event.reason || "")
      if (isYouTubeError(msg)) {
        event.preventDefault()
      }
    }

    const onError = (event: ErrorEvent) => {
      const msg = event.message || ""
      if (isYouTubeError(msg, event.filename)) {
        event.preventDefault()
        return true
      }
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection)
    window.addEventListener("error", onError as EventListener)

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
      window.removeEventListener("error", onError as EventListener)
    }
  }, [])

  return null
}
