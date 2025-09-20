'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpFromDot } from 'lucide-react';
import { TextGif } from '@/components/comm/GifText';
import { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton 
} from '@/components/ai-elements/conversation';

// Mock conversation data
const mockMessages = [
  {
    id: 1,
    type: 'user',
    content: 'Hello! Can you help me learn English?',
    timestamp: '10:30 AM'
  },
  {
    id: 2,
    type: 'ai',
    content: 'Hello! I\'d be happy to help you learn English. What specific area would you like to focus on? Grammar, vocabulary, pronunciation, or conversation practice?',
    timestamp: '10:30 AM'
  },
  {
    id: 3,
    type: 'user',
    content: 'I want to improve my pronunciation. Can you help with that?',
    timestamp: '10:32 AM'
  },
  {
    id: 4,
    type: 'ai',
    content: 'Absolutely! Pronunciation is crucial for effective communication. I can help you with phonetics, stress patterns, and intonation. Would you like to start with some specific words or sounds that you find challenging?',
    timestamp: '10:32 AM'
  },
  {
    id: 5,
    type: 'user',
    content: 'Yes, I have trouble with the "th" sound.',
    timestamp: '10:34 AM'
  },
  {
    id: 6,
    type: 'ai',
    content: 'The "th" sound is one of the most challenging for English learners! There are actually two types: voiced /ð/ (as in "this") and voiceless /θ/ (as in "think"). Try placing your tongue between your teeth and blow air gently. Practice with words like "think", "thank", "this", and "that".',
    timestamp: '10:34 AM'
  }
];

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border rounded-2xl shadow-sm h-150 w-110 p-6 flex flex-col justify-between">
        {/* Header with GifText */}
        <div className="flex justify-center mb-6">
          <TextGif
            gifUrl="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHF5Y3JnMTg0ZDB0NGM4MDI1c2djZGxtem45eHF3ZTdnZ3Z2bTJhMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PnTG1y3MMveevPpe13/giphy.gif"
            text="How Can i help you Today ?"
            size="lg"
            weight="bold"
          />
        </div>
        
        {/* Main content area - Conversation */}
        <Conversation className="flex-1 mb-4">
          <ConversationContent>
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        
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
