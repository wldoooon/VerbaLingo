"use client";

import { useQuery } from "@tanstack/react-query";
import { Clips, TranscriptResponse, SearchResponse } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";

type TranslateResponse = {
  original: string;
  translated: string;
  source: string;
  target: string;
};

const fetchSearchResults = async (
  query: string,
  language: string,
  category: string | null,
  subCategory: string | null
) => {
  const params = new URLSearchParams();
  params.append("q", query);
  params.append("language", language);
  if (category) {
    params.append("category", category);
  }
  if (subCategory) {
    params.append("sub_category", subCategory);
  }

  const response = await apiClient.get<SearchResponse>(`/search?${params.toString()}`);
  return response.data;
};

export const useSearch = (
  query: string,
  language: string = "english",
  category: string | null = null,
  subCategory: string | null = null
) => {
  return useQuery<SearchResponse, Error>({
    queryKey: ["search", query, language, category, subCategory],
    queryFn: () => fetchSearchResults(query, language, category, subCategory),
    enabled: !!query && query.trim().length > 0, // Auto-fetch if query exists
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch just because I clicked the window
  });
};

const fetchTranscript = async (
  videoId: string,
  language: string,
  centerPosition?: number
) => {
  const params = new URLSearchParams();
  params.append("language", language);
  if (centerPosition !== undefined) {
    params.append("center_position", centerPosition.toString());
  }
  const response = await apiClient.get<TranscriptResponse>(`/videos/${videoId}/transcript?${params.toString()}`);
  return response.data;
};

export const useTranscript = (
  videoId: string,
  language: string = "english",
  centerPosition?: number
) => {
  return useQuery<TranscriptResponse, Error>({
    queryKey: ["transcript", videoId, language, centerPosition],
    queryFn: () => fetchTranscript(videoId, language, centerPosition),
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

  const response = await apiClient.get<TranslateResponse>(`/translate?${params.toString()}`);
  return response.data;
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