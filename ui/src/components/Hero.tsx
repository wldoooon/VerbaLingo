"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, PlayCircle, Film, Tv, Mic, MonitorPlay, ArrowRight, Users, Newspaper, Video, Activity, MessageSquare, Layers, Database, TrendingUp, Quote } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/animate-ui/components/radix/tooltip";
import { useTheme } from "next-themes";
import { Features } from "./Features";

const categories = [
  {
    id: 'movies',
    label: 'Movies',
    count: '142k',
    description: 'Blockbuster contexts',
    icon: Film,
    image: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg', // Shawshank
  },
  {
    id: 'cartoons',
    label: 'Cartoons',
    count: '85k',
    description: 'Animated learning',
    icon: Tv,
    image: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', // Inception
  },
  {
    id: 'podcasts',
    label: 'Podcasts',
    count: '210k',
    description: 'Natural conversations',
    icon: Mic,
    image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // Dark Knight
  },
  {
    id: 'interviews',
    label: 'Interviews',
    count: '98k',
    description: 'Q&A mastery',
    icon: Users,
    image: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Parasite
  },
  {
    id: 'talks',
    label: 'Talks',
    count: '120k',
    description: 'Inspiring speeches',
    icon: MonitorPlay,
    image: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  },
  {
    id: 'vlogs',
    label: 'Vlogs',
    count: '65k',
    description: 'Daily life & travel',
    icon: Video,
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
  },
  {
    id: 'news',
    label: 'News',
    count: '110k',
    description: 'Current events',
    icon: Newspaper,
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
  }
];

export function Hero() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const trendingHighlights = [
    {
      word: "Schadenfreude",
      definition: "Pleasure derived from another's misfortune.",
      context: "A sense of schadenfreude swept the crowd as the rival fumbled.",
      frequency: "German Context",
      usage: "82%"
    },
    {
      word: "Bite the bullet",
      definition: "To endure an unpleasant but unavoidable situation.",
      context: "She decided to bite the bullet and finally start the complex migration.",
      frequency: "English Idiom",
      usage: "95%"
    },
    {
      word: "Feierabend",
      definition: "The state of being finished with work for the day.",
      context: "It's 5:00 PM—time to close the laptop and enjoy the Feierabend.",
      frequency: "German Context",
      usage: "88%"
    },
    {
      word: "Break the ice",
      definition: "To say or do something to relieve tension in a social setting.",
      context: "He told a joke to break the ice at the start of the meeting.",
      frequency: "English Idiom",
      usage: "91%"
    },
    {
      word: "Under the weather",
      definition: "Feeling slightly unwell or sick.",
      context: "I'm feeling a bit under the weather today, so I'll stay home.",
      frequency: "English Phrase",
      usage: "84%"
    },
    {
      word: "Piece of cake",
      definition: "Something that is very easy to do.",
      context: "Don't worry about the exam; it was a total piece of cake!",
      frequency: "English Idiom",
      usage: "94%"
    }
  ];

  const currentHighlight = trendingHighlights[highlightIdx];

  const handleSearch = (query: string) => {
    router.push(`/search/${encodeURIComponent(query)}/General`);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setHighlightIdx((prev) => (prev + 1) % trendingHighlights.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isPaused, trendingHighlights.length]);

  // Helper to get distance from active index handling wrap-around
  const getOffset = (index: number) => {
    const length = categories.length;
    let diff = (index - activeCategory) % length;
    if (diff > length / 2) diff -= length;
    if (diff < -length / 2) diff += length;
    return diff;
  };

  return (
    <div className="relative w-full">


      <div className="max-w-[1300px] mx-auto pt-8 pb-20 px-6 lg:px-12 relative z-10">
        {/* Split Hero Section */}
        <div className="grid lg:grid-cols-2 gap-50 lg:gap-12 items-center mb-24 min-h-[600px]">

          {/* Left Column: Context Content & Insights */}
          <div className="flex flex-col justify-center relative z-20">



            <h1 className="text-[clamp(3.5rem,8vw,4.5rem)] lg:text-7xl font-black text-foreground tracking-tighter leading-[0.85] mb-6 relative inline-block w-fit">
              {/* Mascot Behind Text - Anchored together using 'em' scaling */}
              <div
                className="absolute -z-10 opacity-80 pointer-events-none transition-transform duration-1000 group-hover:scale-105"
                style={{
                  width: '6em',
                  height: '6em',
                  top: '-1.8em',
                  right: '-4em'
                }}
              >
                <img
                  src={mounted && resolvedTheme === 'dark' ? "/sleeping_cat.png" : "/cat_logo3.png"}
                  alt="Mascot"
                  className="w-full h-full object-contain"
                />
              </div>

              Speak <br />
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Moment.</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed font-medium border-l-2 border-primary/30 pl-6">
              Bridge the gap between dictionary definitions and native fluency. Our engine indexes <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-4">14.2M video frames</span>, paired with an <span className="text-foreground font-bold">AI Assistant</span> you can ask anything about usage, tone, and cultural nuance.
            </p>

            {/* Live Context Spotlight Widget */}
            <div className="w-full max-w-md bg-background/60 backdrop-blur-md border border-border rounded-3xl shadow-xl overflow-hidden mb-10 p-1 group/widget transition-all duration-500 hover:shadow-primary/10">
              <div className="bg-card rounded-[1.4rem] overflow-hidden border border-border/50 shadow-sm transition-all duration-500">
                <div className="flex items-center justify-between px-6 py-3 border-b border-border/30 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Live Context Insight</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Analyzing Stream</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="max-w-[70%]">
                      <h2 className="text-3xl font-black text-foreground tracking-tighter mb-1 animate-in fade-in duration-500" key={currentHighlight.word}>
                        {currentHighlight.word}
                      </h2>
                      <p className="text-xs font-medium text-muted-foreground leading-snug line-clamp-2">
                        {currentHighlight.definition}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase mb-0.5">Freq</div>
                      <div className="text-lg font-mono font-black text-primary">{currentHighlight.frequency}</div>
                    </div>
                  </div>

                  <div className="relative bg-muted/30 rounded-2xl p-4 border border-border/50 group-hover/widget:border-primary/20 transition-colors">
                    <Quote className="absolute -top-2 -left-1 w-6 h-6 text-muted-foreground opacity-20" />
                    <p className="text-foreground font-bold italic text-base leading-relaxed relative z-10 px-1">
                      "{currentHighlight.context}"
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tight">Density: {currentHighlight.usage}</span>
                      </div>
                      <button
                        onClick={() => handleSearch(currentHighlight.word)}
                        className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 group/btn"
                      >
                        View
                        <ArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-muted/20 border-t border-border/30 flex items-center justify-between">
                  <div className="flex gap-1">
                    {trendingHighlights.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === highlightIdx ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}></div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground opacity-60">
                    <Sparkles className="w-3 h-3 text-primary/60" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Neural Index</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Library Scale Metrics Strip */}
            <div className="flex flex-col gap-6 mt-2">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Library Scale</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              <div className="grid grid-cols-3 gap-8 px-4">
                <div className="flex flex-col gap-2 group cursor-default">
                  <div className="flex items-center gap-2 text-primary">
                    <Globe className="w-4 h-4" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Languages</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground tracking-tighter font-mono group-hover:text-primary transition-colors">3+</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Native dialects</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/30 w-3/4"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 group cursor-default border-x border-border/50 px-8">
                  <div className="flex items-center gap-2 text-primary">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Categories</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground tracking-tighter font-mono group-hover:text-primary transition-colors">3+</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Subject areas</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/30 w-1/2"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 group cursor-default text-right">
                  <div className="flex items-center justify-end gap-2 text-primary">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contextual Clips</span>
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-4xl font-black text-foreground tracking-tighter font-mono group-hover:text-primary transition-colors">14.2M</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Indexed frames</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/30 w-5/6 ml-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Removed: Start Exploring & Trusted By */}
          </div>

          {/* Right Column: Curved Carousel (Preserved & Merged) */}
          <div
            className="relative h-[650px] w-full flex items-center justify-center perspective-[1000px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {categories.map((cat, index) => {
              const offset = getOffset(index);
              const absOffset = Math.abs(offset);
              const isActive = offset === 0;

              const translateX = offset * 140;
              const translateZ = absOffset * -130;
              const rotateY = offset * -15;

              const opacity = isActive ? 1 : Math.max(0.2, 1 - absOffset * 0.4);
              const zIndex = 10 - absOffset;
              const scale = isActive ? 1 : 0.9;
              const blur = isActive ? 0 : absOffset * 2;

              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(index)}
                  className={`absolute w-[400px] h-[540px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer`}
                  style={{
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex,
                    filter: `blur(${blur}px)`,
                  }}
                >
                  <div className={`relative w-full h-full rounded-[2rem] overflow-hidden border shadow-2xl bg-card group transition-colors duration-500 ${isActive ? 'border-primary/50' : 'border-border/50'}`}>
                    {/* Image Background */}
                    <div className="absolute inset-0">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90" />
                    </div>

                    {/* Top Badge: Clip Count */}
                    <div className="absolute top-4 right-4 bg-muted/90 backdrop-blur-md border border-border/20 px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-bold text-foreground tracking-wide">{cat.count} Clips</span>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-7 transform transition-transform duration-500">
                      <div className="w-13 h-13 bg-muted/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/10 text-white shadow-lg">
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{cat.label}</h3>
                      <p className="text-sm text-slate-300 font-medium">{cat.description}</p>
                    </div>

                    {/* Hover Border Glow */}
                    <div className={`absolute inset-0 border-2 border-transparent transition-all duration-500 rounded-[2rem] ${isActive ? 'border-primary/20' : 'group-hover:border-primary/20'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Grid */}
        <Features />

      </div>
    </div>
  );
}
