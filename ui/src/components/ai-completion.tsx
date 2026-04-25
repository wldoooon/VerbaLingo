import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchStore } from "@/stores/use-search-store";
import { useUsageStore } from "@/stores/usage-store";
import { Button } from "@/components/ui/button";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { ThumbsDown, ThumbsUp, Copy, Mic, BookText, Repeat, XCircle, Search, CornerDownLeft, Lock, MessageSquare, Zap, Square, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SuggestionChip } from "@/components/suggestion-chip";
import { AiAssistantSkeleton } from "@/components/ai-assistant-skeleton";
import { useResponseHistory } from "@/hooks/useResponseHistory";
import { SessionSelector } from "@/components/session-selector";
import { BranchTimeline } from "@/components/branch-timeline";
import { useRouter } from "next/navigation";
import { toastManager, anchoredToastManager } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { AuthDialog } from "@/components/auth-dialog";

interface SmartSuggestion {
    title: string;
    prompt: string;
    icon: React.ReactNode;
}

// Language-aware suggestions — no longer hardcoded to "English"
function generateSmartSuggestions(searchWord: string, language: string): SmartSuggestion[] {
    const lang = language || "English";

    if (!searchWord || searchWord.trim() === "") {
        return [
            {
                title: "Learn pronunciation tips",
                prompt: `What are some general tips for improving ${lang} pronunciation?`,
                icon: <Mic className="h-4 w-4" />,
            },
            {
                title: "Common grammar mistakes",
                prompt: `What are the most common grammar mistakes ${lang} learners make?`,
                icon: <BookText className="h-4 w-4" />,
            },
            {
                title: "Expand vocabulary",
                prompt: `How can I effectively expand my ${lang} vocabulary?`,
                icon: <Repeat className="h-4 w-4" />,
            },
            {
                title: "Common mistakes to avoid",
                prompt: `What are common mistakes ${lang} learners make and how to avoid them?`,
                icon: <XCircle className="h-4 w-4" />,
            },
        ];
    }

    return [
        {
            title: `Pronounce "${searchWord}" correctly`,
            prompt: `Break down how to pronounce "${searchWord}" in ${lang} syllable by syllable with phonetic examples. Include common mistakes learners make.`,
            icon: <Mic className="h-4 w-4" />,
        },
        {
            title: `"${searchWord}" in different contexts`,
            prompt: `Show me 5 example sentences using "${searchWord}" in ${lang} in different contexts (formal, informal, academic, conversational). Explain the nuances.`,
            icon: <BookText className="h-4 w-4" />,
        },
        {
            title: `Similar words to "${searchWord}"`,
            prompt: `What are 5 words similar in meaning or usage to "${searchWord}" in ${lang}? Explain the subtle differences with examples.`,
            icon: <Repeat className="h-4 w-4" />,
        },
        {
            title: `Common mistakes with "${searchWord}"`,
            prompt: `What are the most common mistakes ${lang} learners make when using "${searchWord}"? How can I avoid them?`,
            icon: <XCircle className="h-4 w-4" />,
        },
    ];
}

// Maps raw API errors to user-friendly messages
function getFriendlyError(err: Error): string {
    const msg = err.message ?? "";
    if (msg.includes("429")) return "You've run out of Sparks. Upgrade your plan for more.";
    if (msg.includes("503") || msg.includes("ECONNREFUSED")) return "The AI service is temporarily unavailable. Please try again shortly.";
    if (msg.includes("401") || msg.includes("403")) return "Session expired. Please refresh the page.";
    if (err.name === "TypeError" && msg.toLowerCase().includes("fetch")) return "No internet connection detected. Check your network and try again.";
    return "Something went wrong. Please try again.";
}

export function AiCompletion({
    externalPrompt,
    contextSnippet
}: {
    externalPrompt: string | null;
    contextSnippet?: string | null;
}) {
    const { query, language } = useSearchStore();
    const router = useRouter();
    const authStatus = useAuthStore((s) => s.status);
    const isGuest = authStatus !== "authenticated";
    const usageMap = useUsageStore((s) => s.usage);
    const aiStats = usageMap?.['ai_chat'] || { balance: 0, remaining: 0 };
    const outOfSparks = !isGuest && (aiStats.balance ?? 0) <= 0;

    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Stream control
    const abortControllerRef = useRef<AbortController | null>(null);
    const isLoadingRef = useRef(false); // sync ref so closures always read the latest value
    const pendingExternalPromptRef = useRef<string | null>(null); // queued prompt if one arrives mid-stream

    const complete = async (prompt: string) => {
        if (isLoadingRef.current) return;

        // Cancel any in-progress stream before starting a new one
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        isLoadingRef.current = true;
        setIsLoading(true);
        setCompletion("");
        setError(null);

        try {
            const history = branchesRef.current
                .slice(-3)
                .map(b => ({ prompt: b.prompt, response: b.response }));

            const response = await fetch("/api/v1/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    context: {
                        query,
                        transcript: contextSnippet,
                        history,
                    }
                }),
                signal: controller.signal,
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
                if (controller.signal.aborted) break;
                const chunk = decoder.decode(value, { stream: true });
                setCompletion((prev) => prev + chunk);
                // Auto-scroll to bottom as new tokens arrive
                if (scrollContentRef.current) {
                    scrollContentRef.current.scrollTop = scrollContentRef.current.scrollHeight;
                }
            }
        } catch (err: any) {
            if (err?.name === "AbortError") return; // User stopped — not an error state
            console.error("Completion error:", err);
            setError(err);
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);

            // Fire any prompt that arrived while this stream was running
            const pending = pendingExternalPromptRef.current;
            if (pending) {
                pendingExternalPromptRef.current = null;
                currentPromptRef.current = pending;
                complete(pending);
            }
        }
    };

    const handleStop = () => {
        abortControllerRef.current?.abort();
    };

    // Abort stream on unmount to prevent state updates on a dead component
    useEffect(() => {
        return () => { abortControllerRef.current?.abort(); };
    }, []);

    const [inputValue, setInputValue] = useState("");
    const currentPromptRef = useRef<string>("");
    const branchesRef = useRef<{ prompt: string; response: string }[]>([]);
    const responseContainerRef = useRef<HTMLDivElement>(null);
    const scrollContentRef = useRef<HTMLDivElement>(null);
    // Ref-based blur gradients — fixes the duplicate global ID bug when two instances render
    const topBlurRef = useRef<HTMLDivElement>(null);
    const bottomBlurRef = useRef<HTMLDivElement>(null);
    const [maxResponseHeight, setMaxResponseHeight] = useState<number>(400);
    const [canScroll, setCanScroll] = useState(false);

    const {
        currentBranch,
        totalBranches,
        currentIndex,
        addBranch,
        goToPrevious,
        goToNext,
        navigateToIndex,
        sessions,
        switchSession,
        activeSessionId,
        deleteSession,
        clearHistory,
        isHistoryLoading,
        branches
    } = useResponseHistory();

    branchesRef.current = branches;

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

    const handleLike = () => {
        toastManager.add({
            title: "Feedback Sent",
            description: "Thanks! We'll use this to improve future answers.",
            type: "success",
            timeout: 3000,
        });
    };

    const handleDislike = () => {
        toastManager.add({
            title: "Feedback Recorded",
            description: "Thanks for letting us know! We'll work on doing better.",
            type: "info",
            timeout: 3000,
        });
    };

    const smartSuggestions = useMemo(() => generateSmartSuggestions(query, language), [query, language]);

    // Auto-switch session when search query changes
    useEffect(() => {
        if (query && query.trim() !== "") {
            switchSession(query);
        }
    }, [query, switchSession]);

    // Clear live stream state when query changes — prevents old response lingering
    useEffect(() => {
        setCompletion("");
        setError(null);
    }, [query]);

    const handleSessionSelect = (sessionId: string) => {
        switchSession(sessionId);
    };

    const shouldHideSuggestions = useMemo(() => {
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
            const extraBuffer = totalBranches > 1 ? 180 : 100;

            const availableSpace = containerHeight - headerHeight - footerHeight - suggestionsHeight - extraBuffer;
            setMaxResponseHeight(Math.max(120, Math.min(availableSpace, 600)));
        };

        calculateMaxHeight();
        window.addEventListener('resize', calculateMaxHeight);
        return () => window.removeEventListener('resize', calculateMaxHeight);
    }, [shouldHideSuggestions, totalBranches]);

    useEffect(() => {
        const checkScrollable = () => {
            if (scrollContentRef.current) {
                const { scrollHeight, clientHeight } = scrollContentRef.current;
                setCanScroll(scrollHeight > clientHeight);
            }
        };

        const timeout = setTimeout(checkScrollable, 100);
        window.addEventListener('resize', checkScrollable);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', checkScrollable);
        };
    }, [completion, currentBranch, maxResponseHeight, isLoading]);

    const handleSuggestionClick = (suggestion: SmartSuggestion) => {
        if (outOfSparks) return;
        // Fire directly — don't fill the input box with the verbose prompt
        currentPromptRef.current = suggestion.prompt;
        complete(suggestion.prompt);
    };

    const handleInputSubmit = () => {
        if (outOfSparks) return;
        if (inputValue.trim()) {
            const prompt = inputValue.trim();
            currentPromptRef.current = prompt;
            complete(prompt);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleInputSubmit();
        }
    };

    // External prompt handler — queues if mid-stream instead of silently dropping
    const lastHandledPromptRef = useRef<string | null>(null);

    useEffect(() => {
        if (!externalPrompt) return;
        if (externalPrompt === lastHandledPromptRef.current) return;

        lastHandledPromptRef.current = externalPrompt;

        if (isLoadingRef.current) {
            // Queue it — complete()'s finally block will fire it
            pendingExternalPromptRef.current = externalPrompt;
            return;
        }

        currentPromptRef.current = externalPrompt;
        complete(externalPrompt);
    }, [externalPrompt]);

    // Save completed response as a branch (skip partial/stopped responses < 50 chars)
    useEffect(() => {
        if (!isLoading && completion && completion.trim().length >= 50 && currentPromptRef.current) {
            addBranch(currentPromptRef.current, completion);
        }
    }, [isLoading]);

    // Clear input after submission
    useEffect(() => {
        if (!isLoading) {
            setInputValue("");
        }
    }, [isLoading]);

    // ── Guest Gate ──────────────────────────────────────────────
    if (isGuest) {
        const features = [
            { icon: <MessageSquare className="h-5 w-5" />, title: "Smart Conversations", desc: "Ask anything about pronunciation, grammar, or vocabulary" },
            { icon: <Zap className="h-5 w-5" />, title: "Context-Aware", desc: "Get answers tailored to the word you're exploring" },
            { icon: <BookText className="h-5 w-5" />, title: "Examples & Usage", desc: "Real-world sentences and nuanced explanations" },
            { icon: <Repeat className="h-5 w-5" />, title: "Session History", desc: "Pick up where you left off across learning sessions" },
        ];

        return (
            <div className="w-full h-full flex flex-col">
                <div className="relative w-full h-full flex flex-col bg-card p-6 items-center justify-start pt-[15%] overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                            Unlock AI Assistant
                        </h2>
                        <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed max-w-sm">
                            Sign in to access your personal AI language coach — ask questions, get explanations, and level up your learning.
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-8 w-full">
                            {features.map((f, i) => (
                                <motion.div
                                    key={f.title}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-3 text-left"
                                >
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">{f.title}</p>
                                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.65 }}
                            className="flex flex-col items-center gap-3 mt-8"
                        >
                            <AuthDialog defaultTab="signup">
                                <Button size="lg" className="rounded-full gap-2 px-8 font-semibold cursor-pointer">
                                    Get Started Free
                                </Button>
                            </AuthDialog>

                            <AuthDialog defaultTab="login">
                                <Button variant="outline" size="lg" className="rounded-full px-8 font-semibold cursor-pointer">
                                    Sign In
                                </Button>
                            </AuthDialog>
                        </motion.div>

                        <p className="text-[11px] text-muted-foreground/60 mt-4">
                            Free account · No credit card required
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-card">

            <header className="relative w-full flex-shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="absolute right-0 top-0 z-20">
                    <SessionSelector
                        sessions={sessions}
                        activeSessionId={activeSessionId}
                        onSelectSession={handleSessionSelect}
                        onDeleteSession={deleteSession}
                        onClearAll={clearHistory}
                        currentQuery={query}
                        isLoading={isLoading}
                        isHistoryLoading={isHistoryLoading}
                    />
                </div>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 text-center pt-2">
                    {query ? (
                        <>Learning about <span className="text-primary">"{query}"</span></>
                    ) : "What do you want to learn?"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 sm:mt-4 max-w-lg mx-auto text-center text-xs sm:text-base">
                    {query
                        ? `Get pronunciations, examples, and detailed explanations for "${query}"`
                        : "Explore topics, get explanations, and improve your understanding—all in one place."
                    }
                </p>

                <div className="relative mt-3 sm:mt-6">
                    <div className="absolute bottom-0 left-0 right-0 flex h-px">
                        <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                        <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                    </div>
                </div>
            </header>

            <main className="w-full flex-1 flex flex-col mt-3 sm:mt-6 space-y-4 sm:space-y-6 min-h-0 overflow-y-auto px-4 sm:px-6">
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
                                        transition={{ duration: 0.4, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                        <SuggestionChip
                                            icon={suggestion.icon}
                                            text={suggestion.title}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                            <div className="w-full px-8">
                                <div className="h-px bg-border/40 my-2" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Welcome message — isHistoryLoading guard prevents flash on session restore */}
                {!isLoading && !completion && !error && !currentBranch && !isHistoryLoading && query && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full"
                    >
                        <div className="relative bg-card rounded-xl p-4 sm:p-6 text-left border-x">
                            <div className="absolute top-0 left-0 right-0 flex h-px">
                                <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                                <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                            </div>
                            <div className="text-sm sm:text-base text-card-foreground/90 leading-relaxed">
                                Hello! I'm your AI assistant. I can help you understand nuances, practice pronunciation, or generate examples for <span className="font-semibold text-primary">"{query}"</span>.
                                <br /><br />
                                Try tapping a suggestion above or type your own question below!
                            </div>
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
                            <div ref={responseContainerRef} className="relative bg-card rounded-xl p-6 text-left">
                                <div className="relative">
                                    {/* Top blur gradient — ref-based, safe with multiple instances */}
                                    {canScroll && (
                                        <div
                                            ref={topBlurRef}
                                            className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-300"
                                        />
                                    )}

                                    <div
                                        ref={scrollContentRef}
                                        style={{ maxHeight: `${maxResponseHeight}px` }}
                                        className="overflow-y-auto text-card-foreground pl-1 pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                                        onScroll={(e) => {
                                            const el = e.currentTarget;
                                            if (topBlurRef.current) {
                                                topBlurRef.current.style.opacity = el.scrollTop > 10 ? '1' : '0';
                                            }
                                            if (bottomBlurRef.current) {
                                                const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
                                                bottomBlurRef.current.style.opacity = isBottom ? '0' : '1';
                                            }
                                        }}
                                    >
                                        {error ? (
                                            /* User-friendly error with retry */
                                            <div className="flex flex-col items-center gap-3 py-2">
                                                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                                                    {getFriendlyError(error)}
                                                </p>
                                                {currentPromptRef.current && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2 rounded-full cursor-pointer"
                                                        onClick={() => complete(currentPromptRef.current)}
                                                    >
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                        Try again
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm md:text-base leading-relaxed">
                                                <Response>
                                                    {currentBranch && !isLoading
                                                        ? currentBranch.response
                                                        : completion
                                                    }
                                                </Response>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom blur gradient — ref-based */}
                                    {canScroll && (
                                        <div
                                            ref={bottomBlurRef}
                                            className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 opacity-100 transition-opacity duration-300"
                                        />
                                    )}
                                </div>

                                {!isLoading && !error && (
                                    <div className="flex flex-col items-center gap-4 mt-4 pt-4 border-t">
                                        {totalBranches > 1 && (
                                            <div className="w-full">
                                                <BranchTimeline
                                                    currentIndex={currentIndex}
                                                    branches={branches}
                                                    onSelectIndex={navigateToIndex}
                                                    onPrevious={goToPrevious}
                                                    onNext={goToNext}
                                                    isLoading={isLoading}
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            ref={copyButtonRef}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:text-primary transition-colors cursor-pointer"
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-green-500 transition-colors cursor-pointer"
                                                onClick={handleLike}
                                            >
                                                <ThumbsUp size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-red-500 transition-colors cursor-pointer"
                                                onClick={handleDislike}
                                            >
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

            <footer className="relative w-full flex-shrink-0 mt-auto px-4 pb-4 sm:px-6 sm:pb-6 pt-4">
                <div className="absolute top-0 left-0 right-0 flex h-px">
                    <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                    <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                </div>

                {outOfSparks ? (
                    <div
                        className="relative w-full cursor-pointer"
                        onClick={() => {
                            toastManager.add({
                                title: "You're out of credits",
                                description: "Upgrade your plan for more.",
                                type: "warning",
                                actionProps: {
                                    children: "Upgrade",
                                    onClick: () => router.push("/pricing"),
                                },
                            });
                        }}
                    >
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                        <div className="w-full rounded-full pl-10 pr-24 py-6 bg-muted/50 border border-border text-sm text-muted-foreground/40 select-none">
                            Ask about pronunciation, definitions, examples...
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                            <Input
                                type="text"
                                maxLength={150}
                                placeholder="Ask about pronunciation, definitions, examples..."
                                className="w-full rounded-full pl-10 pr-24 py-6 bg-muted shadow-sm border border-primary/40 focus-visible:bg-background transition-colors"
                                value={inputValue}
                                onChange={(e) => {
                                    const val = e.target.value.slice(0, 150);
                                    setInputValue(val);
                                }}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />

                            {/* Character counter — only shown when user is typing */}
                            {inputValue.length > 0 && (
                                <div className={cn(
                                    "absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-medium pointer-events-none transition-all duration-200",
                                    inputValue.length >= 150 ? "text-red-500 font-bold" : "text-muted-foreground/40"
                                )}>
                                    {inputValue.length}/150
                                </div>
                            )}

                            {/* Stop button during streaming, submit button otherwise */}
                            {isLoading ? (
                                <button
                                    onClick={handleStop}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-destructive hover:bg-destructive/80 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                                    title="Stop generating"
                                >
                                    <Square className="h-3 w-3 text-white fill-white" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleInputSubmit}
                                    disabled={!inputValue.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CornerDownLeft className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                                </button>
                            )}
                        </div>
                        <div className="text-center mt-3 px-4">
                            <p className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">
                                AI can make mistakes. Double-check important info.
                            </p>
                        </div>
                    </>
                )}
            </footer>
        </div>
    );
}
