"use client";

import React from "react";
import { EmblaOptionsType } from 'embla-carousel';
import { 
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Globe,
  Play,
  Film,
  Tv
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
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Content Categories</h2>
            <p className="text-muted-foreground mt-1 text-base">Explore learning materials by type and genre</p>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <Carousel options={OPTIONS} className="w-full" isAutoPlay={true}>
          <SliderContainer>
            <Slider className='w-full'>
              <div className='relative md:h-[500px] sm:h-full h-[300px] w-full rounded-lg overflow-hidden'>
                {/* Background Image */}
                <div 
                  className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                  style={{
                    backgroundImage: `url('/MoviesCollection.jpg')`
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent' />
                
                {/* Content Card */}
                <div className='absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-sm'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div>
                      <h3 className='text-white font-bold text-xl'>Movies & Cinema</h3>
                      <p className='text-white/80 text-sm'>Learn through entertainment</p>
                    </div>
                  </div>
                  
                  <p className='text-white/90 text-sm mb-4 leading-relaxed'>
                    Master English through popular movies, TV shows, and cinematic dialogues. 
                    Perfect for intermediate learners.
                  </p>
                  
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 text-white/80 text-xs'>
                      <span>240+ videos</span>
                      <span>•</span>
                      <span>4.8★ rating</span>
                    </div>
                    <div className='bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full'>
                      <span className='text-white text-xs font-medium'>Popular</span>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Left Stats Card */}
                <div className='absolute bottom-6 left-6'>
                  <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 min-w-[310px]'>
                    <div className='flex items-center text-white'>
                      <div className='flex-1 text-center'>
                        <p className='text-base font-bold'>184.322</p>
                        <p className='text-xs text-white/80'>Video Clips</p>
                      </div>
                      
                      <div className='w-px h-6 bg-white/30 mx-3'></div>
                      
                      <div className='flex-1 text-center'>
                        <p className='text-base font-bold'>85</p>
                        <p className='text-xs text-white/80'>Genres</p>
                      </div>
                      
                      <div className='w-px h-6 bg-white/30 mx-3'></div>
                      
                      <div className='flex-1 text-center'>
                        <p className='text-base font-bold'>4.8★</p>
                        <p className='text-xs text-white/80'>Avg Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Slider>
            <Slider className='w-full'>
              <div className='relative md:h-[500px] sm:h-full h-[300px] w-full rounded-lg overflow-hidden'>
                {/* Background Image */}
                <div 
                  className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                  style={{
                    backgroundImage: `url('/PodcastCollection.png')`
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent' />
                
                {/* Content Card */}
                <div className='absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-sm'>
                  <div className='flex items-center gap-3 mb-3'>
                    
                    <div>
                      <h3 className='text-white font-bold text-xl'>Podcasts</h3>
                      <p className='text-white/80 text-sm'>Learn through conversations</p>
                    </div>
                  </div>
                  
                  <p className='text-white/90 text-sm mb-4 leading-relaxed'>
                    Improve listening skills with engaging podcasts, interviews, and educational talks. 
                    Perfect for advanced learners.
                  </p>
                  
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 text-white/80 text-xs'>
                      <span>180+ episodes</span>
                      <span>•</span>
                      <span>4.9★ rating</span>
                    </div>
                    <div className='bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full'>
                      <span className='text-white text-xs font-medium'>Trending</span>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Left Stats Card */}
                <div className='absolute bottom-6 left-6'>
                  <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 min-w-[310px]'>
                    <div className='flex items-center text-white'>
                      <div className='flex-1 text-center'>
                        <p className='text-base font-bold'>156.847</p>
                        <p className='text-xs text-white/80'>Episodes</p>
                      </div>
                      
                      <div className='w-px h-6 bg-white/30 mx-3'></div>
                      
                      <div className='flex-1 text-center'>
                        <p className='text-base font-bold'>24</p>
                        <p className='text-xs text-white/80'>Categories</p>
                      </div>
                      
                      <div className='w-px h-6 bg-white/30 mx-3'></div>
                      
                      <div className='flex-1 text-center'>
                        <p className='text-base font-bold'>4.9★</p>
                        <p className='text-xs text-white/80'>Avg Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Slider>
            <Slider className='w-full'>
              <div className='bg-yellow-500 md:h-[500px] sm:h-full h-[300px] w-full rounded-lg'></div>
            </Slider>
            <Slider className='w-full'>
              <div className='bg-red-500 md:h-[500px] sm:h-full h-[300px] w-full rounded-lg'></div>
            </Slider>
            <Slider className='w-full'>
              <div className='bg-purple-500 md:h-[500px] sm:h-full h-[300px] w-full rounded-lg'></div>
            </Slider>
            <Slider className='w-full'>
              <div className='bg-indigo-500 md:h-[500px] sm:h-full h-[300px] w-full rounded-lg'></div>
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

      {/* Quick Stats */}
      <div className="mt-8 flex items-center justify-center gap-12 text-base text-muted-foreground">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5" />
          <span className="font-medium">50+ trending videos</span>
        </div>
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5" />
          <span className="font-medium">12 languages available</span>
        </div>
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5" />
          <span className="font-medium">Updated daily</span>
        </div>
      </div>
    </div>
  );
}