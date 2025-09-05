'use client';

import { useCompletion } from '@ai-sdk/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import Threads from './Threads'; // Assuming Threads.tsx is in the same directory

export function AiCompletion() {
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/v1/completion',
  });

  const handleGenerate = () => {
    const prompt = 'Tell me a fun fact about the ocean.';
    complete(prompt);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
        <div style={{ width: 'calc(100% + 3rem)', height: '150px', position: 'relative', left: '-1.5rem' }}>
          <Threads
            amplitude={1}
            distance={0}
            enableMouseInteraction={true}
          />
        </div>
        <div className="pt-0 px-8 pb-8">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-white mt-[-1rem]">AI Assistant</h1>
            <p className="text-center text-gray-300 mt-2">Click the button to get a fun fact!</p>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="rounded-full bg-blue-500/50 px-6 py-3 text-white font-semibold hover:bg-blue-500/80 transition-colors disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Generating…' : 'Ask AI'}
            </button>
          </div>

          <AnimatePresence>
            {(completion || error) && (
              <motion.div
                key="completion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-6 pt-6 border-t border-white/20"
              >
                <h2 className="text-xl font-bold mb-4 text-white">Response:</h2>
                <div className="text-gray-200">
                  {error ? (
                    <p className="text-red-500">{error.message}</p>
                  ) : (
                    <Markdown remarkPlugins={[remarkGfm]}>{completion}</Markdown>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
