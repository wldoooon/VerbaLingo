"use client";

import React from "react";
import { EmblaOptionsType } from 'embla-carousel';
import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Carousel, {
  Slider,
  SliderContainer,
  SliderDotButton,
  SliderNextButton,
  SliderPrevButton,
} from '@/components/ui/carousel';

interface DiscoverySectionProps {
  onVideoSelect?: (video: any) => void;
  className?: string;
}

export function DiscoverySection({ onVideoSelect, className }: DiscoverySectionProps) {
  const OPTIONS: EmblaOptionsType = {
    loop: true,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps"
  };

  return (
    <div className={cn("w-full", className)}>

      {/* Carousel */}
      <div className="relative">
        <Carousel options={OPTIONS} className="w-full" isAutoPlay={true}>
          <SliderContainer>
            <Slider className='w-full'>
              <div className='relative md:h-[600px] sm:h-full h-[400px] w-full rounded-lg overflow-hidden'>
                {/* Background Image */}
                <div
                  className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                  style={{
                    backgroundImage: `url('/MoviesCollection.jpg')`
                  }}
                />

                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent' />

                {/* Content Card - Premium Dark Style */}
                <div className='absolute top-8 left-8 bg-zinc-950/90 border border-white/10 p-8 rounded-2xl shadow-2xl max-w-md backdrop-blur-sm'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <div>
                      <h3 className='text-white font-bold text-2xl tracking-tight'>Movies & Cinema</h3>
                      <p className='text-zinc-400 text-sm font-medium uppercase tracking-wider'>Entertainment</p>
                    </div>
                  </div>

                  <p className='text-zinc-300 text-base mb-6 leading-relaxed'>
                    Master English through popular movies, TV shows, and cinematic dialogues.
                    Perfect for intermediate learners.
                  </p>

                  <div className='flex items-center justify-between pt-4 border-t border-white/5'>
                    <div className='flex items-center gap-4 text-zinc-400 text-sm'>
                      <span className="flex items-center gap-1"><span className="text-white font-semibold">240+</span> videos</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><span className="text-yellow-500">★</span> 4.8</span>
                    </div>
                    <div className='bg-primary/20 px-3 py-1 rounded-md'>
                      <span className='text-primary text-xs font-bold uppercase tracking-wide'>Popular</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Left Stats Card - Premium Dark Style */}
                <div className='absolute bottom-8 left-8'>
                  <div className='bg-zinc-950/90 border border-white/10 rounded-xl p-4 min-w-[340px] shadow-xl backdrop-blur-sm'>
                    <div className='flex items-center text-white'>
                      <div className='flex-1 text-center'>
                        <p className='text-lg font-bold text-white'>184k</p>
                        <p className='text-[10px] uppercase tracking-wider text-zinc-500 font-semibold'>Clips</p>
                      </div>

                      <div className='w-px h-8 bg-white/10 mx-4'></div>

                      <div className='flex-1 text-center'>
                        <p className='text-lg font-bold text-white'>85</p>
                        <p className='text-[10px] uppercase tracking-wider text-zinc-500 font-semibold'>Genres</p>
                      </div>

                      <div className='w-px h-8 bg-white/10 mx-4'></div>

                      <div className='flex-1 text-center'>
                        <p className='text-lg font-bold text-yellow-500'>4.8</p>
                        <p className='text-[10px] uppercase tracking-wider text-zinc-500 font-semibold'>Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Slider>
            <Slider className='w-full'>
              <div className='relative md:h-[600px] sm:h-full h-[400px] w-full rounded-lg overflow-hidden'>
                {/* Background Image */}
                <div
                  className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                  style={{
                    backgroundImage: `url('/PodcastCollection.png')`
                  }}
                />

                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent' />

                {/* Content Card - Premium Dark Style */}
                <div className='absolute top-8 left-8 bg-zinc-950/90 border border-white/10 p-8 rounded-2xl shadow-2xl max-w-md backdrop-blur-sm'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className="h-8 w-1 bg-accent rounded-full"></div>
                    <div>
                      <h3 className='text-white font-bold text-2xl tracking-tight'>Podcasts</h3>
                      <p className='text-zinc-400 text-sm font-medium uppercase tracking-wider'>Conversations</p>
                    </div>
                  </div>

                  <p className='text-zinc-300 text-base mb-6 leading-relaxed'>
                    Improve listening skills with engaging podcasts, interviews, and educational talks.
                    Perfect for advanced learners.
                  </p>

                  <div className='flex items-center justify-between pt-4 border-t border-white/5'>
                    <div className='flex items-center gap-4 text-zinc-400 text-sm'>
                      <span className="flex items-center gap-1"><span className="text-white font-semibold">180+</span> eps</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><span className="text-yellow-500">★</span> 4.9</span>
                    </div>
                    <div className='bg-accent/20 px-3 py-1 rounded-md'>
                      <span className='text-accent text-xs font-bold uppercase tracking-wide'>Trending</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Left Stats Card - Premium Dark Style */}
                <div className='absolute bottom-8 left-8'>
                  <div className='bg-zinc-950/90 border border-white/10 rounded-xl p-4 min-w-[340px] shadow-xl backdrop-blur-sm'>
                    <div className='flex items-center text-white'>
                      <div className='flex-1 text-center'>
                        <p className='text-lg font-bold text-white'>156k</p>
                        <p className='text-[10px] uppercase tracking-wider text-zinc-500 font-semibold'>Episodes</p>
                      </div>

                      <div className='w-px h-8 bg-white/10 mx-4'></div>

                      <div className='flex-1 text-center'>
                        <p className='text-lg font-bold text-white'>24</p>
                        <p className='text-[10px] uppercase tracking-wider text-zinc-500 font-semibold'>Categories</p>
                      </div>

                      <div className='w-px h-8 bg-white/10 mx-4'></div>

                      <div className='flex-1 text-center'>
                        <p className='text-lg font-bold text-yellow-500'>4.9</p>
                        <p className='text-[10px] uppercase tracking-wider text-zinc-500 font-semibold'>Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Slider>
            <Slider className='w-full'>
              <div className='bg-yellow-500 md:h-[600px] sm:h-full h-[400px] w-full rounded-lg'></div>
            </Slider>
            <Slider className='w-full'>
              <div className='bg-red-500 md:h-[600px] sm:h-full h-[400px] w-full rounded-lg'></div>
            </Slider>
            <Slider className='w-full'>
              <div className='bg-purple-500 md:h-[600px] sm:h-full h-[400px] w-full rounded-lg'></div>
            </Slider>
            <Slider className='w-full'>
              <div className='bg-indigo-500 md:h-[600px] sm:h-full h-[400px] w-full rounded-lg'></div>
            </Slider>
          </SliderContainer>

          {/* Navigation Buttons */}
          <SliderPrevButton className='absolute top-[50%] p-2 border-2 rounded-full left-4 bg-white/25 dark:bg-black/25 dark:border-white backdrop-blur-sm text-primary disabled:opacity-20'>
            <ChevronLeft className='w-8 h-8' />
          </SliderPrevButton>

          <SliderNextButton className='absolute right-4 p-2 border-2 rounded-full top-[50%] bg-white/25 dark:bg-black/25 dark:border-white backdrop-blur-sm text-primary disabled:opacity-20'>
            <ChevronRight className='w-8 h-8' />
          </SliderNextButton>

          {/* Dot Navigation */}
          <div className='flex justify-center py-2'>
            <SliderDotButton />
          </div>
        </Carousel>
      </div>
    </div>
  );
}