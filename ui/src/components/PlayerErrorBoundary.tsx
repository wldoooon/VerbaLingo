"use client"

import React from "react"
import { RefreshCw } from "lucide-react"

interface State {
  crashed: boolean
  autoRetries: number
}

/**
 * Error boundary for the video player area.
 * If anything slips past the YouTube error suppressor and crashes React's render tree,
 * this catches it and shows a friendly recovery UI instead of the blank Next.js error page.
 * Auto-retries once (resets state), then shows a manual refresh button.
 */
export class PlayerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { crashed: false, autoRetries: 0 }

  static getDerivedStateFromError(): Partial<State> {
    return { crashed: true }
  }

  componentDidCatch(error: Error) {
    // Only auto-retry for YouTube-related errors
    const isYT = ["playVideo", "pauseVideo", "src", "widgetapi"].some(k =>
      error.message?.includes(k)
    )
    if (isYT && this.state.autoRetries < 1) {
      setTimeout(() => {
        this.setState(s => ({ crashed: false, autoRetries: s.autoRetries + 1 }))
      }, 800)
    }
  }

  retry = () => {
    this.setState({ crashed: false })
  }

  render() {
    if (!this.state.crashed) return this.props.children

    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card border border-border/50 p-10 text-center shadow-xl min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-foreground">Player ran into a hiccup</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            The video player encountered an issue. This usually fixes itself in one tap.
          </p>
        </div>
        <button
          onClick={this.retry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Player
        </button>
      </div>
    )
  }
}
