"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BranchTimelineProps {
    currentIndex: number;
    branches: { id: string; prompt: string }[];
    onSelectIndex: (index: number) => void;
    onPrevious: () => void;
    onNext: () => void;
}

export function BranchTimeline({
    currentIndex,
    branches,
    onSelectIndex,
    onPrevious,
    onNext
}: BranchTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active item
    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeNode = scrollContainerRef.current.children[currentIndex] as HTMLElement;
            if (activeNode) {
                const container = scrollContainerRef.current;
                const scrollLeft = activeNode.offsetLeft - container.clientWidth / 2 + activeNode.clientWidth / 2;
                container.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
        }
    }, [currentIndex]);

    return (
        <div className="w-full flex flex-col items-center gap-1 py-1 select-none">

            <div className="w-full flex items-center justify-between gap-4">
                {/* Prev Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-20"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Timeline Container */}
                {/* Reduced height as badge is removed */}
                <div className="relative flex-1 h-14 flex items-center justify-center">

                    {/* Background Line */}
                    <div className="absolute left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-800 rounded-full top-1/2 -translate-y-1/2" />

                    {/* Scrollable Nodes */}
                    <div
                        ref={scrollContainerRef}
                        className="relative w-full h-full flex items-center gap-8 overflow-x-auto no-scrollbar px-[40%] scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {branches.map((branch, i) => {
                            const isActive = i === currentIndex;
                            const isPast = i < currentIndex;

                            return (
                                <TooltipProvider key={i}>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => onSelectIndex(i)}
                                                className="group relative flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-full"
                                            >
                                                {/* The Dot Node */}
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full transition-all duration-300 relative z-10",
                                                    isActive
                                                        ? "bg-primary w-6 h-6 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"
                                                        : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 scale-90"
                                                )}>
                                                    {isActive && (
                                                        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white dark:bg-black" />
                                                    )}
                                                </div>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[200px] text-xs p-2">
                                            <p className="line-clamp-3">{branch.prompt}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                </div>

                {/* Next Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    disabled={currentIndex === branches.length - 1}
                    className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-20"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Helper Text */}
            <p className="text-[10px] text-muted-foreground/50 -mt-1">
                Click a node to switch to that version of the response
            </p>
        </div>
    );
}
