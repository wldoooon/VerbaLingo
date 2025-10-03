"use client";
import { useCompletion } from "@ai-sdk/react";
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

export function AiCompletion() {
    const { query } = useSearchParams();
    const { completion, complete, isLoading, error } = useCompletion({
        api: "/api/v1/completion",
    });
    const [inputValue, setInputValue] = useState("");
    const currentPromptRef = useRef<string>("");
    
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
            <div className="relative w-full h-full flex flex-col bg-card rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-slate-950/50 border">
                <header className="w-full flex-shrink-0">
                    <div className="relative h-28 w-full flex items-center justify-center mb-6">
                        {/* Central Orb */}
                        <div className="absolute w-20 h-20 bg-red-400/50 rounded-full blur-xl" />
                        <div className="absolute w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-md animate-pulse" />

                        {/* Floating Cards */}
                        <div className="absolute top-2 left-0 sm:left-8">
                            <div className="bg-card/80 rounded-lg shadow-md p-2 flex items-center space-x-2 w-40 border">
                                <div className="bg-red-100 dark:bg-red-950/50 p-1 rounded-md">
                                    <Play className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-sm" />
                                    <div className="h-2 w-4/5 bg-gray-200 dark:bg-slate-700 rounded-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-0 sm:right-8">
                            <div className="bg-card/80 rounded-lg shadow-md p-2 flex items-center space-x-2 w-40 border">
                                <div className="bg-red-100 dark:bg-red-950/50 p-1 rounded-md">
                                    <Play className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-sm" />
                                    <div className="h-2 w-4/5 bg-gray-200 dark:bg-slate-700 rounded-sm" />
                                </div>
                            </div>
                        </div>
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
                </header>

                <main className="w-full flex-1 flex flex-col mt-6 space-y-6 overflow-y-auto min-h-0">
                        {/* Suggestions */}
                        <AnimatePresence>
                            {!shouldHideSuggestions && (
                                <motion.div
                                    initial={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
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
                                    <div className="bg-card rounded-xl p-6 text-left border-t border-b">
                                        <div className="relative">
                                            {/* Top blur gradient */}
                                            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-300" id="top-blur" />
                                            
                                            {/* Scrollable content */}
                                            <div 
                                                className="max-h-96 overflow-y-auto text-card-foreground pr-8"
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
                                                    <Response>
                                                        {currentBranch && !isLoading 
                                                            ? currentBranch.response 
                                                            : completion
                                                        }
                                                    </Response>
                                                </>
                                            )}
                                        </div>
                                        
                                        {/* Bottom blur gradient */}
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 opacity-100 transition-opacity duration-300" id="bottom-blur" />
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

                    <footer className="w-full flex-shrink-0 mt-6 pt-4 border-t">
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
