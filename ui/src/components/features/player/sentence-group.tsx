"use client"

import { memo } from "react"
import { TranscriptWord } from "./transcript-word"

type Word = { text: string; start: number; end: number }
type Sentence = {
  start_time: number
  end_time: number
  sentence_text?: string
  words?: Word[]
}

type SentenceGroupProps = {
  group: Sentence[]
  searchQuery: string
  onSearchWord?: (word: string) => void
  onExplainWordInContext?: (payload: { word: string; sentence: string }) => void
}

export const SentenceGroup = memo(({
  group,
  searchQuery,
  onSearchWord,
  onExplainWordInContext,
}: SentenceGroupProps) => {
  return (
    <div className="flex items-center justify-center text-center px-4 py-2">
      <div className="relative text-lg sm:text-2xl font-medium leading-relaxed inline-block text-foreground tracking-tight">
        {group.map((sentence, sIdx) => {
          const query = searchQuery.toLowerCase().trim()
          const rawWords: Word[] = (sentence.words as Word[] | undefined) || []

          // FALLBACK: When word-level timestamps are missing, split sentence_text
          // into individual words and distribute the sentence's time range evenly.
          // This ensures every clip is clickable, highlightable, and visible.
          let words: Word[] = rawWords
          if (words.length === 0 && sentence.sentence_text) {
            const textParts = sentence.sentence_text.split(/\s+/).filter(t => t.length > 0)
            const duration = sentence.end_time - sentence.start_time
            const wordDuration = textParts.length > 0 ? duration / textParts.length : duration
            words = textParts.map((text, i) => ({
              text,
              start: sentence.start_time + i * wordDuration,
              end: sentence.start_time + (i + 1) * wordDuration,
            }))
          }

          return (
            <span key={`${sentence.start_time}-${sIdx}`}>
              {words.map((w, wi) => {
                const wordText = (w.text || "").trim()
                const queryParts = query.split(/\s+/).filter(part => part.length > 0)
                const isSearchMatch = queryParts.length > 0 && queryParts.some(part => {
                  const punctuationRegex = /[.,!?;:()\[\]{}"']/g;
                  const cleanWord = wordText.toLowerCase().replace(punctuationRegex, '');
                  const cleanPart = part.toLowerCase().replace(punctuationRegex, '');
                  return cleanWord.length > 0 && cleanPart.length > 0 && cleanWord === cleanPart;
                })

                return (
                  <TranscriptWord
                    key={`${sentence.start_time}-${w.start}-${wi}`}
                    wordText={wordText}
                    start={w.start}
                    end={w.end}
                    isSearchMatch={isSearchMatch}
                    onSearchWord={onSearchWord}
                    onExplainWordInContext={(word) => {
                      const sentenceText =
                        sentence.sentence_text ||
                        words.map((ww: Word) => ww.text).join(" ")
                      onExplainWordInContext?.({
                        word,
                        sentence: sentenceText,
                      })
                    }}
                  />
                )
              })}
            </span>
          )
        })}
      </div>
    </div>
  )
})

SentenceGroup.displayName = "SentenceGroup"
