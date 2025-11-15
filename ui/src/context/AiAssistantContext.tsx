"use client";

import { createContext, useContext, useRef } from "react";

interface AiAssistantContextValue {
  lastPromptRequestRef: React.MutableRefObject<string | null>;
  requestPrompt: (prompt: string) => void;
}

const AiAssistantContext = createContext<AiAssistantContextValue | undefined>(
  undefined,
);

export const AiAssistantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const lastPromptRequestRef = useRef<string | null>(null);

  const requestPrompt = (prompt: string) => {
    const clean = prompt.trim();
    if (!clean) return;
    lastPromptRequestRef.current = clean;
  };

  return (
    <AiAssistantContext.Provider value={{ lastPromptRequestRef, requestPrompt }}>
      {children}
    </AiAssistantContext.Provider>
  );
};

export const useAiAssistant = () => {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error("useAiAssistant must be used within AiAssistantProvider");
  }
  return ctx;
};
