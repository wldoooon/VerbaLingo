"use client";

import { useQuery } from "@tanstack/react-query";
import { Clips, TranscriptResponse } from "@/lib/types";

type TranslateResponse = {
  original: string;
  translated: string;
  source: string;
  target: string;
};

const fetchSearchResults = async (query: string, category: string | null) => {
  const params = new URLSearchParams();
  params.append("q", query);
  if (category) {
    params.append("category", category);
  }

  const url = `/api/v1/search?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
};

export const useSearch = (query: string, category: string | null) => {
  return useQuery<{ total: number; hits: Clips[] }, Error>({
    queryKey: ["search", query, category],
    queryFn: () => fetchSearchResults(query, category),
    enabled: !!query && query.trim().length > 0, // Auto-fetch if query exists
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch just because I clicked the window
  });
};

const fetchTranscript = async (videoId: string, centerPosition?: number) => {
  const params = new URLSearchParams();
  if (centerPosition !== undefined) {
    params.append("center_position", centerPosition.toString());
  }
  const url = `/api/v1/videos/${videoId}/transcript?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const useTranscript = (videoId: string, centerPosition?: number) => {
  return useQuery<TranscriptResponse, Error>({
    queryKey: ["transcript", videoId, centerPosition],
    queryFn: () => fetchTranscript(videoId, centerPosition),
    enabled: !!videoId,
  });
};

// Translate a single text using the backend proxy (FastAPI -> LibreTranslate)
const fetchTranslate = async (
  text: string,
  source: string = "en",
  target: string = "ar"
) => {
  const params = new URLSearchParams();
  params.append("text", text);
  params.append("source", source);
  params.append("target", target);

  const response = await fetch(`/api/v1/translate?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to translate text");
  }
  const data: TranslateResponse = await response.json();
  return data;
};

export const useTranslate = (
  text: string,
  source: string = "en",
  target: string = "ar"
) => {
  return useQuery<TranslateResponse, Error>({
    queryKey: ["translate", text, source, target],
    queryFn: () => fetchTranslate(text, source, target),
    enabled: !!text && text.trim().length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 6, // 6 hours
  });
};
