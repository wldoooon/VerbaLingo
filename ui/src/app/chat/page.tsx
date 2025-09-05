'use client';

import { AiCompletion } from '@/components/ai-completion';

export default function ChatPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <AiCompletion query={"spider"}/>
    </div>
  );
}
