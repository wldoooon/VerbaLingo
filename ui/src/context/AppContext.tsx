'use client';

import { createContext, useReducer, Dispatch, ReactNode, useContext } from 'react';
import { AppState, Action, TranscriptLine } from '@/lib/types';

const initialState: AppState = {
  playlist: [],
  currentVideoIndex: 0,
  isMuted: true,
  currentTranscript: {
    status: 'idle',
    data: null,
    error: null,
  },
  activeTranscriptLine: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOAD_PLAYLIST':
      return { ...state, playlist: action.payload, currentVideoIndex: 0 };
    case 'NEXT_VIDEO':
      return { ...state, currentVideoIndex: state.currentVideoIndex + 1 };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'FETCH_TRANSCRIPT_START':
      return { ...state, currentTranscript: { status: 'loading', data: null, error: null } };
    case 'FETCH_TRANSCRIPT_SUCCESS':
      return { ...state, currentTranscript: { status: 'success', data: action.payload, error: null } };
    case 'FETCH_TRANSCRIPT_ERROR':
      return { ...state, currentTranscript: { status: 'error', data: null, error: action.payload } };
    case 'SET_ACTIVE_LINE':
      return { ...state, activeTranscriptLine: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
