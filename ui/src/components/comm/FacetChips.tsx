"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FacetChipsProps {
    aggregations?: Record<string, number>
    onSelect?: (category: string) => void
    selectedCategory?: string | null
    className?: string
    initialCount?: number
}

// Helper for "the expandble" -> "The Expandble"
function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
}

export function FacetChips({
    aggregations,
    onSelect,
    selectedCategory,
    className,
    initialCount = 5
}: FacetChipsProps) {
    const [open, setOpen] = useState(false)

    if (!aggregations || Object.keys(aggregations).length === 0) {
        return null
    }

    // Convert to array and sort by count (descending)
    const facets = Object.entries(aggregations)
        .map(([key, count]) => ({ key, count, label: toTitleCase(key) }))
        .sort((a, b) => b.count - a.count)

    const visibleFacets = facets.slice(0, initialCount)
    const hiddenFacets = facets.slice(initialCount)
    const hasMore = hiddenFacets.length > 0

    return (
        <div className={cn("w-full mb-4", className)}>
            <motion.div
                layout
                className="flex flex-wrap items-center gap-2"
            >
                <AnimatePresence mode="popLayout">
                    {visibleFacets.map(({ key, count, label }) => {
                        const isSelected = selectedCategory === key
                        return (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                key={key}
                                onClick={() => onSelect?.(key)}
                                className={cn(
                                    "relative group flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/50"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>{label}</span>
                                <span className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center",
                                    isSelected
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-muted-foreground/10 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                )}>
                                    {count}
                                </span>
                            </motion.button>
                        )
                    })}
                </AnimatePresence>

                {hasMore && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <motion.button
                                layout
                                className={cn(
                                    "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors rounded-full border",
                                    open
                                        ? "bg-primary/10 text-primary border-primary/30"
                                        : "text-muted-foreground hover:text-primary bg-transparent hover:bg-muted/30 border-transparent hover:border-border"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                More
                                <motion.div
                                    animate={{ rotate: open ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown size={14} />
                                </motion.div>
                            </motion.button>
                        </PopoverTrigger>

                        <PopoverContent
                            className="w-[280px] p-0 border-border/50 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-black/40 text-foreground overflow-hidden"
                            side="bottom"
                            align="start"
                        >
                            <div className="p-3 border-b border-border/10 bg-muted/20 dark:bg-white/5">
                                <h4 className="font-medium text-sm text-foreground/80">More Categories</h4>
                            </div>

                            <ScrollArea className="h-[240px] w-full p-2">
                                <div className="grid grid-cols-1 gap-1">
                                    {hiddenFacets.map(({ key, count, label }) => {
                                        const isSelected = selectedCategory === key
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    onSelect?.(key)
                                                    setOpen(false)
                                                }}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left",
                                                    isSelected
                                                        ? "bg-primary/20 text-primary font-medium"
                                                        : "text-muted-foreground hover:bg-muted dark:hover:bg-white/10 hover:text-foreground"
                                                )}
                                            >
                                                <span className="truncate">{label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded-full",
                                                        isSelected
                                                            ? "bg-primary/20 text-primary"
                                                            : "bg-muted dark:bg-white/10 text-muted-foreground"
                                                    )}>
                                                        {count}
                                                    </span>
                                                    {isSelected && <Check size={14} className="text-primary" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>

                            {/* Footer with gradient line */}
                            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                        </PopoverContent>
                    </Popover>
                )}
            </motion.div>
        </div>
    )
}
