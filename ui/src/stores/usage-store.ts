"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FeatureUsage = {
  current: number;
  limit: number;
  remaining: number;
  reset_at?: string;
};

type UsageState = {
  usage: Record<string, FeatureUsage>;
  updateUsage: (feature: string, usage: Partial<FeatureUsage>) => void;
  setAllUsage: (usage: Record<string, FeatureUsage>) => void;
};

export const useUsageStore = create<UsageState>()(
  persist(
    (set) => ({
      usage: {},
      updateUsage: (feature, newUsage) =>
        set((state) => ({
          usage: {
            ...state.usage,
            [feature]: {
              ...(state.usage[feature] || { current: 0, limit: 0, remaining: 0 }),
              ...newUsage,
            },
          },
        })),
      setAllUsage: (usage) => set({ usage }),
    }),
    {
      name: "verbalingo-usage",
    }
  )
);
