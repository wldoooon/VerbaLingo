import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PlayerState as PlayerStateBase } from "@/lib/types";
import type { YouTubePlayer } from "react-youtube";

interface PlayerStore extends PlayerStateBase {
  isPlaying: boolean;
  duration: number;
  playbackRate: number;
  volume: number;
  player: YouTubePlayer | null;

  // Actions
  resetIndex: () => void;
  nextVideo: () => void;
  prevVideo: () => void;
  setMuted: (muted: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIndex: (index: number) => void;
  setPlayerState: (
    state: Partial<{ isPlaying: boolean; duration: number }>,
  ) => void;
  setPlayer: (player: YouTubePlayer | null) => void;

  // Controls
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentVideoIndex: 0,
      isMuted: false,
      activeTranscriptLine: null,
      currentTime: 0,
      isPlaying: false,
      duration: 0,
      playbackRate: 1,
      volume: 100,
      player: null,

      resetIndex: () => set({ currentVideoIndex: 0 }),
      nextVideo: () =>
        set((state) => ({ currentVideoIndex: state.currentVideoIndex + 1 })),
      prevVideo: () =>
        set((state) => ({
          currentVideoIndex: Math.max(0, state.currentVideoIndex - 1),
        })),
      setMuted: (muted) => set({ isMuted: muted }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setIndex: (index) => set({ currentVideoIndex: index }),
      setPlayerState: (state) => set((prev) => ({ ...prev, ...state })),
      setPlayer: (player) => set({ player }),

      play: () => {
        const { player } = get();
        player?.playVideo?.();
      },
      pause: () => {
        const { player } = get();
        player?.pauseVideo?.();
      },
      seekTo: (time) => {
        const { player } = get();
        player?.seekTo?.(time, true);
      },
      setPlaybackRate: (rate) => {
        set({ playbackRate: rate });
        const { player } = get();
        player?.setPlaybackRate?.(rate);
      },
      setVolume: (volume) => {
        set({ volume }); // persisted in state
        const { player } = get();
        player?.setVolume?.(volume);
      },
    }),
    {
      name: "player-preferences",
      // Only persist user preferences — not ephemeral playback state
      partialize: (state) => ({
        volume: state.volume,
        playbackRate: state.playbackRate,
      }),
    }
  )
);
