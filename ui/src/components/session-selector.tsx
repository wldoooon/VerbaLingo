"use client"

import { useState } from "react"
import { cn, timeAgo } from "@/lib/utils"
import { History, Trash2, ArrowLeft, MessageSquare } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface SessionSelectorProps {
    sessions: Record<string, any>;
    activeSessionId: string;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
    className?: string;
    currentQuery?: string;
}

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
    onDeleteSession,
    className,
    currentQuery,
}: SessionSelectorProps) {
    const [open, setOpen] = useState(false)

    const sessionKeys = Object.keys(sessions).filter(key =>
        sessions[key].branches && sessions[key].branches.length > 0
    );

    if (sessionKeys.length === 0) return null;

    const sortedSessions = sessionKeys.sort((a, b) => {
        const timeA = sessions[a].lastActive || 0;
        const timeB = sessions[b].lastActive || 0;
        return timeB - timeA;
    });

    const isViewingHistory = currentQuery && currentQuery !== activeSessionId;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer",
                        open && "bg-muted/60 text-foreground",
                        className,
                    )}
                >
                    <History className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">History</span>
                    {sessionKeys.length > 0 && (
                        <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-px font-medium">
                            {sessionKeys.length}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-1.5" align="end" sideOffset={8}>
                {/* Return to current search */}
                {isViewingHistory && (
                    <button
                        onClick={() => { onSelectSession(currentQuery); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left cursor-pointer mb-1"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">Back to "{toTitleCase(currentQuery)}"</span>
                    </button>
                )}

                {/* Session list */}
                <div className="max-h-[240px] overflow-y-auto space-y-px">
                    {sortedSessions.map((key) => {
                        const isActive = activeSessionId === key;
                        const branchCount = sessions[key].branches?.length || 0;

                        return (
                            <div
                                key={key}
                                onClick={() => { onSelectSession(key); setOpen(false); }}
                                className={cn(
                                    "group flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors cursor-pointer",
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-muted/60 text-foreground"
                                )}
                            >
                                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{toTitleCase(key)}</p>
                                    <p className="text-[10px] text-muted-foreground/70">
                                        {branchCount} msg · {timeAgo(sessions[key].lastActive || sessions[key].createdAt)}
                                    </p>
                                </div>
                                <div
                                    role="button"
                                    className="h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground/40 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onDeleteSession(key, e);
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}
