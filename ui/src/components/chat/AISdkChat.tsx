'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

/**
 * AISdkChat
 * - Uses the DefaultChatTransport configured to the local Next.js API route
 * - If the `ai-sdk-ollama` provider is available it can be used server-side
 *   in the Next.js route; the client transport remains the same (/api/v1/chat).
 */
export default function AISdkChat() {
  const [input, setInput] = useState('');

  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/v1/chat',
    }),
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">No messages yet</p>
              <p className="text-muted-foreground text-xs">Start a conversation by typing a message below</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {message.parts.map((part, partIndex) => {
                    if (part.type === 'text') {
                      return (
                        <div key={`${message.id}-text-${partIndex}`} className="text-sm">
                          {part.text}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="p-4 border-t border-border/50">
        <input
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Type your message..."
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
          onKeyDown={async event => {
            if (event.key === 'Enter' && input.trim()) {
              // sendMessage accepts the ai-sdk message format
              sendMessage({ parts: [{ type: 'text', text: input }] });
              setInput('');
            }
          }}
        />
      </div>
    </div>
  );
}