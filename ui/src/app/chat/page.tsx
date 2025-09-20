'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpFromDot } from 'lucide-react';
import { TextGif } from '@/components/comm/GifText';
import { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton 
} from '@/components/ai-elements/conversation';

// Mock AI responses
const aiResponses = [
  "That's a great question! I'd be happy to help you with that. Can you provide more details?",
  "I understand what you're looking for. Let me break this down for you step by step.",
  "Excellent! Here's what I recommend based on your question...",
  "That's an interesting point. From my experience helping language learners, I suggest...",
  "Perfect! Let me guide you through this. First, let's start with the basics...",
  "I can definitely help you with that! Here are some practical tips you can try right away...",
  "Good question! This is actually a common challenge for many English learners. Here's how to approach it...",
  "I'm glad you asked! This is an important aspect of language learning. Let me explain..."
];

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getRandomAIResponse = () => {
    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: getCurrentTime()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: getRandomAIResponse(),
        timestamp: getCurrentTime()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    No messages yet
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Start a conversation by typing a message below
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
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
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        
        {/* Input at bottom */}
        <div className="mt-4 relative">
          <Input 
            placeholder="Ask Anything here..." 
            className="w-full rounded-3xl h-12 pr-14"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            size="sm" 
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            <ArrowUpFromDot className="h-12 w-12" />
          </Button>
        </div>
      </div>
    </div>
  );
}
