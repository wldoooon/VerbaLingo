'use client';

import { AiCompletion } from '@/components/ai-completion';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <AiCompletion />
      </div>
    </div>
  );
}
