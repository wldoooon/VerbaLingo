"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, HelpCircle, MessageCircle, Sparkles } from "lucide-react"
import ShinyText from "./ShinyText"
import AnimatedContent from "./AnimatedContent"

const faqData = [
  {
    question: "What is VerbaLingo, and how can it help me?",
    answer: "VerbaLingo is a context-first language learning engine. We index millions of real-world video frames to show you exactly how native speakers use words in context, helping you master fluency faster than traditional methods.",
    tag: "Getting Started",
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
    question: "Is my learning data secure?",
    answer: "Absolutely. We use high-level encryption for all user data and your search history is private to your account. We never share your data with third parties.",
    tag: "Security",
  },
  {
    question: "How can I contact support?",
    answer: "We're here to help! You can reach our dedicated support team through the feedback dialog in the app or by clicking the 'Contact us' button on this page.",
    tag: "Support",
  },
]

export function Faq() {
  return (
    <section className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

        {/* Two-column layout: Left (header + CTA) | Right (accordion) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start">

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
              <Card className="border border-border/60 shadow-sm bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-foreground tracking-tight">Still have questions?</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Get personalized help from our team.
                      </p>
                    </div>
                  </div>
                  <Button className="w-full rounded-full h-10 font-semibold gap-2 group shadow-md hover:shadow-lg transition-all">
                    Contact us
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </AnimatedContent>

          {/* Right Column — Accordion */}
          <AnimatedContent distance={50} direction="vertical" delay={0.2} duration={1} threshold={0.1}>
            <Card className="border border-border/60 shadow-sm bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map((item, index) => (
                    <AccordionItem
                      key={index}
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
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </AnimatedContent>

        </div>
      </div>
    </section>
  )
}
