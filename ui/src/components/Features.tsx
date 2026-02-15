"use client";

import React from 'react';
import { Search, Bot, Mic, Globe, Sparkles } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedContent from "./AnimatedContent";

export function Features() {
  return (
    <div className="py-20 relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
        
        {/* Animated Header */}
        <AnimatedContent distance={40} direction="vertical" duration={0.8} threshold={0.2}>
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
              Everything you need to fluency
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our engine combines four powerful technologies to create the ultimate immersion experience.
            </p>
          </div>
        </AnimatedContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* Large Block - Search Context */}
          <AnimatedContent distance={60} delay={0.1} className="md:col-span-2 row-span-2">
            <div className="bg-card/50 border border-border/50 rounded-[2.5rem] p-10 h-full relative overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search className="w-64 h-64 text-primary transform rotate-12 translate-x-12 -translate-y-12" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                    <Search className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Context Engine™</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                    Don't just find definitions. Find moments. Our engine scans millions of videos to find the exact millisecond a word is spoken, giving you 360° understanding of tone, body language, and situation.
                  </p>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-2 w-3/4 rounded-full bg-muted/50" />
                  <Skeleton className="h-2 w-1/2 rounded-full bg-muted/50" />
                  <Skeleton className="h-2 w-5/6 rounded-full bg-muted/50" />
                </div>
              </div>
            </div>
          </AnimatedContent>

          {/* Tall Block - AI Tutor */}
          <AnimatedContent distance={60} delay={1.2} className="md:col-span-1 row-span-2">
            <div className="bg-primary text-primary-foreground border border-primary rounded-[2.5rem] p-10 h-full shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)',
                  backgroundSize: '24px 24px'
                }}>
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="relative w-16 h-16 mb-8 group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-[spin_3s_linear_infinite]"></div>
                  <div className="absolute inset-2 rounded-full border border-white/30 border-dashed animate-[spin_10s_linear_infinite_reverse]"></div>
                  <div className="absolute inset-3 bg-white rounded-xl flex items-center justify-center shadow-lg z-10">
                    <Bot className="w-6 h-6 text-primary animate-[bounce_3s_infinite]" />
                  </div>
                  <div className="absolute -top-1 -right-1 z-20 bg-primary-foreground rounded-full p-1 border-2 border-primary animate-bounce">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">AI Companion</h3>
                <p className="text-primary-foreground/80 text-sm mb-8 font-medium leading-relaxed">
                  "Why did they laugh?" <br />
                  "Is this formal?" <br />
                  Ask the AI anything.
                </p>
                <div className="mt-auto space-y-3">
                  <div className="bg-white/10 border border-white/20 p-3 rounded-xl rounded-tl-none">
                    <div className="text-[10px] uppercase font-bold text-white/70 mb-1 tracking-wider">User</div>
                    <div className="text-xs font-mono">What does "break a leg" mean?</div>
                  </div>
                  <div className="bg-white text-primary p-3 rounded-xl rounded-tr-none shadow-xl">
                    <div className="text-[10px] uppercase font-bold text-primary/70 mb-1 tracking-wider">AI Tutor</div>
                    <div className="text-xs font-semibold">It's a theater idiom for "Good luck"!</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContent>

          {/* Medium Block - Pronunciation */}
          <AnimatedContent distance={60} delay={0.3}>
            <div className="bg-card/50 border border-border/50 rounded-[2.5rem] p-10 hover:bg-muted/50 transition-all group h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mic className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Pronunciation</h3>
              <p className="text-muted-foreground text-sm">Compare your voice with native speakers.</p>
            </div>
          </AnimatedContent>

          {/* Medium Block - Global */}
          <AnimatedContent distance={60} delay={0.4}>
            <div className="bg-card/50 border border-border/50 rounded-[2.5rem] p-10 hover:bg-muted/50 transition-all group h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Globe className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Global Library</h3>
              <p className="text-muted-foreground text-sm">Content from 50+ countries and cultures.</p>
            </div>
          </AnimatedContent>

        </div>
      </div>
    </div>
  );
}
