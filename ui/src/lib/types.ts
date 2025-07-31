export interface SearchHit {
  video_id: string;
  sentence_text: string;
  start_time: number;
  end_time: number;
  position: number;
}

export interface TranscriptLine {
  text: string;
  start: number;
  end: number;
}

export interface AppState {
  playlist: string[];
  currentVideoIndex: number;
  isMuted: boolean;
  currentTranscript: {
    status: 'idle' | 'loading' | 'success' | 'error';
    data: TranscriptLine[] | null;
    error: string | null;
  };
  activeTranscriptLine: number | null;
}

export type Action =
  | { type: 'LOAD_PLAYLIST'; payload: string[] }
  | { type: 'NEXT_VIDEO' }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'FETCH_TRANSCRIPT_START' }
  | { type: 'FETCH_TRANSCRIPT_SUCCESS'; payload: TranscriptLine[] }
  | { type: 'FETCH_TRANSCRIPT_ERROR'; payload: string }
  | { type: 'SET_ACTIVE_LINE'; payload: number | null };