'use client';

import dynamic from 'next/dynamic';
const YouTube = dynamic(() => import('react-youtube'), { ssr: false });
import { useEffect, useMemo, useState } from 'react';
import { usePlayerContext } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import ClipSlider from '@/components/comm/ClipSlider';

function getClipStart(clip: any): number {
  if (!clip) return 0;
  if (typeof clip.start === 'number') return clip.start;
  if (typeof clip.start_time === 'number') return clip.start_time;
  return 0;
}

function thumb(videoId?: string) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

export default function VideoPlayer() {
  const { state, dispatch } = usePlayerContext();
  const { playlist, currentVideoIndex, isMuted } = state;

  const currentClip = playlist[currentVideoIndex];
  const currentVideoId = currentClip?.video_id;

  const rawStart = getClipStart(currentClip);
  const startSec = Math.max(0, Math.floor(rawStart));
  const uniqueKey = `${currentVideoId}-${currentVideoIndex}-${rawStart}`;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [uniqueKey]);

  useEffect(() => {
    const ids = [
      playlist[currentVideoIndex + 1]?.video_id,
      playlist[currentVideoIndex - 1]?.video_id,
    ].filter(Boolean) as string[];
    ids.forEach((id) => {
      const img = new Image();
      img.src = thumb(id);
    });
  }, [playlist, currentVideoIndex]);

  const handleMute = () => dispatch({ type: 'SET_MUTED', payload: true });
  const handleUnMute = () => dispatch({ type: 'SET_MUTED', payload: false });
  const handleNextVideo = () => dispatch({ type: 'NEXT_VIDEO' });
  const handlePrevVideo = () => dispatch({ type: 'PREV_VIDEO' });

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      mute: isMuted ? 1 : 0,
      start: startSec,
      modestbranding: 1,
      rel: 0,
    },
    loading: 'eager',
  } as const;

  const heroClass =
    'relative w-full h-[58vh] md:h-[66vh] lg:h-[74vh] overflow-hidden rounded-2xl';

  return (
    <div className="mt-8 w-full max-w-7xl mx-auto">
      {currentVideoId ? (
        <div className={heroClass}>
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="absolute inset-0 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md overflow-hidden">
              {currentVideoId && (
                <img
                  src={thumb(currentVideoId)}
                  alt=""
                  decoding="async"
                  className="h-full w-full object-cover scale-105 blur-sm"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_1.6s_infinite]"
                   style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>

          <div className={`absolute inset-0 transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <YouTube
              key={uniqueKey}
              videoId={currentVideoId}
              opts={opts}
              onReady={(e) => {
                try { e.target.seekTo(rawStart, true); } catch {}
                setReady(true);
              }}
              onEnd={handleNextVideo}
              onMute={handleMute}
              onUnMute={handleUnMute}
              className="absolute inset-0 h-full w-full"
            />
          </div>

          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      ) : (
        <div className={`${heroClass} flex items-center justify-center bg-black/20`}>
          <span className="text-white/80">Type a word to start</span>
        </div>
      )}

      <div className="mt-4 flex justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-white"
          onClick={handlePrevVideo}
          disabled={currentVideoIndex === 0}
          aria-label="Previous clip"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-white"
          onClick={handleNextVideo}
          disabled={currentVideoIndex === playlist.length - 1}
          aria-label="Next clip"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </Button>
      </div>

      <ClipSlider
        clips={playlist as any[]}
        currentIndex={currentVideoIndex}
        onSelect={(i) => dispatch({ type: 'SET_INDEX', payload: i })}
      />
    </div>
  );
}
