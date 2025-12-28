"use client";

import { useState, useEffect } from "react";

export interface Suggestion {
  word: string;
  score: number;
}

export function useDatamuse(query: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Determine if we should fetch
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.datamuse.com/sug?s=${encodeURIComponent(trimmedQuery)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = await response.json();
        // Limit to top 5 suggestions
        setSuggestions(data.slice(0, 5));
      } catch (err) {
        console.error("Datamuse API error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchSuggestions, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return { suggestions, isLoading, error };
}
