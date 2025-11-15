"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "@/context/SearchParamsContext";
import { Button } from "@/components/ui/button";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { ThumbsDown, ThumbsUp, Copy, Mic, BookText, Repeat, XCircle, Search, CornerDownLeft, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SuggestionChip } from "@/components/suggestion-chip";
import { AiAssistantSkeleton } from "@/components/ai-assistant-skeleton";
import { useResponseHistory } from "@/hooks/useResponseHistory";
import { useCompletion } from "@ai-sdk/react";

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
    const { query } = useSearchParams();
    const { completion, complete, isLoading, error } = useCompletion({
        api: "/api/v1/completion",
    });
    const [inputValue, setInputValue] = useState("");
    const currentPromptRef = useRef<string>("");
    const responseContainerRef = useRef<HTMLDivElement>(null);
    const [maxResponseHeight, setMaxResponseHeight] = useState<number>(400);
    
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
    } = useResponseHistory();

    const smartSuggestions = useMemo(() => generateSmartSuggestions(query), [query]);

    const shouldHideSuggestions = useMemo(() => {
        return isLoading;
    }, [isLoading]);

    // Calculate available space dynamically
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
            
            // Calculate available space (leaving some padding)
            const availableSpace = containerHeight - headerHeight - footerHeight - suggestionsHeight - 100;
            setMaxResponseHeight(Math.max(200, Math.min(availableSpace, 600)));
        };

        calculateMaxHeight();
        window.addEventListener('resize', calculateMaxHeight);
        return () => window.removeEventListener('resize', calculateMaxHeight);
    }, [shouldHideSuggestions]);

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
    }, [externalPrompt, complete]);

    // Store completed response as a branch
    useEffect(() => {
        if (!isLoading && completion && completion.trim() && currentPromptRef.current) {
            addBranch(currentPromptRef.current, completion);
        }
    }, [isLoading, completion, addBranch]);

    // Clear input after submission
    useEffect(() => {
        if (!isLoading) {
            setInputValue("");
        }
    }, [isLoading]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="relative w-full h-full flex flex-col bg-card rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-slate-950/50 border-t">
                {/* Top gradient border */}
                <div className="absolute top-0 left-0 right-0 flex h-px">
                    <div className="w-1/2 bg-gradient-to-r from-transparent via-primary/50 to-primary"></div>
                    <div className="w-1/2 bg-gradient-to-l from-transparent via-primary/50 to-primary"></div>
                </div>

                {/* Left fading border for outer card - matches right side */}
                <div className="pointer-events-none absolute top-0 bottom-0 left-0 flex flex-col w-px">
                    <div className="h-1/2 bg-gradient-to-t from-border to-transparent" />
                    <div className="h-1/2 bg-gradient-to-b from-border to-transparent" />
                </div>

                {/* Bottom fading border for outer card */}
                <div className="absolute bottom-0 left-0 right-0 flex h-px">
                    <div className="w-1/2 bg-gradient-to-r from-transparent to-border" />
                    <div className="w-1/2 bg-gradient-to-l from-transparent to-border" />
                </div>

                {/* Right vertical gradient border - fade from center to edges */}
                <div className="absolute top-0 bottom-0 right-0 flex flex-col w-px">
                    <div className="h-1/2 bg-gradient-to-t from-border to-transparent"></div>
                    <div className="h-1/2 bg-gradient-to-b from-border to-transparent"></div>
                </div>
                
                <header className="w-full flex-shrink-0">
                    <div className="relative h-28 w-full flex items-center justify-center mb-6">
                        {/* Animated rings around the orb */}
                        <div className="absolute w-32 h-32 rounded-full border-2 border-red-400/20 animate-ping" style={{ animationDuration: '3s' }} />
                        <div className="absolute w-24 h-24 rounded-full border-2 border-red-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                        
                        {/* Central Orb with enhanced glow */}
                        <div className="absolute w-20 h-20 bg-red-400/50 rounded-full blur-xl animate-pulse" />
                        <div className="absolute w-16 h-16 bg-red-400/30 rounded-full blur-lg animate-pulse" style={{ animationDuration: '2s' }} />
                        <div className="absolute w-14 h-14 bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-full shadow-lg animate-pulse shadow-red-500/50">
                            {/* Sparkle effect inside orb */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent" />
                        </div>

                        {/* Floating Cards with enhanced animations - overlapping closely with orb */}
                        <motion.div 
                            className="absolute top-1/2 -translate-y-1/2 left-8 sm:left-25 z-10"
                            animate={{ 
                                y: [-4, 4, -4],
                                rotate: [-2, 2, -2]
                            }}
                            transition={{ 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="bg-card/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center space-x-2 w-40 border border-red-200/50 dark:border-red-900/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <motion.div 
                                    className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950/50 dark:to-red-900/50 p-1 rounded-md"
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, 0]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Play className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </motion.div>
                                <div className="space-y-1.5 flex-1">
                                    <motion.div 
                                        className="h-2 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-sm"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <motion.div 
                                        className="h-2 w-4/5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-sm"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            className="absolute top-1/2 -translate-y-1/2 right-8 sm:right-20 z-10"
                            animate={{ 
                                y: [4, -4, 4],
                                rotate: [2, -2, 2]
                            }}
                            transition={{ 
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="bg-card/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center space-x-2 w-40 border border-red-200/50 dark:border-red-900/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <motion.div 
                                    className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950/50 dark:to-red-900/50 p-1 rounded-md"
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, -5, 0]
                                    }}
                                    transition={{ 
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Play className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </motion.div>
                                <div className="space-y-1.5 flex-1">
                                    <motion.div 
                                        className="h-2 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-sm"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2.2, repeat: Infinity }}
                                    />
                                    <motion.div 
                                        className="h-2 w-4/5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-sm"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Floating particles around orb */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-red-400 rounded-full"
                                animate={{
                                    x: [0, Math.cos(i * 60 * Math.PI / 180) * 40, 0],
                                    y: [0, Math.sin(i * 60 * Math.PI / 180) * 40, 0],
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 text-center">
                        {query ? `Learning about "${query}"` : "What do you want to learn?"}
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
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                            ) : (completion || error) && (
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
                                            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-300" id="top-blur" />
                                            
                                            {/* Scrollable content */}
                                            <div 
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
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 opacity-100 transition-opacity duration-300" id="bottom-blur" />
                                    </div>
                                    
                                    {/* Bottom gradient border */}
                                    <div className="absolute -bottom-px left-0 right-0 flex h-px">
                                        <div className="w-1/2 bg-gradient-to-r from-transparent to-border"></div>
                                        <div className="w-1/2 bg-gradient-to-l from-transparent to-border"></div>
                                    </div>
                                    
                                    {!isLoading && !error && (
                                        <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t">
                                            {/* Branch Navigation - Only show if we have multiple branches */}
                                            {totalBranches > 1 && (
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8"
                                                        onClick={goToPrevious}
                                                        disabled={!canGoBack}
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </Button>
                                                    <span className="text-xs text-muted-foreground font-medium tabular-nums">
                                                        {currentIndex + 1} of {totalBranches}
                                                    </span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8"
                                                        onClick={goToNext}
                                                        disabled={!canGoForward}
                                                    >
                                                        <ChevronRight size={16} />
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            {/* Spacer if no navigation */}
                                            {totalBranches <= 1 && <div />}
                                            
                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Copy size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <ThumbsUp size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                className="w-full rounded-full pl-10 pr-10 py-6 bg-card shadow-sm"
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
                    </footer>
                </div>
        </div>
    );
}
