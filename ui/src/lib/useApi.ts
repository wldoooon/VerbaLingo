"use client"

import { useQuery } from "@tanstack/react-query";
import { SearchHit, TranscriptLine } from "@/lib/types";

const fetchSearchResults = async (query: string, category: string | null) => {
  const params = new URLSearchParams();
  params.append("q", query);
  if (category) {
    params.append("category", category);
  }

  const response = await fetch(`/api/v1/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data.hits; 
};

export const useSearch = (query: string, category: string | null) => {
  return useQuery<SearchHit[], Error>({
    queryKey: ["search", query, category],
    queryFn: () => fetchSearchResults(query, category),
    enabled: false, 
  });
};

const fetchTranscript = async (videoId: string) => {
  const response = await fetch(`/api/v1/transcript/${videoId}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const useTranscript = (videoId: string) => {
  return useQuery<TranscriptLine[], Error>({
    queryKey: ["transcript", videoId],
    queryFn: () => fetchTranscript(videoId),
    enabled: !!videoId, 
  });
};