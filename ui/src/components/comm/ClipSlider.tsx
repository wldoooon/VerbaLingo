'use client';

import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

type Clip = {
  video_id: string;
  start?: number;
  start_time?: number;
  title?: string;
};

function getStart(clip: Clip) {
  if (typeof clip?.start === 'number') return clip.start;
  if (typeof clip?.start_time === 'number') return clip.start_time;
  return 0;
}

function fmt(t: number) {
  const s = Math.max(0, Math.floor(t));
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${m}:${ss}`;
}

function thumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

export default function ClipSlider({
  clips,
  currentIndex,
  onSelect,
}: {
  clips: Clip[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  const [viewportRef, embla] = useEmblaCarousel({
    loop: false,
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  useEffect(() => {
    if (!embla) return;
    embla.reInit();
  }, [embla, clips]);

  useEffect(() => {
    if (!embla) return;
    embla.scrollTo(currentIndex, true);
  }, [embla, currentIndex]);

  if (!clips?.length) return null;

  return (
    <div className="embla mt-3">
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex">
          {clips.map((c, i) => {
            const active = i === currentIndex;
            const t = getStart(c);
            return (
              <button
                key={`${c.video_id}-${i}-${t}`}
                onClick={() => onSelect(i)}
                className="group relative mr-3 flex-[0_0_auto] basis-[150px] md:basis-[180px] focus:outline-none"
                aria-current={active ? 'true' : 'false'}
              >
                <div
                  className={[
                    'aspect-video w-full overflow-hidden rounded-xl',
                    'ring-1 ring-black/10 dark:ring-white/10',
                    active ? 'outline outline-2 outline-sky-500' : '',
                  ].join(' ')}
                >
                  <img
                    src={thumb(c.video_id)}
                    alt={c.title ?? 'clip'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="pointer-events-none absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-mono text-white">
                  {fmt(t)}
                </div>
                {active && (
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-sky-500/70" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}