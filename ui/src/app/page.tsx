'use client';

import SearchBar from '@/components/comm/SearchBar';
import VideoPlayer from '@/components/comm/VideoPlayer';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-4xl font-bold text-center text-foreground">VerbaLingo</h1>
        <SearchBar />
      </div>
      <VideoPlayer />
    </main>
  );
}
