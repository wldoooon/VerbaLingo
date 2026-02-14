"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowUpRight } from "lucide-react"

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
    <section className="py-24 bg-transparent border-t border-slate-100 dark:border-zinc-900/50">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Hook & CTA */}
          <div className="space-y-8 lg:sticky lg:top-24">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">FAQ</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-tight">
                Have more questions?
              </h2>
              
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                VerbaLingo is built to make mastering native fluency easy and stress-free. Explore our most common inquiries below.
              </p>
            </div>

            {/* Support Card */}
            <div className="p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/30 space-y-6 max-w-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Can't find answers?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  We're here to help you out whenever you need! Get in touch with our dedicated support team for personalized assistance.
                </p>
              </div>
              <Button className="rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-6 py-6 font-bold gap-2 group text-sm">
                Contact us
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Side: Accordion */}
          <div className="w-full">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqData.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-none bg-slate-50 dark:bg-zinc-900/50 rounded-2xl overflow-hidden group data-[state=open]:bg-slate-100/50 dark:data-[state=open]:bg-zinc-900 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline px-6 py-6 text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      </div>
    </section>
  )
}
