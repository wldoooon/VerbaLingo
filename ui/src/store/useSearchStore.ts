import { create } from "zustand";

interface SearchState {
  query: string;
  language: string;
  category: string | null;
  setQuery: (query: string) => void;
  setLanguage: (language: string) => void;
  setCategory: (category: string | null) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  language: "english",
  category: null,
  setQuery: (query) => set({ query }),
  setLanguage: (language) => set({ language }),
  setCategory: (category) => set({ category }),
}));
