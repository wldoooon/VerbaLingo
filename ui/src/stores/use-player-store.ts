import { create } from "zustand";
import { PlayerState as PlayerStateBase } from "@/lib/types";
import type { YouTubePlayer } from "react-youtube";

interface PlayerStore extends PlayerStateBase {
  isPlaying: boolean;
  duration: number;
  player: YouTubePlayer | null;
  
  // Actions
  resetIndex: () => void;
  nextVideo: () => void;
  prevVideo: () => void;
  setMuted: (muted: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIndex: (index: number) => void;
  setPlayerState: (state: Partial<{ isPlaying: boolean; duration: number }>) => void;
  setPlayer: (player: YouTubePlayer | null) => void;
  
  // Controls
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentVideoIndex: 0,
  isMuted: false,
  activeTranscriptLine: null,
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  player: null,

  resetIndex: () => set({ currentVideoIndex: 0 }),
  nextVideo: () => set((state) => ({ currentVideoIndex: state.currentVideoIndex + 1 })),
  prevVideo: () => set((state) => ({ currentVideoIndex: Math.max(0, state.currentVideoIndex - 1) })),
  setMuted: (muted) => set({ isMuted: muted }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIndex: (index) => set({ currentVideoIndex: index }),
  setPlayerState: (state) => set((prev) => ({ ...prev, ...state })),
  setPlayer: (player) => set({ player }),

  play: () => {
    const { player } = get();
    if (player) player.playVideo();
  },
  pause: () => {
    const { player } = get();
    if (player) player.pauseVideo();
  },
  seekTo: (time) => {
    const { player } = get();
    if (player) player.seekTo(time, true);
  },
  setPlaybackRate: (rate) => {
    const { player } = get();
    if (player) player.setPlaybackRate(rate);
  },
  setVolume: (volume) => {
    const { player } = get();
    if (player) player.setVolume(volume);
  },
}));
