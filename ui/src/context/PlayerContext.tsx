'use client'

import { createContext, useReducer, Dispatch, ReactNode, useContext, useRef, useMemo, useState } from 'react';
import { PlayerState, PlayerAction } from '@/lib/types';
import type { YouTubePlayer } from 'react-youtube';

const initialState: PlayerState = {
  currentVideoIndex: 0,
  isMuted: false,
  activeTranscriptLine: null,
  currentTime: 0,
};

// Extended context type with player ref and control methods
type PlayerContextType = {
  state: PlayerState;
  dispatch: Dispatch<PlayerAction>;
  // The YouTube player instance (mutable, doesn't trigger re-renders)
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
  // Player state (immutable, triggers re-renders)
  playerState: {
    isPlaying: boolean;
    duration: number;
  };
  setPlayerState: React.Dispatch<React.SetStateAction<{
    isPlaying: boolean;
    duration: number;
  }>>;
  // Control methods (stable references via useCallback)
  controls: {
    play: () => void;
    pause: () => void;
    seekTo: (time: number) => void;
    setPlaybackRate: (rate: number) => void;
    setVolume: (volume: number) => void;
  };
};

const PlayerContext = createContext<PlayerContextType>({
  state: initialState,
  dispatch: () => null,
  playerRef: { current: null },
  playerState: { isPlaying: false, duration: 0 },
  setPlayerState: () => {},
  controls: {
    play: () => {},
    pause: () => {},
    seekTo: () => {},
    setPlaybackRate: () => {},
    setVolume: () => {},
  },
});



const appReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'RESET_INDEX':
      return { ...state, currentVideoIndex: 0 };
    case 'NEXT_VIDEO':
      return { ...state, currentVideoIndex: state.currentVideoIndex + 1 };
    case 'PREV_VIDEO':
      return { ...state, currentVideoIndex: Math.max(0, state.currentVideoIndex - 1) };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_INDEX':
      return { ...state, currentVideoIndex: action.payload };
    default:
      return state;
  }
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Store YouTube player instance (doesn't trigger re-renders when it changes)
  const playerRef = useRef<YouTubePlayer | null>(null);
  
  // Store player playback state (DOES trigger re-renders when it changes)
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    duration: 0,
  });

  // Control methods wrapped in useMemo for stable references
  const controls = useMemo(() => ({
    play: () => {
      if (playerRef.current) {
        playerRef.current.playVideo();
      }
    },
    pause: () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    },
    seekTo: (time: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time, true);
      }
    },
    setPlaybackRate: (rate: number) => {
      if (playerRef.current) {
        playerRef.current.setPlaybackRate(rate);
      }
    },
    setVolume: (volume: number) => {
      if (playerRef.current) {
        playerRef.current.setVolume(volume);
      }
    },
  }), []); // Empty deps = stable references that never change

  return (
    <PlayerContext.Provider 
      value={{ 
        state, 
        dispatch, 
        playerRef, 
        playerState, 
        setPlayerState,
        controls 
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => useContext(PlayerContext);