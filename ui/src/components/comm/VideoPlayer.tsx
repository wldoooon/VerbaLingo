'use client';

import YouTube from 'react-youtube';
import { usePlayerContext } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';

export default function VideoPlayer() {
  const { state, dispatch } = usePlayerContext();
  const { playlist, currentVideoIndex, isMuted } = state;

  const currentClip = playlist[currentVideoIndex];
  const currentVideoId = currentClip?.video_id;
  const startTime = currentClip?.start_time;

  const handleMute = () => {
    dispatch({ type: 'SET_MUTED', payload: true });
  };

  const handleUnMute = () => {
    dispatch({ type: 'SET_MUTED', payload: false });
  };

  const handleNextVideo = () => {
    dispatch({ type: 'NEXT_VIDEO' });
  };

  const handlePrevVideo = () => {
    dispatch({ type: 'PREV_VIDEO' });
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      mute: isMuted ? 1 : 0,
      start: startTime,
    },
  };

  return (
    <div className="mt-8 w-full max-w-2xl">
      {currentVideoId && (
        <div className="relative pt-[56.25%]">
          <YouTube
            videoId={currentVideoId}
            opts={opts}
            onEnd={handleNextVideo}
            onMute={handleMute}
            onUnMute={handleUnMute}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      )}
      <div className="mt-4 flex justify-center space-x-4">
        <Button onClick={handlePrevVideo} disabled={currentVideoIndex === 0}>
          Previous
        </Button>
        <Button
          onClick={handleNextVideo}
          disabled={currentVideoIndex === playlist.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
