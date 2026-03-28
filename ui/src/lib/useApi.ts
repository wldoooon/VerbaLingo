"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Clips, TranscriptResponse, SearchResponse } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";

type TranslateResponse = {
  original: string;
  translated: string;
  source: string;
  target: string;
};

export const fetchSearchResults = async (
  query: string,
  language: string,
  category: string | null,
  subCategory: string | null,
  pageParam: number = 1,
) => {
  const params = new URLSearchParams();
  params.append("q", query);
  params.append("language", language);
  params.append("page", pageParam.toString());
  if (category) {
    params.append("category", category);
  }
  if (subCategory) {
    params.append("sub_category", subCategory);
  }

  const t0 = performance.now();
  const response = await apiClient.get<SearchResponse>(
    `/api/v1/search?${params.toString()}`,
  );
  const ms = Math.round(performance.now() - t0);
  console.log(`[PERF] search API  q="${query}" page=${pageParam}  → ${ms}ms  hits=${response.data?.hits?.length ?? 0}  total=${response.data?.total ?? 0}`);
  return response.data;
};

export const useSearch = (
  query: string,
  language: string = "english",
  category: string | null = null,
  subCategory: string | null = null,
) => {
  return useQuery<SearchResponse, Error>({
    queryKey: ["search", query, language, category, subCategory],
    queryFn: () =>
      fetchSearchResults(query, language, category, subCategory, 1),
    enabled: !!query && query.trim().length > 0, // Auto-fetch if query exists
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch just because I clicked the window
  });
};

export const useInfiniteSearch = (
  query: string,
  language: string = "english",
  category: string | null = null,
  subCategory: string | null = null,
) => {
  return useInfiniteQuery<SearchResponse, Error>({
    queryKey: ["searchInfinite", query, language, category, subCategory],
    queryFn: ({ pageParam = 1 }) =>
      fetchSearchResults(
        query,
        language,
        category,
        subCategory,
        pageParam as number,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.hits) return undefined;
      
      const totalCollected = allPages.reduce((acc, page) => acc + page.hits.length, 0);
      
      // If we haven't reached the total yet, there's more to fetch
      if (totalCollected < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const fetchTranscript = async (
  videoId: string,
  language: string,
  centerPosition?: number,
) => {
  const params = new URLSearchParams();
  params.append("language", language);
  if (centerPosition !== undefined) {
    params.append("center_position", centerPosition.toString());
  }
  const t0 = performance.now();
  const response = await apiClient.get<TranscriptResponse>(
    `/api/v1/videos/${videoId}/transcript?${params.toString()}`,
  );
  const ms = Math.round(performance.now() - t0);
  console.log(`[PERF] transcript  video=${videoId}  → ${ms}ms  sentences=${response.data?.sentences?.length ?? 0}`);
  return response.data;
};

export const useTranscript = (
  videoId: string,
  language: string = "english",
  centerPosition?: number,
) => {
  return useQuery<TranscriptResponse, Error>({
    queryKey: ["transcript", videoId, language, centerPosition],
    queryFn: () => fetchTranscript(videoId, language, centerPosition),
    enabled: !!videoId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to prefetch transcripts for the next few clips in the playlist
 */
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useTranscriptPrefetch = (
  playlist: any[],
  currentIndex: number,
  language: string = "english"
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!playlist || playlist.length === 0) return;

    // Prefetch current + next 2 clips (i=0 = current clip, so AudioCard gets a cache hit)
    const prefetchCount = 2;
    for (let i = 0; i <= prefetchCount; i++) {
        const nextIndex = currentIndex + i;
        if (nextIndex < playlist.length) {
            const nextClip = playlist[nextIndex];
            
            queryClient.prefetchQuery({
                queryKey: ["transcript", nextClip.video_id, language, nextClip.position],
                queryFn: () => fetchTranscript(nextClip.video_id, language, nextClip.position),
                staleTime: 1000 * 60 * 5, // 5 minutes
            });
        }
    }
  }, [currentIndex, playlist, language, queryClient]);
};

// Translate a single text using the backend proxy (FastAPI -> LibreTranslate)
const fetchTranslate = async (
  text: string,
  source: string = "en",
  target: string = "ar",
) => {
  const params = new URLSearchParams();
  params.append("text", text);
  params.append("source", source);
  params.append("target", target);

  const response = await apiClient.get<TranslateResponse>(
    `/api/v1/translate?${params.toString()}`,
  );
  return response.data;
};

export const useTranslate = (
  text: string,
  source: string = "en",
  target: string = "ar",
) => {
  return useQuery<TranslateResponse, Error>({
    queryKey: ["translate", text, source, target],
    queryFn: () => fetchTranslate(text, source, target),
    enabled: !!text && text.trim().length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 6, // 6 hours
  });
};
