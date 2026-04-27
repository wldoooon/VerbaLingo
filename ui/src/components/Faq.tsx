"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ContactMorphSurface } from "@/components/ui/contact-morph-surface"
import { PlusIcon, MinusIcon } from "lucide-react"
import ShinyText from "./ShinyText"
import AnimatedContent from "./AnimatedContent"
import { cn } from '@/lib/utils';

const faqData = [
  {
    question: "What is MiniYouGlish and how does it help me learn?",
    answer: "MiniYouGlish is an immersion-first language engine. Instead of studying textbook sentences, you search for any word or phrase and instantly find real YouTube clips where native speakers use it in context. It's designed to help you master intonation, cultural nuance, and real-world usage.",
    tag: "Concept",
  },
  {
    question: "How do AI credits work?",
    answer: "AI credits power your personal Language Tutor. When you ask questions about a clip — like 'Why did they use this specific tense?' or 'Explain this slang' — it consumes credits based on the length of the explanation. Searching for clips is governed by your monthly search quota, not your AI credits.",
    tag: "AI Tutor",
  },
  {
    question: "Which languages can I practice?",
    answer: "We currently support English, French, and German with over 14.2 million indexed video frames. We are actively expanding to Spanish and Japanese to provide the same level of deep immersion across more languages.",
    tag: "Languages",
  },
  {
    question: "Does the Free Starter plan really have no catch?",
    answer: "Correct! Our Free Starter tier gives you 100 searches and 50,000 AI credits per month, forever. No credit card is required to sign up. It's a fully functional 'Blueprint' of the platform so you can test the immersion quality before upgrading.",
    tag: "Pricing",
  },
  {
    question: "What counts as a 'Search'?",
    answer: "A search is counted when you look up a new word or expression. Navigating through multiple pages of results for the same word doesn't consume extra quota. We also have a 1-hour 'grace window' where re-searching the same term won't count against your limit.",
    tag: "Search",
  },
  {
    question: "Can I use MiniYouGlish on my phone?",
    answer: "Yes. MiniYouGlish is fully responsive. You can search, watch clips, and chat with your AI Tutor seamlessly across desktop, tablet, and mobile browsers.",
    tag: "Platform",
  },
  {
    question: "What categories of videos are indexed?",
    answer: "Our engine crawls diverse sources including Movies, Podcasts, Cartoons, Tech Talks, News, and TV Shows. This ensures you hear your target vocabulary used in everything from formal speeches to casual street slang.",
    tag: "Content",
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can manage or cancel your subscription at any time through your Profile settings. There are no lock-in contracts — our 'Blueprint' philosophy is built on transparency and value.",
    tag: "Billing",
  },
]

export function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background overflow-hidden border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-9 max-w-8xl">

        {/* Two-column layout: Left (header + CTA) | Right (accordion) */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.6fr] gap-8 lg:gap-20 items-start">

          {/* Left Column — Sticky header + Contact CTA */}
          <AnimatedContent distance={40} direction="vertical" duration={1.2} threshold={0.2}>
            <div className="lg:sticky lg:top-28 space-y-10">
              {/* Header */}
              <div className="space-y-4 flex flex-col items-center text-center lg:items-start lg:text-left">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  <ShinyText
                    text="IMMERSION FAQ"
                    speed={2}
                    delay={0}
                    color="#4b5563"
                    shineColor="#ffffff"
                    spread={120}
                    direction="left"
                    className="inline-block pr-4 font-black tracking-tighter"
                  />
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed max-w-sm font-medium">
                  Technical specifications and operational details for the MiniYouGlish engine.
                </p>
              </div>

              {/* Contact CTA */}
              <div className="hidden lg:block border rounded-2xl p-6 bg-card">
                 <p className="text-sm text-muted-foreground mb-4 font-medium uppercase tracking-wider">Need Technical Support?</p>
                <ContactMorphSurface
                  triggerLabel="Open Support Ticket"
                  animationSpeed={1}
                />
              </div>
            </div>
          </AnimatedContent>

          {/* Right Column — Accordion */}
          <div className="w-full">
            <Accordion type="single" collapsible defaultValue="item-0" className="w-full flex flex-col gap-4">
              {faqData.map((item, index) => (
                <AnimatedContent
                  key={index}
                  distance={40}
                  direction="vertical"
                  delay={0.1 * index}
                  duration={0.7}
                  threshold={0.05}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="border border-border/60 rounded-2xl flex flex-col group/item data-[state=open]:bg-muted/30 data-[state=open]:border-border/80 transition-all overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-5 items-center text-base md:text-lg font-bold hover:no-underline [&>svg]:hidden cursor-pointer group/trigger">
                      <div className="flex gap-6 items-center text-left flex-1">
                        <span className="text-muted-foreground/50 tabular-nums shrink-0 font-mono text-xs">
                          [{String(index + 1).padStart(2, "0")}]
                        </span>
                        <span className="leading-snug uppercase tracking-tight">
                          {item.question}
                        </span>
                      </div>
                      <PlusIcon className="w-4 h-4 shrink-0 text-muted-foreground group-data-[state=open]/trigger:hidden transition-transform duration-300" />
                      <MinusIcon className="w-4 h-4 shrink-0 text-muted-foreground hidden group-data-[state=open]/trigger:inline transition-transform duration-300" />
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 ps-[76px]">
                      <div className="space-y-4">
                        <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed font-medium">
                          {item.answer}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] rounded-md px-2 py-0.5 border-border/50 bg-muted/20">
                            {item.tag}
                          </Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </AnimatedContent>
              ))}
            </Accordion>
          </div>

          {/* Mobile Contact CTA (Shown under Accordion) */}
          <div className="lg:hidden flex justify-center w-full mt-2">
            <ContactMorphSurface
              triggerLabel="Contact support"
              animationSpeed={1}
            />
          </div>

        </div>
      </div>
    </section>
  )
}
