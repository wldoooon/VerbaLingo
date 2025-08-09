'use client';

import { createContext, useReducer, Dispatch, ReactNode, useContext } from 'react';
import { PlayerState, PlayerAction, TranscriptLine } from '@/lib/types';

const initialState: PlayerState = {
  playlist: [],
  currentVideoIndex: 0,
  isMuted: false,
  activeTranscriptLine: null,
};

const PlayerContext = createContext<{
  state: PlayerState;
  dispatch: Dispatch<PlayerAction>;
}>({ state: initialState, dispatch: () => null });

const appReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'LOAD_PLAYLIST':
      return { ...state, playlist: action.payload, currentVideoIndex: 0 };
    case 'NEXT_VIDEO':
      return { ...state, currentVideoIndex: state.currentVideoIndex + 1 };
    case 'PREV_VIDEO':
      return { ...state, currentVideoIndex: Math.max(0, state.currentVideoIndex - 1) };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
   case 'SET_ACTIVE_LINE':
      return { ...state, activeTranscriptLine: action.payload };
    default:
      return state;
  }
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <PlayerContext.Provider value={{ state, dispatch }}>{children}</PlayerContext.Provider>;
};

export const usePlayerContext = () => useContext(PlayerContext);
