"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

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
                                    "relative group flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:shadow-sm"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span>{label}</span>
                                <span className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center",
                                    isSelected
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
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
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="h-9 px-3 text-xs font-semibold rounded-full border-dashed border-muted-foreground/50 hover:border-primary hover:text-primary text-muted-foreground bg-transparent"
                            >
                                More...
                                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search category..." />
                                <CommandList>
                                    <CommandEmpty>No category found.</CommandEmpty>
                                    <CommandGroup heading="More Categories">
                                        {hiddenFacets.map(({ key, count, label }) => (
                                            <CommandItem
                                                key={key}
                                                value={label} // Use label for better searching
                                                onSelect={() => {
                                                    onSelect?.(key)
                                                    setOpen(false)
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedCategory === key ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span className="flex-1 truncate">{label}</span>
                                                <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                                    {count}
                                                </span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </motion.div>
        </div>
    )
}
