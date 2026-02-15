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

const faqData = [
  {
    question: "What is VerbaLingo, and how can it help me?",
    answer: "VerbaLingo is a context-first language learning engine. We index millions of real-world video frames to show you exactly how native speakers use words in context, helping you master fluency faster than traditional methods.",
    tag: "Getting Started",
  },
  {
    question: "Which languages are supported?",
    answer: "We currently support English, French, German, Spanish, and Arabic with more languages being added regularly. Each language has a curated library of real-world video content from movies, podcasts, and speeches.",
    tag: "Languages",
  },
  {
    question: "Is there a free tier available?",
    answer: "Yes! Every new user gets 100,000 free credits to explore the platform. You can search for contexts and use our AI Assistant without spending a dime.",
    tag: "Pricing",
  },
  {
    question: "How do credits work?",
    answer: "Credits are spent when you perform searches or chat with the AI. Searches cost 1,000 credits, and AI messages cost 5,000. Your wallet resets daily at midnight based on your plan.",
    tag: "Credits",
  },
  {
    question: "What makes VerbaLingo different from other language apps?",
    answer: "Unlike traditional apps that use scripted examples, VerbaLingo shows you real clips from movies, podcasts, and speeches. You learn how words are actually used by native speakers, with full context, tone, and emotion.",
    tag: "Features",
  },
  {
    question: "Can I use VerbaLingo on mobile?",
    answer: "VerbaLingo is fully responsive and works in any modern browser on mobile, tablet, and desktop. We also offer a browser extension for quick lookups while browsing the web.",
    tag: "Platform",
  },
  {
    question: "How does the AI Assistant work?",
    answer: "Our AI Assistant uses your search context to provide personalized explanations, grammar breakdowns, and usage examples. It understands the video clip you're watching and can answer questions about vocabulary, pronunciation, and cultural nuances.",
    tag: "AI",
  },
  {
    question: "Is my learning data secure?",
    answer: "Absolutely. We use high-level encryption for all user data and your search history is private to your account. We never share your data with third parties.",
    tag: "Security",
  },
  {
    question: "Can I save clips and create collections?",
    answer: "Yes! You can save any clip to your library, organize them into custom collections, and revisit them anytime. Your saved clips sync across all your devices.",
    tag: "Features",
  },
  {
    question: "How can I contact support?",
    answer: "We're here to help! You can reach our dedicated support team through the feedback dialog in the app or by clicking the 'Contact us' button on this page.",
    tag: "Support",
  },
]

export function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-9 max-w-8xl">

        {/* Two-column layout: Left (header + CTA) | Right (accordion) */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.6fr] gap-12 lg:gap-20 items-start">

          {/* Left Column — Sticky header + Contact CTA */}
          <AnimatedContent distance={40} direction="vertical" duration={1.2} threshold={0.2}>
            <div className="lg:sticky lg:top-28 space-y-10">
              {/* Header */}
              <div className="space-y-4">
                <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  FAQ
                </Badge>

                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                  <ShinyText
                    text="Got questions?"
                    speed={2}
                    delay={0}
                    color="#4b5563"
                    shineColor="#ffffff"
                    spread={120}
                    direction="left"
                    className="inline-block"
                  />
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                  Everything you need to know about VerbaLingo. Can't find what you're looking for? Reach out below.
                </p>
              </div>

              {/* Contact CTA */}
              <div>
                <ContactMorphSurface
                  triggerLabel="Contact us"
                  animationSpeed={1}
                />
              </div>
            </div>
          </AnimatedContent>

          {/* Right Column — Accordion */}
          <Card className="border border-border/60 shadow-sm bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
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
                      className="border-b border-border/40 last:border-b-0 px-6 md:px-8 transition-colors data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="hover:no-underline py-6 gap-4 text-left [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-base md:text-lg font-semibold text-foreground leading-snug">
                            {item.question}
                          </span>
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

        </div>
      </div>
    </section>
  )
}
