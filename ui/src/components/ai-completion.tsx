'use client';

import { useCompletion } from '@ai-sdk/react';

export function AiCompletion({ query }: { query: string }) {
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/v1/completion',
  });

  const handleGenerate = () => {
    // Use the query from the search bar, or a default if it's empty.
    const prompt = query.trim() || 'Why is the sky blue?';
    complete(prompt);
  };

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {isLoading ? 'Generating…' : 'Ask AI'}
      </button>

      {error && <div className="text-red-600 text-sm">{error.message}</div>}

      <div className="whitespace-pre-wrap text-sm">{completion}</div>
    </div>
  );
}
