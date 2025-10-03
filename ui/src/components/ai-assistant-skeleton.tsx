"use client";

export const AiAssistantSkeleton = () => {
  return (
    <div className="w-full">
      <div className="bg-muted/50 rounded-xl p-6 border animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-11/12" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-10/12" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-9/12" />
        </div>
      </div>
    </div>
  );
};
