"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchStore } from "@/stores/use-search-store";
import { Button } from "@/components/ui/button";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { ThumbsDown, ThumbsUp, Copy, Mic, BookText, Repeat, XCircle, Search, CornerDownLeft, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SuggestionChip } from "@/components/suggestion-chip";
import { AiAssistantSkeleton } from "@/components/ai-assistant-skeleton";
import { useResponseHistory } from "@/hooks/useResponseHistory";
import { SessionSelector } from "@/components/session-selector";
import { BranchTimeline } from "@/components/branch-timeline";
import { useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import { anchoredToastManager } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";

interface SmartSuggestion {
    title: string;
    prompt: string;
    icon: React.ReactNode;
}

function generateSmartSuggestions(searchWord: string): SmartSuggestion[] {
    if (!searchWord || searchWord.trim() === "") {
        return [
            {
                title: "Learn pronunciation tips",
                prompt: "What are some general tips for improving English pronunciation?",
                icon: <Mic className="h-4 w-4" />,
            },
            {
                title: "Common grammar mistakes",
                prompt: "What are the most common grammar mistakes English learners make?",
                icon: <BookText className="h-4 w-4" />,
            },
            {
                title: "Expand vocabulary",
                prompt: "How can I effectively expand my English vocabulary?",
                icon: <Repeat className="h-4 w-4" />,
            },
            {
                title: "Common mistakes to avoid",
                prompt: "What are common mistakes English learners make and how to avoid them?",
                icon: <XCircle className="h-4 w-4" />,
            },
        ];
    }

    return [
        {
            title: `Pronounce "${searchWord}" correctly`,
            prompt: `Break down how to pronounce the word "${searchWord}" syllable by syllable with phonetic examples. Include common mistakes learners make.`,
            icon: <Mic className="h-4 w-4" />,
        },
        {
            title: `"${searchWord}" in different contexts`,
            prompt: `Show me 5 example sentences using the word "${searchWord}" in different contexts (formal, informal, academic, conversational). Explain the nuances.`,
            icon: <BookText className="h-4 w-4" />,
        },
        {
            title: `Similar words to "${searchWord}"`,
            prompt: `What are 5 words similar in meaning or usage to "${searchWord}"? Explain the subtle differences between them with examples.`,
            icon: <Repeat className="h-4 w-4" />,
        },
        {
            title: `Common mistakes with "${searchWord}"`,
            prompt: `What are the most common mistakes English learners make when using the word "${searchWord}"? How can I avoid them?`,
            icon: <XCircle className="h-4 w-4" />,
        },
    ];
}

export function AiCompletion({ externalPrompt }: { externalPrompt: string | null }) {
    const { query } = useSearchStore();
    const router = useRouter();
    const nextSearchParams = useNextSearchParams();

    // Replacement for useCompletion
    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const complete = async (prompt: string) => {
        setIsLoading(true);
        setCompletion("");
        setError(null);

        try {
            const context = getThreadContext(2); // Get last 2 branches
            const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;

            const response = await fetch("/api/v1/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: fullPrompt }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                console.log("DEBUG CHUNK:", chunk);
                setCompletion((prev) => prev + chunk);
            }
        } catch (err: any) {
            console.error("Completion error:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };


    const [inputValue, setInputValue] = useState("");
    const currentPromptRef = useRef<string>("");
    const responseContainerRef = useRef<HTMLDivElement>(null);
    const scrollContentRef = useRef<HTMLDivElement>(null);
    const [maxResponseHeight, setMaxResponseHeight] = useState<number>(400);
    const [canScroll, setCanScroll] = useState(false);

    // Use our custom history hook
    const {
        currentBranch,
        totalBranches,
        currentIndex,
        canGoBack,
        canGoForward,
        addBranch,
        goToPrevious,
        goToNext,
        getThreadContext,
        sessions,
        switchSession,
        activeSessionId,
        deleteSession,
        branches
    } = useResponseHistory();

    // Copy Logic
    const copyButtonRef = useRef<HTMLButtonElement>(null);
    const { isCopied, copyToClipboard } = useCopyToClipboard({
        onCopy: () => {
            if (copyButtonRef.current) {
                anchoredToastManager.add({
                    data: { tooltipStyle: true },
                    positionerProps: { anchor: copyButtonRef.current },
                    timeout: 2000,
                    title: "Copied!",
                });
            }
        },
    });

    const handleCopy = () => {
        const textToCopy = currentBranch ? currentBranch.response : completion;
        if (textToCopy) copyToClipboard(textToCopy);
    };

    const smartSuggestions = useMemo(() => generateSmartSuggestions(query), [query]);

    // Auto-Switch Session when search query changes
    useEffect(() => {
        if (query && query.trim() !== "") {
            switchSession(query);
        }
    }, [query, switchSession]);

    // Handle manual session selection
    const handleSessionSelect = (sessionId: string) => {
        switchSession(sessionId);
    };

    const shouldHideSuggestions = useMemo(() => {
        // Hide if loading, or if we have a current response (stream or history)
        return isLoading || !!completion || !!currentBranch;
    }, [isLoading, completion, currentBranch]);

    useEffect(() => {
        const calculateMaxHeight = () => {
            const container = responseContainerRef.current?.closest('.flex.flex-col') as HTMLElement;
            if (!container) return;

            const containerHeight = container.clientHeight;
            const header = container.querySelector('header');
            const footer = container.querySelector('footer');
            const suggestions = container.querySelector('[class*="suggestions"]');

            const headerHeight = header?.clientHeight || 0;
            const footerHeight = footer?.clientHeight || 0;
            const suggestionsHeight = !shouldHideSuggestions && suggestions?.clientHeight || 0;

            // New timeline height roughly ~100px when active. 
            // We increase buffer from 100 to 180 to account for the timeline and padding safely.
            // A more robust solution would be to measure the timeline container if present.
            const extraBuffer = totalBranches > 1 ? 180 : 100;

            // Calculate available space
            const availableSpace = containerHeight - headerHeight - footerHeight - suggestionsHeight - extraBuffer;
            setMaxResponseHeight(Math.max(200, Math.min(availableSpace, 600)));
        };

        calculateMaxHeight();
        window.addEventListener('resize', calculateMaxHeight);
        return () => window.removeEventListener('resize', calculateMaxHeight);
    }, [shouldHideSuggestions, totalBranches]); // Added totalBranches to deps

    // Check if content is scrollable
    useEffect(() => {
        const checkScrollable = () => {
            if (scrollContentRef.current) {
                const { scrollHeight, clientHeight } = scrollContentRef.current;
                setCanScroll(scrollHeight > clientHeight);
            }
        };

        const timeout = setTimeout(checkScrollable, 100); // Small delay to allow layout update
        window.addEventListener('resize', checkScrollable);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', checkScrollable);
        };
    }, [completion, currentBranch, maxResponseHeight, isLoading]);

    const handleSuggestionClick = (suggestion: SmartSuggestion) => {
        setInputValue(suggestion.prompt);
        currentPromptRef.current = suggestion.prompt;
        complete(suggestion.prompt);
    };

    const handleInputSubmit = () => {
        if (inputValue.trim()) {
            const prompt = inputValue.trim();
            currentPromptRef.current = prompt;
            complete(prompt);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleInputSubmit();
        }
    };

    // Trigger completion when a new external prompt is passed in (e.g. from AudioCard)
    const lastHandledPromptRef = useRef<string | null>(null);

    useEffect(() => {
        if (!externalPrompt) return;
        if (externalPrompt === lastHandledPromptRef.current) return;

        lastHandledPromptRef.current = externalPrompt;
        currentPromptRef.current = externalPrompt;
        complete(externalPrompt);
    }, [externalPrompt]);

    // Store completed response as a branch
    useEffect(() => {
        if (!isLoading && completion && completion.trim() && currentPromptRef.current) {
            addBranch(currentPromptRef.current, completion);
        }
    }, [isLoading]); // Removed completion/addBranch from deps to avoid double-add

    // Clear input after submission
    useEffect(() => {
        if (!isLoading) {
            setInputValue("");
        }
    }, [isLoading]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="relative w-full h-full flex flex-col bg-card p-6">

                <header className="relative w-full flex-shrink-0">
                    {/* Session Selector (History) - Top Right */}
                    <div className="absolute right-0 top-0 z-20">
                        <SessionSelector
                            sessions={sessions}
                            activeSessionId={activeSessionId}
                            onSelectSession={handleSessionSelect}
                            onDeleteSession={deleteSession}
                            currentQuery={query}
                        />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 text-center pt-2">
                        {query ? (
                            <>
                                Learning about <span className="text-primary">"{query}"</span>
                            </>
                        ) : "What do you want to learn?"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-lg mx-auto text-center">
                        {query
                            ? `Get pronunciations, examples, and detailed explanations for "${query}"`
                            : "Explore topics, get explanations, and improve your understanding—all in one place."
                        }
                    </p>

                    {/* Header bottom gradient border */}
                    <div className="relative mt-6">
                        <div className="absolute bottom-0 left-0 right-0 flex h-px">
                            <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                            <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                        </div>
                    </div>
                </header>



                <main className="w-full flex-1 flex flex-col mt-6 space-y-6 min-h-0">
                    <div className="flex items-center gap-4 px-8 opacity-60 mb-2">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Today</span>
                        <div className="h-px bg-border flex-1" />
                    </div>
                    {/* Suggestions */}
                    <AnimatePresence>
                        {!shouldHideSuggestions && (
                            <motion.div
                                initial={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden suggestions-container"
                            >
                                <div className="flex flex-wrap justify-center gap-3">
                                    {smartSuggestions.map((suggestion, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{
                                                duration: 0.4,
                                                delay: i * 0.1,
                                                ease: [0.4, 0, 0.2, 1]
                                            }}
                                        >
                                            <SuggestionChip
                                                icon={suggestion.icon}
                                                text={suggestion.title}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                                {/* Separator */}
                                <div className="w-full px-8">
                                    <div className="h-px bg-border/40 my-2" />
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>



                    {/* AI Welcome Message - Only show when idle AND no history */}
                    {!isLoading && !completion && !error && !currentBranch && query && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full"
                        >
                            <div className="relative bg-card rounded-xl p-6 text-left border-x">
                                {/* Top gradient border */}
                                <div className="absolute top-0 left-0 right-0 flex h-px">
                                    <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                                    <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                                </div>

                                <div className="text-base text-card-foreground/90 leading-relaxed">
                                    Hello! I'm your AI assistant. I can help you understand nuances, practice pronunciation, or generate examples for <span className="font-semibold text-primary">"{query}"</span>.
                                    <br /><br />
                                    Try tapping a suggestion above or type your own question below!
                                </div>

                                {/* Bottom gradient border */}
                                <div className="absolute bottom-0 left-0 right-0 flex h-px">
                                    <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                                    <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Response Section */}
                    <AnimatePresence>
                        {isLoading && !completion && !error ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <AiAssistantSkeleton />
                            </motion.div>
                        ) : (completion || error || currentBranch) && (
                            <motion.div
                                key="completion"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="w-full"
                            >
                                <div ref={responseContainerRef} className="relative bg-card rounded-xl p-6 text-left border-x">
                                    {/* Top gradient border */}
                                    <div className="absolute top-0 left-0 right-0 flex h-px">
                                        <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                                        <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                                    </div>

                                    <div className="relative">
                                        {/* Top blur gradient */}
                                        {canScroll && (
                                            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-300" id="top-blur" />
                                        )}

                                        {/* Scrollable content */}
                                        <div
                                            ref={scrollContentRef}
                                            style={{ maxHeight: `${maxResponseHeight}px` }}
                                            className="overflow-y-auto text-card-foreground pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                                            onScroll={(e) => {
                                                const element = e.currentTarget;
                                                const topBlur = document.getElementById('top-blur');
                                                const bottomBlur = document.getElementById('bottom-blur');

                                                if (topBlur && bottomBlur) {
                                                    // Check if scrolled from top
                                                    if (element.scrollTop > 10) {
                                                        topBlur.style.opacity = '1';
                                                    } else {
                                                        topBlur.style.opacity = '0';
                                                    }

                                                    // Check if scrolled to bottom
                                                    const isBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
                                                    if (isBottom) {
                                                        bottomBlur.style.opacity = '0';
                                                    } else {
                                                        bottomBlur.style.opacity = '1';
                                                    }
                                                }
                                            }}
                                        >
                                            {error ? (
                                                <p className="text-red-500">{error.message}</p>
                                            ) : (
                                                <>
                                                    {/* Show current branch if navigating, otherwise show live streaming completion */}
                                                    <div className="text-base md:text-lg leading-relaxed">
                                                        <Response>
                                                            {currentBranch && !isLoading
                                                                ? currentBranch.response
                                                                : completion
                                                            }
                                                        </Response>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Bottom blur gradient */}
                                        {canScroll && (
                                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 opacity-100 transition-opacity duration-300" id="bottom-blur" />
                                        )}
                                    </div>

                                    {/* Bottom gradient border */}
                                    <div className="absolute -bottom-px left-0 right-0 flex h-px">
                                        <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                                        <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                                    </div>

                                    {!isLoading && !error && (
                                        <div className="flex flex-col items-center gap-4 mt-4 pt-4 border-t">
                                            {/* Branch Navigation - Timeline Component */}
                                            {totalBranches > 1 && (
                                                <div className="w-full">
                                                    <BranchTimeline
                                                        currentIndex={currentIndex}
                                                        branches={branches}
                                                        onSelectIndex={(index) => {
                                                            const diff = index - currentIndex;
                                                            if (diff > 0) {
                                                                for (let i = 0; i < diff; i++) goToNext();
                                                            } else if (diff < 0) {
                                                                for (let i = 0; i < Math.abs(diff); i++) goToPrevious();
                                                            }
                                                        }}
                                                        onPrevious={goToPrevious}
                                                        onNext={goToNext}
                                                    />
                                                </div>
                                            )}

                                            {/* Action Buttons - Moved under timeline */}
                                            <div className="flex items-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                ref={copyButtonRef}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:text-primary transition-colors"
                                                                onClick={handleCopy}
                                                                disabled={isCopied}
                                                            >
                                                                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            <p>Copy to clipboard</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-500 transition-colors">
                                                    <ThumbsUp size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 transition-colors">
                                                    <ThumbsDown size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </main>

                <footer className="relative w-full flex-shrink-0 mt-6 pt-4">
                    {/* Footer top gradient border */}
                    <div className="absolute top-0 left-0 right-0 flex h-px">
                        <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                        <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                    </div>

                    {/* Input Bar */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <Input
                            type="text"
                            placeholder="Ask about pronunciation, definitions, examples..."
                            className="w-full rounded-full pl-10 pr-10 py-6 bg-muted shadow-sm border border-primary/40 focus-visible:bg-background transition-colors"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleInputSubmit}
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CornerDownLeft className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                        </button>
                    </div>
                    <div className="text-center mt-3 px-4">
                        <p className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">
                            AI can make mistakes. Please verify important information.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
