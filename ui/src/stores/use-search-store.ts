import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  query: string;
  language: string;
  category: string | null;
  subCategory: string | null;
  lastAggregations: Record<string, number> | null;
  translationLang: string | null;
  setQuery: (query: string) => void;
  setLanguage: (language: string) => void;
  setCategory: (category: string | null) => void;
  setSubCategory: (subCategory: string | null) => void;
  setLastAggregations: (aggs: Record<string, number> | null) => void;
  setTranslationLang: (lang: string | null) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: "",
      language: "English",
      category: null,
      subCategory: null,
      lastAggregations: null,
      translationLang: null,
      setQuery: (query) =>
        set({ query, subCategory: null, lastAggregations: null }),
      setLanguage: (language) => set({ language }),
      setCategory: (category) =>
        set({ category, subCategory: null, lastAggregations: null }),
      setSubCategory: (subCategory) => set({ subCategory }),
      setLastAggregations: (lastAggregations) => set({ lastAggregations }),
      setTranslationLang: (translationLang) => set({ translationLang }),
    }),
    {
      name: "search-preferences",
    }
  )
);
