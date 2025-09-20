'use client';

import { TextGif } from '@/components/comm/GifText';
import { ChatInterface } from '@/components/chat';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border rounded-2xl shadow-sm h-150 w-110 flex flex-col overflow-hidden">
        {/* Fixed Header with GifText */}
        <div className="flex-shrink-0 flex justify-center p-6 pb-4 bg-card z-10 border-b border-border/50">
          <TextGif
            gifUrl="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHF5Y3JnMTg0ZDB0NGM4MDI1c2djZGxtem45eHF3ZTdnZ3Z2bTJhMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PnTG1y3MMveevPpe13/giphy.gif"
            text="How Can i help you Today ?"
            size="lg"
            weight="bold"
          />
        </div>
        
        {/* Scrollable Chat Interface */}
        <div className="flex-1 min-h-0 p-6 pt-4">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
