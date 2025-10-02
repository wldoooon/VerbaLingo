import { Skeleton } from "@/components/ui/skeleton"

/**
 * SearchResultsSkeleton - A professional loading skeleton for search results
 * 
 * This component displays an animated placeholder that mirrors the structure
 * of actual search result stats, improving perceived performance.
 */
export const SearchResultsSkeleton = () => {
  return (
    <div className="w-full flex items-center justify-between animate-in fade-in duration-300">
      {/* Left side: "Found X clips" skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-8 bg-primary/20" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Right side: Filter controls skeleton */}
      <div className="flex items-center gap-4">
        {/* Category picker skeleton */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Language picker skeleton */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * SearchLoadingSkeleton - A simplified loading state for active searches
 * 
 * Use this when the search is actively fetching data from the API.
 */
export const SearchLoadingSkeleton = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 py-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-2 w-16 rounded-full" />
        <Skeleton className="h-2 w-16 rounded-full" />
        <Skeleton className="h-2 w-16 rounded-full" />
      </div>
    </div>
  )
}

/**
 * VideoCardSkeleton - A skeleton for individual video result cards
 * 
 * Use this when rendering a list of loading video results.
 */
export const VideoCardSkeleton = () => {
  return (
    <div className="flex gap-4 p-4 border rounded-lg animate-in fade-in duration-500">
      {/* Thumbnail skeleton */}
      <Skeleton className="h-24 w-40 rounded-md shrink-0" />
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * VideoGridSkeleton - Multiple video card skeletons for grid layouts
 * 
 * @param count - Number of skeleton cards to render (default: 3)
 */
export const VideoGridSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  )
}
