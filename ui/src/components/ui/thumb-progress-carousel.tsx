'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

export interface CarouselItemData {
  id: string;
  image: string;
  title: string;
}

export interface ThumbProgressCarouselProps {
  /**
   * The array of slides to display.
   */
  items: CarouselItemData[];
  /**
   * Auto-play interval duration in milliseconds.
   * @default 5000
   */
  interval?: number;
}

/**
 * A carousel component featuring auto-play functionality and a thumbnail navigation
 * strip that visualizes the remaining time for the current slide.
 */
export function ThumbProgressCarousel({
  items,
  interval = 5000,
}: ThumbProgressCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      setProgress(0);
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || isPaused) return;

    const tickRate = 50;
    const step = 100 / (interval / tickRate);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + step;
      });
    }, tickRate);

    return () => clearInterval(timer);
  }, [api, isPaused, interval]);

  React.useEffect(() => {
    if (api && progress >= 100) {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }
  }, [api, progress]);

  const onThumbClick = (index: number) => {
    if (!api) return;
    api.scrollTo(index);
  };

  return (
    <div
      className='relative w-full h-full group overflow-hidden bg-black'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Carousel setApi={setApi} className='w-full h-full' opts={{ loop: true }}>
        <CarouselContent className='h-full m-0'>
          {items.map((item) => (
            <CarouselItem key={item.id} className='relative w-full h-full p-0 min-h-[450px]'>
              <div className='absolute inset-0 overflow-hidden'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover transition-transform duration-700 ease-in-out group-hover:scale-105'
                  priority
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
