'use client';

import { Input } from '@/components/ui/input';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border rounded-2xl shadow-sm h-150 w-110 p-6 flex flex-col justify-between">
        {/* Empty card content */}
        <div className="flex-1">
          {/* Main content area */}
        </div>
        
        {/* Input at bottom */}
        <div className="mt-4">
          <Input 
            placeholder="Ask Anything here..." 
            className="w-full rounded-3xl"
          />
        </div>
      </div>
    </div>
  );
}
