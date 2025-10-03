"use client";

export const AiAssistantSkeleton = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto text-center flex flex-col items-center bg-card rounded-2xl p-8 shadow-xl dark:shadow-2xl dark:shadow-slate-950/50 border dark:border-slate-800 animate-pulse">
      <header className="w-full">
        <div className="relative h-28 w-full flex items-center justify-center mb-6">
          {/* Central Orb Skeleton */}
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mx-auto mb-4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full max-w-lg mx-auto mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto" />
      </header>

      <main className="w-full mt-6">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-full"
            />
          ))}
        </div>

        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
      </main>
    </div>
  );
};
