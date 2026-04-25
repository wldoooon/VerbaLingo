"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
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
    isLoading?: boolean;
}

// Max number of nodes to show at once before windowing kicks in
const WINDOW_SIZE = 7;

export function BranchTimeline({
    currentIndex,
    branches,
    onSelectIndex,
    onPrevious,
    onNext,
    isLoading = false,
}: BranchTimelineProps) {
    // Keyboard navigation — arrow keys when panel is in view
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (isLoading) return;
            // Only intercept if no text input is focused
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") return;
            if (e.key === "ArrowLeft") { e.preventDefault(); onPrevious(); }
            if (e.key === "ArrowRight") { e.preventDefault(); onNext(); }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isLoading, onPrevious, onNext]);

    // Compute the visible window of nodes centered on the active one
    const { start, end } = useMemo(() => {
        if (branches.length <= WINDOW_SIZE) return { start: 0, end: branches.length - 1 };
        const half = Math.floor(WINDOW_SIZE / 2);
        let s = currentIndex - half;
        let e = currentIndex + half;
        if (s < 0) { e += Math.abs(s); s = 0; }
        if (e >= branches.length) { s -= (e - branches.length + 1); e = branches.length - 1; }
        return { start: Math.max(0, s), end: e };
    }, [currentIndex, branches.length]);

    const showLeftEllipsis = start > 0;
    const showRightEllipsis = end < branches.length - 1;
    const isAtLatest = currentIndex === branches.length - 1;
    const activePrompt = branches[currentIndex]?.prompt ?? "";

    return (
        <div className={cn(
            "w-full flex flex-col items-center gap-2 py-1 select-none transition-opacity duration-200",
            isLoading && "opacity-40 pointer-events-none"
        )}>

            {/* Counter row + Latest jump */}
            <div className="w-full flex items-center justify-between px-1 min-h-[16px]">
                <span className="text-[10px] text-muted-foreground/50 tabular-nums font-medium">
                    {currentIndex + 1} / {branches.length}
                </span>
                {!isAtLatest && (
                    <button
                        onClick={() => onSelectIndex(branches.length - 1)}
                        className="flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:text-primary/70 transition-colors cursor-pointer"
                    >
                        Latest <ChevronsRight className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Timeline row */}
            <div className="w-full flex items-center gap-1 sm:gap-2">

                {/* Prev button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-20 cursor-pointer"
                >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                {/* Nodes container */}
                <div className="relative flex-1 flex items-center justify-center">
                    {/* Background line */}
                    <div className="absolute left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-700 rounded-full" />

                    <div className="relative flex items-center justify-center gap-2 sm:gap-4 w-full">
                        {/* Left overflow indicator */}
                        {showLeftEllipsis && (
                            <span className="text-[10px] text-muted-foreground/40 flex-shrink-0 relative z-10 leading-none">
                                •••
                            </span>
                        )}

                        {branches.slice(start, end + 1).map((branch, relIdx) => {
                            const i = start + relIdx;
                            const isActive = i === currentIndex;
                            const isPast = i < currentIndex;

                            return (
                                <TooltipProvider key={branch.id}>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => onSelectIndex(i)}
                                                className="group relative flex-shrink-0 h-10 w-8 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-md cursor-pointer"
                                                aria-label={`Question ${i + 1}: ${branch.prompt}`}
                                            >
                                                {/* Dot — absolutely centered = perfectly on the line */}
                                                <motion.div
                                                    layout
                                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                                    className={cn(
                                                        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-10 transition-colors duration-200",
                                                        isActive
                                                            ? "w-5 h-5 bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]"
                                                            : isPast
                                                                ? "w-3 h-3 bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500"
                                                                : "w-3 h-3 bg-primary/35 group-hover:bg-primary/55"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white dark:bg-black" />
                                                    )}
                                                </motion.div>

                                                {/* Number — below the dot */}
                                                <span className={cn(
                                                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] tabular-nums leading-none transition-colors",
                                                    isActive
                                                        ? "text-primary font-bold"
                                                        : "text-muted-foreground/40 group-hover:text-muted-foreground/70"
                                                )}>
                                                    {i + 1}
                                                </span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[200px] text-xs p-2">
                                            <p className="line-clamp-3">{branch.prompt}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}

                        {/* Right overflow indicator */}
                        {showRightEllipsis && (
                            <span className="text-[10px] text-muted-foreground/40 flex-shrink-0 relative z-10 leading-none">
                                •••
                            </span>
                        )}
                    </div>
                </div>

                {/* Next button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    disabled={currentIndex === branches.length - 1}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-20 cursor-pointer"
                >
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
            </div>

            {/* Active node prompt label */}
            {activePrompt && (
                <p className="text-[10px] text-muted-foreground/50 text-center max-w-[260px] truncate leading-none">
                    {activePrompt}
                </p>
            )}
        </div>
    );
}
