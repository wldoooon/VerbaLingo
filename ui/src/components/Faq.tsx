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
    question: "What is PokiSpokey, and how does it work?",
    answer: "PokiSpokey is a context-first language learning platform. You search for any word or expression, and we instantly show you real YouTube clips where native speakers use it at the exact timestamp, with a full transcript. Think of it as a dictionary that speaks. You can also ask our AI Assistant anything about the word's meaning, tone, or cultural context right from the player.",
    tag: "Getting Started",
  },
  {
    question: "Which languages are supported?",
    answer: "We currently support English, French, and German. Spanish is actively being added to our catalog. Each language has its own library of real-world video content spanning movies, podcasts, cartoons, talks, news, and more.",
    tag: "Languages",
  },
  {
    question: "Is there a free tier available?",
    answer: "Yes! Every new account starts with 50,000 free ai credits and 100 searches per month, no credit card required. That's enough to explore hundreds of clips and have real conversations with the AI Assistant before deciding on a plan.",
    tag: "Pricing",
  },
  {
    question: "How do ai credits work?",
    answer: "AI credits are the fuel for your AI Assistant conversations. Each message you send and receive costs AI credits based on the length of the exchange. Searching for clips is completely free and never costs AI credits — only your monthly search quota applies. When you run low, you can upgrade your plan or wait for your monthly AI credits to refill.",
    tag: "Sparks",
  },
  {
    question: "What counts as a search? Will refreshing the page use up my quota?",
    answer: "Only genuinely new searches count. If you search the same word or phrase again within one hour — whether from refreshing, clicking back, or re-typing it — we detect the duplicate and don't charge your quota a second time. Browsing through results pages (page 2, 3…) of the same search also doesn't count as additional searches.",
    tag: "Search",
  },
  {
    question: "What makes PokiSpokey different from other language apps?",
    answer: "Most apps use scripted sentences written by textbook authors. PokiSpokey uses 14.2 million real video frames from actual movies, podcasts, cartoons, and speeches. You hear the word with real intonation, emotion, and cultural weight — not a robotic voice reading a made-up sentence. The built-in AI Assistant then lets you ask anything about what you just heard.",
    tag: "Features",
  },
  {
    question: "How does the AI Assistant work?",
    answer: "The AI Assistant is aware of your current search query and the clip you are watching. You can ask things like 'Why does this feel informal?', 'What's the grammar structure here?', or 'Give me 3 similar expressions'. It responds in context, making every explanation feel like a conversation with a native-speaking tutor rather than a generic dictionary lookup.",
    tag: "AI",
  },
  {
    question: "Can I use PokiSpokey on mobile?",
    answer: "Yes — the platform is fully responsive and works in any modern browser on phones, tablets, and desktops. We also offer a Chrome extension that lets you look up any word or phrase directly from websites you're reading without switching tabs.",
    tag: "Platform",
  },
  {
    question: "What video categories are available?",
    answer: "Clips are organized across six categories: Movies, Podcasts, Cartoons, Talks, News, and Shows. When you search, results are pulled from all categories simultaneously and interleaved, so you see diverse usage contexts in a single search. You can filter by category or sub-category to focus on a specific style of speech.",
    tag: "Features",
  },
  {
    question: "How can I contact support?",
    answer: "You can reach us directly through the 'Contact us' button on this page. We read every message and typically reply within one business day.",
    tag: "Support",
  },
]

export function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background overflow-hidden">
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
                    text="Got questions?"
                    speed={2}
                    delay={0}
                    color="#4b5563"
                    shineColor="#ffffff"
                    spread={120}
                    direction="left"
                    className="inline-block pr-4"
                  />
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                  Everything you need to know about Pokispokey. Can't find what you're looking for? Reach out below.
                </p>
              </div>

              {/* Contact CTA */}
              <div className="hidden lg:block">
                <ContactMorphSurface
                  triggerLabel="Contact us"
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
                    className="border border-border rounded-2xl flex flex-col group/item data-[state=open]:bg-muted/40 data-[state=open]:border-border/50 transition-all"
                  >
                    <AccordionTrigger className="px-6 py-5 items-center text-base md:text-lg font-semibold hover:no-underline [&>svg]:hidden cursor-pointer group/trigger">
                      <div className="flex gap-6 items-center text-left flex-1">
                        <span className="text-muted-foreground tabular-nums shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-snug">
                          {item.question}
                        </span>
                      </div>
                      <PlusIcon className="w-5 h-5 shrink-0 text-muted-foreground group-data-[state=open]/trigger:hidden transition-transform duration-300" />
                      <MinusIcon className="w-5 h-5 shrink-0 text-muted-foreground hidden group-data-[state=open]/trigger:inline transition-transform duration-300" />
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 ps-[76px]">
                      <div className="space-y-4">
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest rounded-md px-2 py-0.5 border-border/50 text-muted-foreground">
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
              triggerLabel="Contact us"
              animationSpeed={1}
            />
          </div>

        </div>
      </div>
    </section>
  )
}
