'use client';

import { useState } from 'react';
import { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton 
} from '@/components/ai-elements/conversation';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

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

export interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: content.trim(),
      timestamp: getCurrentTime()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
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

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Area - takes remaining space and handles its own scrolling */}
      <Conversation className="flex-1 min-h-0 mb-4">
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
                <MessageBubble key={message.id} message={message} />
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

      {/* Fixed Input Area */}
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};