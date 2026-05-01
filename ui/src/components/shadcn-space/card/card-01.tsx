'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

const SENTENCES = [
  {
    words: ["The", "quieter", "you", "become,", "the", "more", "you", "hear."],
    keywordIdx: 1,
    source: "Movies",
    lang: "EN",
    translations: [
      { text: "Plus tu te tais, plus tu entends.", lang: "FR" },
      { text: "Cuanto más callado estás, más escuchas.", lang: "ES" },
      { text: "Je stiller du wirst, desto mehr hörst du.", lang: "DE" },
    ],
  },
  {
    words: ["Paris", "est", "toujours", "une", "bonne", "idée."],
    keywordIdx: 2,
    source: "News",
    lang: "FR",
    translations: [
      { text: "Paris is always a good idea.", lang: "EN" },
      { text: "París siempre es una buena idea.", lang: "ES" },
      { text: "Paris ist immer eine gute Idee.", lang: "DE" },
    ],
  },
  {
    words: ["No", "llores,", "sonríe", "porque", "sucedió."],
    keywordIdx: 2,
    source: "Podcasts",
    lang: "ES",
    translations: [
      { text: "Don't cry, smile because it happened.", lang: "EN" },
      { text: "Ne pleure pas, souris parce que c'est arrivé.", lang: "FR" },
      { text: "Wein nicht, lächle, weil es passiert ist.", lang: "DE" },
    ],
  },
]

const languageFlags = [
  { flag: 'https://flagcdn.com/us.svg', label: 'English' },
  { flag: 'https://flagcdn.com/fr.svg', label: 'French' },
  { flag: 'https://flagcdn.com/de.svg', label: 'German' },
]

const ArticlePreviewCard = () => {
  const [sentenceIdx, setSentenceIdx] = useState(0)
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState<'words' | 'translating'>('words')
  const [translationIdx, setTranslationIdx] = useState(0)

  useEffect(() => {
    const sentence = SENTENCES[sentenceIdx]

    if (phase === 'words') {
      const isKeyword = wordIdx === sentence.keywordIdx
      const isLast = wordIdx >= sentence.words.length - 1
      const delay = isLast ? 700 : isKeyword ? 820 : 430

      const t = setTimeout(() => {
        if (isLast) {
          setPhase('translating')
          setTranslationIdx(0)
        } else {
          setWordIdx(w => w + 1)
        }
      }, delay)
      return () => clearTimeout(t)
    }

    if (phase === 'translating') {
      const isLastTranslation = translationIdx >= sentence.translations.length - 1

      const t = setTimeout(() => {
        if (isLastTranslation) {
          setSentenceIdx(s => (s + 1) % SENTENCES.length)
          setWordIdx(0)
          setPhase('words')
        } else {
          setTranslationIdx(i => i + 1)
        }
      }, 1600)
      return () => clearTimeout(t)
    }
  }, [sentenceIdx, wordIdx, phase, translationIdx])

  const sentence = SENTENCES[sentenceIdx]

  return (
    <div className="relative w-full h-full border border-border/50 bg-card/50 overflow-hidden flex flex-col">

      {/* ── Top: word-by-word transcript panel ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center gap-3 px-6 bg-gradient-to-br from-muted/20 via-background to-muted/10 overflow-hidden">

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />

        {/* Language pill — top right */}
        <div className="absolute top-4 right-5 px-2.5 py-0.5 rounded-full border border-border/35 bg-muted/20 text-[9px] font-mono tracking-widest uppercase text-muted-foreground/50 select-none">
          {sentence.lang}
        </div>

        {/* Sentence with jumping word highlight */}
        <div className="flex flex-wrap items-center justify-center gap-y-1 text-center">
          {sentence.words.map((word, i) => (
            <span
              key={`${sentenceIdx}-${i}`}
              className={cn(
                "mr-0.5 px-1 py-0.5 border-2 rounded-md transition-all duration-150 ease-out inline-flex items-center text-sm font-medium",
                i === wordIdx && phase === 'words'
                  ? "bg-primary/20 border-primary text-foreground font-bold scale-105 shadow-[0_0_14px_-3px_hsl(var(--primary)/0.4)]"
                  : "border-transparent text-foreground/65"
              )}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Translation */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sentenceIdx}-${translationIdx}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex items-center gap-2"
            >
              <span className="font-mono text-[9px] border border-border/50 bg-muted/40 px-1.5 py-0.5 rounded text-muted-foreground tracking-widest uppercase">
                {sentence.translations[translationIdx].lang}
              </span>
              <span className="text-xs text-muted-foreground">
                {sentence.translations[translationIdx].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/30 bg-background/60 backdrop-blur-sm select-none">
          <span className="text-[10px] text-muted-foreground/50 font-mono">{sentence.source}</span>
        </div>

      </div>

      {/* ── Content ── */}
      <div className="px-6 py-5 border-t border-border/40">

        <h3 className="text-lg font-bold text-foreground mb-1.5">Master Real Expressions</h3>

        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          Learn how native speakers use idioms and slang — within your favorite movies and shows.
        </p>

        {/* Flags + sentence progress dots */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex">
            {languageFlags.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.15, zIndex: 20 }}
                transition={{ type: 'spring', stiffness: 260 }}
                className="-ms-3 h-8 w-8 relative z-10 first:ms-0"
              >
                <div className="w-full h-full rounded-full border-2 border-background overflow-hidden shadow-md bg-muted">
                  <img src={item.flag} className="w-full h-full object-cover" alt={item.label} />
                </div>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 260 }}
              className="-ms-3 relative z-0"
            >
              <div className="bg-muted h-8 w-8 flex justify-center items-center text-muted-foreground border-2 border-background rounded-full text-xs font-black shadow-md">
                +3
              </div>
            </motion.div>
          </div>

          {/* Sentence progress pills */}
          <div className="flex items-center gap-1.5">
            {SENTENCES.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === sentenceIdx ? 16 : 6, opacity: i === sentenceIdx ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
                className="h-1.5 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default ArticlePreviewCard
