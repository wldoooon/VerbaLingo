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
            "w-full flex flex-col gap-1.5 select-none transition-opacity duration-200",
            isLoading && "opacity-40 pointer-events-none"
        )}>

            {/* Counter + Latest jump */}
            <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="h-6 w-6 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-20 cursor-pointer"
                >
                    <ChevronLeft className="h-3 w-3" />
                </Button>

                {/* Track + dots */}
                <div className="relative flex-1 flex items-center justify-center h-6">
                    <div className="absolute left-0 right-0 h-px bg-border/60" />

                    <div className="relative flex items-center justify-center gap-3 w-full">
                        {showLeftEllipsis && (
                            <span className="text-[9px] text-muted-foreground/30 relative z-10">···</span>
                        )}

                        {branches.slice(start, end + 1).map((branch, relIdx) => {
                            const i = start + relIdx;
                            const isActive = i === currentIndex;
                            const isPast = i < currentIndex;

                            return (
                                <TooltipProvider key={branch.id}>
                                    <Tooltip delayDuration={200}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => onSelectIndex(i)}
                                                className="group relative flex-shrink-0 h-6 w-6 flex items-center justify-center outline-none cursor-pointer"
                                                aria-label={`Question ${i + 1}: ${branch.prompt}`}
                                            >
                                                <motion.div
                                                    layout
                                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                                    className={cn(
                                                        "rounded-full z-10 transition-all duration-200",
                                                        isActive
                                                            ? "w-4 h-4 bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]"
                                                            : isPast
                                                                ? "w-2.5 h-2.5 bg-border group-hover:bg-muted-foreground/50"
                                                                : "w-2.5 h-2.5 bg-primary/30 group-hover:bg-primary/60"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
                                                    )}
                                                </motion.div>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[200px] text-xs p-2">
                                            <p className="line-clamp-3">{branch.prompt}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}

                        {showRightEllipsis && (
                            <span className="text-[9px] text-muted-foreground/30 relative z-10">···</span>
                        )}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    disabled={currentIndex === branches.length - 1}
                    className="h-6 w-6 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-20 cursor-pointer"
                >
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>

            {/* Active prompt label */}
            {activePrompt && (
                <p className="text-[10px] text-muted-foreground/40 truncate text-center leading-none">
                    {activePrompt}
                </p>
            )}
        </div>
    );
}
