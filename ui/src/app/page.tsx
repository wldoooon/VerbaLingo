'use client';

import { useState } from 'react';
import { AiCompletion } from '@/components/ai-completion';
import SearchBar from '@/components/comm/SearchBar';
import VideoPlayer from '@/components/comm/VideoPlayer';
import { FloatingAiAssistant } from '@/components/glowing-ai-chat-assistant';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-background p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground">VerbaLingo</h1>
          <p className="mt-2 text-lg text-muted-foreground">Your gateway to mastering languages.</p>
        </div>
        
        {/* Existing Search Functionality */}
        <SearchBar />
        <VideoPlayer />

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-sm text-muted-foreground">OR</span>
          </div>
        </div>

        {/* New AI Completion Component */}
        <AiCompletion />
      </div>
      <FloatingAiAssistant />
    </main>
  );
}
