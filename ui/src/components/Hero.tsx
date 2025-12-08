"use client";

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Globe, PlayCircle, Film, Tv, Mic, MonitorPlay, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  }
];

const recentSearches = ["Hello", "Amazing", "Beautiful", "Adventure"];

export function Hero() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(2); // Start in middle
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
    <div className="max-w-[1400px] mx-auto pt-8 pb-22 px-7 lg:px-10 overflow-hidden">
      {/* Split Hero Section */}
      <div className="grid lg:grid-cols-2 gap-14 lg:gap-10 items-center mb-28 min-h-[650px]">

        {/* Left Column: Text Content */}
        <div className="text-left space-y-9 relative z-20">
          <div className="inline-flex items-center space-x-2.5 bg-muted/50 dark:bg-white/5 text-foreground dark:text-white px-4 py-2 rounded-full text-sm font-semibold border border-border dark:border-white/10 animate-fade-in backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary dark:text-white" />
            <span>New: AI-Powered Pronunciation Coach</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-foreground dark:text-white tracking-tight leading-[1.1]">
            Master languages through <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-muted-foreground dark:from-white dark:to-slate-500">
              real-world context
            </span>.
          </h1>

          <p className="text-xl text-muted-foreground dark:text-slate-400 max-w-xl leading-relaxed">
            Don't just memorize definitions. Immerse yourself in authentic clips from movies, cartoons, podcasts, and talks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-sm font-semibold text-muted-foreground dark:text-slate-500 uppercase tracking-wide">Try searching:</span>
            {recentSearches.map((word) => (
              <button
                key={word}
                onClick={() => handleSearch(word)}
                className="px-4 py-2 bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-full text-muted-foreground dark:text-slate-300 text-sm font-medium hover:border-primary/50 dark:hover:border-white/50 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-white/10 transition-all active:scale-95"
              >
                {word}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4 pt-5">
            <button
              onClick={() => handleSearch("Hello")}
              className="bg-primary dark:bg-white text-primary-foreground dark:text-black px-9 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 dark:shadow-white/10 hover:bg-primary/90 dark:hover:bg-slate-200 hover:shadow-primary/30 dark:hover:shadow-white/20 transition-all flex items-center group"
            >
              Start Learning
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-9 py-4 rounded-xl font-semibold text-muted-foreground dark:text-slate-300 hover:bg-muted/50 dark:hover:bg-white/5 transition-colors flex items-center border border-transparent hover:border-border dark:hover:border-white/10">
              <PlayCircle className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Right Column: Curved Carousel */}
        <div
          className="relative h-[650px] w-full flex items-center justify-center perspective-[1000px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {categories.map((cat, index) => {
            const offset = getOffset(index);
            const absOffset = Math.abs(offset);
            const isActive = offset === 0;

            // Calculate transforms for the curve effect
            const translateX = offset * 140;
            const translateZ = absOffset * -130;
            const rotateY = offset * -15; // Negative to rotate inwards towards center

            // Opacity and Visibility logic
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
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-border/50 dark:border-white/10 shadow-2xl bg-card dark:bg-black group">
                  {/* Image Background */}
                  <div className="absolute inset-0">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/40 dark:from-black/40 via-transparent to-background/90 dark:to-black/90" />
                  </div>

                  {/* Top Badge: Clip Count */}
                  <div className="absolute top-4 right-4 bg-muted/50 dark:bg-white/10 backdrop-blur-md border border-border/50 dark:border-white/20 px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-white animate-pulse" />
                    <span className="text-xs font-bold text-foreground dark:text-white tracking-wide">{cat.count} Clips</span>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-7 transform transition-transform duration-500">
                    <div className="w-13 h-13 bg-muted/50 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-border/50 dark:border-white/10 text-foreground dark:text-white shadow-lg">
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground dark:text-white mb-1">{cat.label}</h3>
                    <p className="text-sm text-muted-foreground dark:text-slate-400 font-medium">{cat.description}</p>
                  </div>

                  {/* Hover Border Glow */}
                  <div className={`absolute inset-0 border-2 border-transparent transition-all duration-500 rounded-[2rem] ${isActive ? 'border-primary/20 dark:border-white/20' : 'group-hover:border-primary/20 dark:group-hover:border-white/20'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8 text-left border-t border-border/50 dark:border-white/5 pt-20">
        <div className="bg-muted/50 dark:bg-white/5 p-8 rounded-3xl shadow-sm border border-border/50 dark:border-white/5 hover:border-primary/30 dark:hover:border-white/20 hover:bg-muted dark:hover:bg-white/10 transition-all group">
          <div className="w-14 h-14 bg-primary/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-primary dark:text-white group-hover:bg-primary dark:group-hover:bg-white group-hover:text-primary-foreground dark:group-hover:text-black transition-colors">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-foreground dark:text-white mb-3">Smart Context Search</h3>
          <p className="text-muted-foreground dark:text-slate-400 leading-relaxed">
            Find specific words or phrases and see them used in thousands of different contexts instantly.
          </p>
        </div>

        <div className="bg-muted/50 dark:bg-white/5 p-8 rounded-3xl shadow-sm border border-border/50 dark:border-white/5 hover:border-primary/30 dark:hover:border-white/20 hover:bg-muted dark:hover:bg-white/10 transition-all group">
          <div className="w-14 h-14 bg-primary/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-primary dark:text-white group-hover:bg-primary dark:group-hover:bg-white group-hover:text-primary-foreground dark:group-hover:text-black transition-colors">
            <PlayCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-foreground dark:text-white mb-3">Native Audio Clips</h3>
          <p className="text-muted-foreground dark:text-slate-400 leading-relaxed">
            Listen to native speakers in real situations. Perfect your accent by mimicking real usage.
          </p>
        </div>

        <div className="bg-muted/50 dark:bg-white/5 p-8 rounded-3xl shadow-sm border border-border/50 dark:border-white/5 hover:border-primary/30 dark:hover:border-white/20 hover:bg-muted dark:hover:bg-white/10 transition-all group">
          <div className="w-14 h-14 bg-primary/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-primary dark:text-white group-hover:bg-primary dark:group-hover:bg-white group-hover:text-primary-foreground dark:group-hover:text-black transition-colors">
            <Globe className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-foreground dark:text-white mb-3">Global Content Library</h3>
          <p className="text-muted-foreground dark:text-slate-400 leading-relaxed">
            Access a massive library of clips from vlogs, news, movies, and talks from around the world.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
