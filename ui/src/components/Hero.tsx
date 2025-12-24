"use client";

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Globe, PlayCircle, Film, Tv, Mic, MonitorPlay, ArrowRight, Users, Newspaper, Video, Play, Activity, Bot, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
  const [activeCategory, setActiveCategory] = useState(2);
  const [isPaused, setIsPaused] = useState(false);

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

          {/* Left Column: Redesigned Content */}
          <div className="text-left relative z-20 flex flex-col justify-center">

            {/* Huge Headline */}
            <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] mb-6 relative">
              {/* Mascot Behind Text */}
              <div className="absolute -top-80 -left-10 w-64 h-64 md:w-[450px] md:h-[450px] md:-top-66 md:left-50 -z-10 opacity-90 pointer-events-none">
                <img src="/cat_logo3.png" alt="Mascot" className="w-full h-full object-contain" />
              </div>

              Stop <br />
              Studying. <br />
              <span className="text-primary">
                Start Living.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed mb-10 border-l-2 border-primary/30 pl-6">
              The world's first context-engine. Forget flashcards—immerse yourself in millions of real-life video moments.
            </p>

            {/* Featured Context Preview Widget */}
            <div className="bg-card/50 border border-border rounded-2xl p-5 mb-10 max-w-md shadow-2xl backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 blur-2xl rounded-full"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Featured Context</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <Film className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary">142 Clips</span>
                  </div>
                </div>

                <div className="flex items-baseline space-x-3 mb-2">
                  <h3 className="text-2xl font-bold text-foreground">Serendipity</h3>
                  <span className="text-sm font-mono text-muted-foreground">/ˌserənˈdipədē/</span>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  The occurrence and development of events by chance in a happy or beneficial way.
                </p>

                <button
                  onClick={() => handleSearch("Serendipity")}
                  className="w-full py-2.5 bg-muted/50 hover:bg-primary border border-border hover:border-primary rounded-xl flex items-center justify-center space-x-2 transition-all group/btn"
                >
                  <Play className="w-3 h-3 text-primary fill-current group-hover/btn:text-primary-foreground transition-colors" />
                  <span className="text-xs font-bold text-foreground group-hover/btn:text-primary-foreground uppercase tracking-wide">Watch Contexts</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button
                onClick={() => handleSearch("Hello")}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center group min-w-[200px] justify-center"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Mini Social Proof Inline */}
              <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-xs font-bold text-muted-foreground uppercase mr-2 border-r border-border pr-4">Trusted By</span>
                <span className="font-serif font-bold text-foreground text-sm">Harvard</span>
                <span className="font-sans font-bold text-foreground text-sm">MIT</span>
                <span className="font-sans font-black text-foreground text-sm tracking-tighter">TED</span>
              </div>
            </div>
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

        {/* Feature Grid (The Bento Grid) */}
        <div className="py-20 relative">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to fluency</h2>
            <p className="text-muted-foreground">Our engine combines four powerful technologies to create the ultimate immersion experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

            {/* Large Block - Search Context */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="md:col-span-2 row-span-2 bg-card/50 border border-border/50 rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-all"
            >
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
                {/* Visual simulation of search results */}
                <div className="space-y-3">
                  <Skeleton className="h-2 w-3/4 rounded-full bg-muted/50" />
                  <Skeleton className="h-2 w-1/2 rounded-full bg-muted/50" />
                  <Skeleton className="h-2 w-5/6 rounded-full bg-muted/50" />
                </div>
              </div>
            </motion.div>

            {/* Tall Block - AI Tutor (UPDATED) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="md:col-span-1 row-span-2 bg-primary text-primary-foreground border border-primary rounded-3xl p-8 relative overflow-hidden group shadow-2xl shadow-primary/20"
            >

              {/* Fancy Tech Background: Dot Grid Pattern */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)',
                  backgroundSize: '24px 24px'
                }}>
              </div>

              {/* Geometric Decorations */}
              <div className="absolute -top-12 -right-12 w-48 h-48 border-[24px] border-white/20 rounded-full group-hover:scale-110 transition-transform duration-700 ease-out"></div>
              <div className="absolute top-32 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>

              <div className="relative z-10 h-full flex flex-col">

                {/* ANIMATED AI ICON */}
                <div className="relative w-16 h-16 mb-8 group-hover:scale-105 transition-transform duration-500">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>

                  {/* Tech Ring 1 (Fast Spin) */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-[spin_3s_linear_infinite]"></div>

                  {/* Tech Ring 2 (Slow Reverse Spin) */}
                  <div className="absolute inset-2 rounded-full border border-white/30 border-dashed animate-[spin_10s_linear_infinite_reverse]"></div>

                  {/* Center Core */}
                  <div className="absolute inset-3 bg-white rounded-xl flex items-center justify-center shadow-lg z-10">
                    <Bot className="w-6 h-6 text-primary animate-[bounce_3s_infinite]" />
                  </div>

                  {/* Orbiting Badge */}
                  <div className="absolute -top-1 -right-1 z-20 bg-primary-foreground rounded-full p-1 border-2 border-primary animate-bounce">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">AI Companion</h3>
                <p className="text-primary-foreground/80 text-sm mb-8 font-medium leading-relaxed">
                  "Why did they laugh?" <br />
                  "Is this formal?" <br />
                  Ask the AI anything.
                </p>

                {/* Chat Bubble Visual */}
                <div className="mt-auto space-y-3">
                  <div className="bg-white/10 border border-white/20 p-3 rounded-xl rounded-tl-none backdrop-blur-none animate-[pulse_6s_ease-in-out_infinite]">
                    <div className="text-[10px] uppercase font-bold text-white/70 mb-1 tracking-wider">User</div>
                    <div className="text-xs font-mono">What does "break a leg" mean?</div>
                  </div>
                  <div className="bg-white text-primary p-3 rounded-xl rounded-tr-none shadow-xl transform transition-transform hover:-translate-y-1 duration-300">
                    <div className="text-[10px] uppercase font-bold text-primary/70 mb-1 tracking-wider">AI Tutor</div>
                    <div className="text-xs font-semibold">It's a theater idiom for "Good luck"!</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Medium Block - Pronunciation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="md:col-span-1 bg-card/50 border border-border/50 rounded-3xl p-8 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mic className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <Activity className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Pronunciation</h3>
              <p className="text-muted-foreground text-sm">Compare your voice with native speakers.</p>
            </motion.div>

            {/* Medium Block - Global */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="md:col-span-1 bg-card/50 border border-border/50 rounded-3xl p-8 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Globe className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Global Library</h3>
              <p className="text-muted-foreground text-sm">Content from 50+ countries and cultures.</p>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}
