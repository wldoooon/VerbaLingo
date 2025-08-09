export interface Clips {
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

export interface PlayerState {
  playlist: Clips[];
  currentVideoIndex: number;
  isMuted: boolean;
  activeTranscriptLine: number | null;
}

export type PlayerAction =
  | { type: 'LOAD_PLAYLIST'; payload: Clips[] }
  | { type: 'NEXT_VIDEO' }
  | { type: 'PREV_VIDEO'}
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_ACTIVE_LINE'; payload: number | null };