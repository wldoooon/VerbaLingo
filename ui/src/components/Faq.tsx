"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import ShinyText from "./ShinyText"
import AnimatedContent from "./AnimatedContent"

const faqData = [
  {
    question: "What is VerbaLingo, and how can it help me?",
    answer: "VerbaLingo is a context-first language learning engine. We index millions of real-world video frames to show you exactly how native speakers use words in context, helping you master fluency faster than traditional methods."
  },
  {
    question: "Is there a free tier available?",
    answer: "Yes! Every new user gets 100,000 free credits to explore the platform. You can search for contexts and use our AI Assistant without spending a dime."
  },
  {
    question: "How do credits work?",
    answer: "Credits are spent when you perform searches or chat with the AI. Searches cost 1,000 credits, and AI messages cost 5,000. Your wallet resets daily at midnight based on your plan."
  },
  {
    question: "Is my learning data secure?",
    answer: "Absolutely. We use high-level encryption for all user data and your search history is private to your account. We never share your data with third parties."
  },
  {
    question: "How can I contact support?",
    answer: "We're here to help! You can reach our dedicated support team through the feedback dialog in the app or by clicking the 'Contact us' button on this page."
  }
]

export function Faq() {
  return (
    <section className="py-32 bg-transparent overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col gap-20">
          
          {/* Header Hook */}
          <AnimatedContent distance={40} direction="vertical" duration={0.8} threshold={0.2}>
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                <ShinyText
                  text="Have more questions?"
                  speed={2}
                  delay={0}
                  color="#b5b5b5"
                  shineColor="#f97316"
                  spread={120}
                  direction="left"
                  className="inline-block"
                />
              </h2>
              
              <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                VerbaLingo is built to make mastering native fluency easy and stress-free. Explore our most common inquiries below.
              </p>
            </div>
          </AnimatedContent>

          {/* Ultra-Wide Accordion */}
          <AnimatedContent distance={60} direction="vertical" delay={0.2} duration={1} threshold={0.1}>
            <div className="w-full">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqData.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border-none bg-slate-50 dark:bg-zinc-900/50 rounded-3xl overflow-hidden group data-[state=open]:bg-slate-100/50 dark:data-[state=open]:bg-zinc-900 transition-colors shadow-sm"
                  >
                    <AccordionTrigger className="hover:no-underline px-8 py-8 text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-8 text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-4xl">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </AnimatedContent>

          {/* Support CTA Card */}
          <AnimatedContent distance={40} direction="vertical" delay={0.4} duration={0.8} threshold={0.1}>
            <div className="flex justify-center">
              <div className="p-10 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/30 space-y-8 w-full max-w-2xl text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Can't find answers?</h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    We're here to help you out whenever you need! Get in touch with our dedicated support team for personalized assistance.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button className="rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-10 py-7 text-lg font-bold gap-3 group shadow-xl transition-all hover:scale-105 active:scale-95">
                    Contact us
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedContent>

        </div>
      </div>
    </section>
  )
}
