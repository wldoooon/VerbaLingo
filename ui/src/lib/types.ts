export interface Clips {
  video_id: string;
  sentence_text: string;
  start_time: number;
  end_time: number;
  position: number;
  category?: string;
  video_title?: string;
}

export interface TranscriptLine {
  text: string;
  start: number;
  end: number;
}

export interface TranscriptSentence {
    sentence_text: string;
    start_time: number;
    end_time: number;
    words?: { text: string; start: number; end: number }[];
}

export interface TranscriptResponse {
    video_id: string;
    start_time: number;
    end_time: number;
    sentences: TranscriptSentence[];
}

export interface PlayerState {
  currentVideoIndex: number;
  isMuted: boolean;
  activeTranscriptLine: number | null;
  currentTime: number;
}

export type PlayerAction =
  | { type: 'NEXT_VIDEO' }
  | { type: 'PREV_VIDEO' }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_INDEX'; payload: number }
  | { type: 'RESET_INDEX' }; 

