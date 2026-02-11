import type { TranscriptSentence } from "./types";

export type Word = { text: string; start: number; end: number };

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`
    : `${m}:${rem.toString().padStart(2, "0")}`;
}

export function normalizeTranscriptWords(words: Word[]): Word[] {
  if (!words || words.length === 0) return [];

  const normalized: Word[] = [];
  const tempWords: Word[] = [];

  // Pass 1: Handle split words (text containing spaces)
  for (const w of words) {
    const text = (w.text || "").trim();
    if (!text) continue;

    if (text.includes(" ")) {
      const parts = text.split(/\s+/);
      const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
      const duration = w.end - w.start;
      let currentTime = w.start;

      parts.forEach((part) => {
        const weight = totalLength > 0 ? part.length / totalLength : 1 / parts.length;
        const partDuration = duration * weight;

        tempWords.push({
          text: part,
          start: currentTime,
          end: currentTime + partDuration,
        });
        currentTime += partDuration;
      });
    } else {
      tempWords.push(w);
    }
  }

  // Pass 2: Cap long durations to ensure highlights don't linger
  if (tempWords.length > 0) {
    const totalDuration = tempWords.reduce((acc, w) => acc + (w.end - w.start), 0);
    const avgDuration = totalDuration / tempWords.length;
    const capThreshold = Math.min(avgDuration, 0.7);

    for (const w of tempWords) {
      const duration = w.end - w.start;
      normalized.push(
        duration > capThreshold ? { ...w, end: w.start + capThreshold } : w
      );
    }
  }

  return normalized;
}

/**
 * Calculates current sentence progress (0..1)
 */
export function computeSentenceProgress(
  sentence: TranscriptSentence, 
  currentTime: number,
  lead: number = 0.08
): number {
  const preOffset = 0.7;
  const postOffset = 0.9;
  const t = currentTime + lead;
  const start = (sentence.start_time ?? 0) - preOffset;
  const end = (sentence.end_time ?? 0) - postOffset;
  const span = Math.max(0.001, end - start);
  const p = (t - start) / span;
  return Math.min(Math.max(p, 0), 1);
}
