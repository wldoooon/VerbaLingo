"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, timeAgo } from "@/lib/utils"
import { Check, ChevronsUpDown, History } from "lucide-react"
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

interface SessionSelectorProps {
    sessions: Record<string, any>; // Using any for simplicity as we just need keys and lengths
    activeSessionId: string;
    onSelectSession: (sessionId: string) => void;
    className?: string;
    initialCount?: number;
    currentQuery?: string;
}

// Helper for Title Case
function toTitleCase(str: string) {
    if (!str) return "Unknown";
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
}

export function SessionSelector({
    sessions,
    activeSessionId,
    onSelectSession,
    className,
    currentQuery,
}: SessionSelectorProps) {
    const [open, setOpen] = useState(false)

    // Filter out empty sessions
    const sessionKeys = Object.keys(sessions).filter(key =>
        sessions[key].branches && sessions[key].branches.length > 0
    );

    if (sessionKeys.length === 0) {
        return null; // Don't show if no history
    }

    // Sort by lastActive (most recent first)
    const sortedSessions = sessionKeys.sort((a, b) => {
        const timeA = sessions[a].lastActive || 0;
        const timeB = sessions[b].lastActive || 0;
        return timeB - timeA;
    });

    // user request: "default value instead of the current keyword add history"
    // We strictly show "History" to indicate this is the history menu.
    const activeLabel = "History";

    return (
        <div className={cn("w-full mb-4", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="h-9 px-4 text-xs font-semibold rounded-full border-dashed border-border hover:border-primary hover:text-primary text-muted-foreground bg-transparent w-full sm:w-auto justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <History className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[150px]">{activeLabel}</span>
                        </span>
                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search history..." />
                        <CommandList>
                            <CommandEmpty>No topic found.</CommandEmpty>

                            {/* Option to return to current search if we are viewing history */}
                            {currentQuery && currentQuery !== activeSessionId && (
                                <CommandGroup heading="Current Search">
                                    <CommandItem
                                        value={toTitleCase(currentQuery)}
                                        onSelect={() => {
                                            onSelectSession(currentQuery)
                                            setOpen(false)
                                        }}
                                        className="cursor-pointer bg-primary/10 text-primary font-medium"
                                    >
                                        <Check className="mr-2 h-4 w-4 opacity-0" /> {/* Spacer */}
                                        <span className="flex-1 truncate text-sm">Return to: {toTitleCase(currentQuery)}</span>
                                    </CommandItem>
                                </CommandGroup>
                            )}

                            <CommandGroup heading="History">
                                {sortedSessions.map((key) => (
                                    <CommandItem
                                        key={key}
                                        value={toTitleCase(key)}
                                        onSelect={() => {
                                            onSelectSession(key)
                                            setOpen(false)
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                activeSessionId === key ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="flex-1 truncate text-sm">{toTitleCase(key)}</span>
                                        <span className="ml-auto text-[10px] text-muted-foreground/70">
                                            {timeAgo(sessions[key].lastActive || sessions[key].createdAt)}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
