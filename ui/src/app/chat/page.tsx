'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpFromDot } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border rounded-2xl shadow-sm h-150 w-110 p-6 flex flex-col justify-between">
        {/* Empty card content */}
        <div className="flex-1">
          {/* Main content area */}
        </div>
        
        {/* Input at bottom */}
        <div className="mt-4 relative">
          <Input 
            placeholder="Ask Anything here..." 
            className="w-full rounded-3xl h-12 pr-14"
          />
          <Button size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0">
            <ArrowUpFromDot className="h-12 w-12" />
          </Button>
        </div>
      </div>
    </div>
  );
}
