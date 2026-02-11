"use client";

import { useUsageStore } from "@/stores/usage-store";
import { useMemo } from "react";

/**
 * Hook to check if a user is allowed to use a specific feature.
 * Expert Pattern: Centralizes entitlement logic.
 */
export function useEntitlements(feature: string) {
  const usageMap = useUsageStore((state) => state.usage);
  
  return useMemo(() => {
    const stats = usageMap[feature];
    
    // If we don't have stats yet, assume it's allowed but "loading"
    if (!stats) {
      return {
        hasAccess: true,
        current: 0,
        limit: -1,
        remaining: 999,
        isUnlimited: true,
        isLoaded: false,
      };
    }

    const isUnlimited = stats.limit === -1;
    const hasAccess = isUnlimited || stats.current < stats.limit;
    const remaining = isUnlimited ? Infinity : Math.max(0, stats.limit - stats.current);

    return {
      hasAccess,
      current: stats.current,
      limit: stats.limit,
      remaining,
      isUnlimited,
      isLoaded: true,
    };
  }, [usageMap, feature]);
}
