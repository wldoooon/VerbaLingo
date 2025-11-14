"use client";

import { createContext, useContext, useMemo, useRef } from "react";
import { useCompletion } from "@ai-sdk/react";

interface AiAssistantContextValue {
  completion: string;
  isLoading: boolean;
  error: Error | null;
  runPrompt: (prompt: string) => void;
}

const AiAssistantContext = createContext<AiAssistantContextValue | undefined>(
  undefined,
);

export const AiAssistantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/v1/completion",
  });
  const lastPromptRef = useRef<string>("");

  const value = useMemo<AiAssistantContextValue>(
    () => ({
      completion,
      isLoading,
      error: (error as Error) ?? null,
      runPrompt: (prompt: string) => {
        const clean = prompt.trim();
        if (!clean) return;
        lastPromptRef.current = clean;
        complete(clean);
      },
    }),
    [completion, isLoading, error, complete],
  );

  return (
    <AiAssistantContext.Provider value={value}>
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
