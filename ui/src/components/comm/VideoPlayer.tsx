'use client';

import YouTube from 'react-youtube';
import { useAppContext } from '@/context/AppContext';

export default function VideoPlayer() {
  const { state, dispatch } = useAppContext();
  const { playlist, currentVideoIndex, isMuted } = state;

  const currentVideoId = playlist[currentVideoIndex];

  const handleNextVideo = () => {
    dispatch({ type: 'NEXT_VIDEO' });
  };

  const handleMute = () => {
    dispatch({ type: 'SET_MUTED', payload: true });
  };

  const handleUnMute = () => {
    dispatch({ type: 'SET_MUTED', payload: false });
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      mute: isMuted ? 1 : 0,
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
    </div>
  );
}
