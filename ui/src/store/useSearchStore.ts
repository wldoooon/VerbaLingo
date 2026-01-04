import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  query: string;
  language: string;
  category: string | null;
  subCategory: string | null;
  lastAggregations: Record<string, number> | null;
  setQuery: (query: string) => void;
  setLanguage: (language: string) => void;
  setCategory: (category: string | null) => void;
  setSubCategory: (subCategory: string | null) => void;
  setLastAggregations: (aggs: Record<string, number> | null) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: "",
      language: "English",
      category: null,
      subCategory: null,
      lastAggregations: null,
      setQuery: (query) =>
        set({ query, subCategory: null, lastAggregations: null }), // Reset everything on new query
      setLanguage: (language) => set({ language }),
      setCategory: (category) =>
        set({ category, subCategory: null, lastAggregations: null }), // Reset when category changes
      setSubCategory: (subCategory) => set({ subCategory }),
      setLastAggregations: (lastAggregations) => set({ lastAggregations }),
    }),
    {
      name: "search-preferences",
    }
  )
);
