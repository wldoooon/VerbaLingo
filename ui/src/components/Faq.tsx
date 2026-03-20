"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ContactMorphSurface } from "@/components/ui/contact-morph-surface"
import { HelpCircle } from "lucide-react"
import ShinyText from "./ShinyText"
import AnimatedContent from "./AnimatedContent"
import { Carter_One } from 'next/font/google';
import { cn } from '@/lib/utils';

const carterOne = Carter_One({ weight: '400', subsets: ['latin'] });

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

                <h2 className={cn("text-[clamp(2.5rem,7vw,3.5rem)] font-black leading-tight", carterOne.className)}>
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
          <Card className="border-none shadow-none bg-transparent rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((item, index) => (
                  <AnimatedContent
                    key={index}
                    distance={40}
                    direction="vertical"
                    delay={0.15 * index}
                    duration={0.7}
                    threshold={0.05}
                  >
                    <AccordionItem
                      value={`item-${index}`}
                      className="border-b border-border/40 last:border-b-0 px-6 md:px-8 transition-colors"
                    >
                      <AccordionTrigger className="hover:no-underline py-6 gap-4 cursor-pointer [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
                        <div className="flex flex-col items-center justify-center flex-1 w-full gap-4 text-center">
                          <span className="text-base md:text-lg font-semibold text-foreground leading-snug w-full">
                            {item.question}
                          </span>
                          <Separator className="w-3/4 bg-border/50 h-[1px]" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 pt-0">
                        <div className="flex items-start gap-3">
                          <Separator orientation="vertical" className="h-auto self-stretch w-0.5 bg-primary/30 rounded-full" />
                          <div className="space-y-3 flex-1">
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              {item.answer}
                            </p>
                            <Badge variant="outline" className="text-[10px] font-medium rounded-md">
                              {item.tag}
                            </Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </AnimatedContent>
                ))}
              </Accordion>
            </CardContent>
          </Card>

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

