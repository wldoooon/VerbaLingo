"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShimmeringText } from "@/components/ui/shimmering-text";

const loadingPhrases = [
  "Analyzing pronunciation patterns...",
  "Fetching linguistic insights...",
  "Processing language data...",
  "Understanding context...",
  "Generating explanations...",
  "Searching knowledge base...",
];

export const AiAssistantSkeleton = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      {/* Shimmering loading text with cycling phrases */}
      <div className="flex items-center justify-start min-h-[32px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ShimmeringText
              text={loadingPhrases[currentIndex]}
              duration={2}
              className="text-base font-medium"
              repeat={true}
              repeatDelay={0.5}
              spread={3}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

