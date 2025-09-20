"use client";
import { useCompletion } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import Threads from "./Threads";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Suggestions, Suggestion } from "@/components/ui/shadcn-io/ai/suggestion";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { ThumbsDown, ThumbsUp, Copy } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ModelSelector from "@/components/comm/ModelSelector";
import SiriOrb from "@/components/comm/siri";

export function AiCompletion() {
    const { completion, complete, isLoading, error } = useCompletion({
        api: "/api/v1/completion",
    });
    const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");

    const handleGenerate = () => {
        const prompt = "Tell me a fun fact about the ocean.";
        complete(prompt);
    };

    const handleSuggestionClick = (suggestion: string) => {
        complete(suggestion);
    };

    return (
        <div className="w-full h-full">
            <Card className="h-full flex flex-col border-t-0 rounded-none border-b-0">
                    <CardHeader>
                        <div className="flex items-center justify-start">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <CardTitle className="text-xs font-medium text-zinc-400">VerbaLingo AI Asistant</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                       <div className="pt-0">
                            <div className="flex flex-col items-center">
                                <SiriOrb size="96px" />
                                <h1 className="text-2xl font-bold text-white mt-4">AI Assistant</h1>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="mt-4"
                                >
                                    {isLoading ? 'Generating…' : 'Ask AI'}
                                </Button>
                            </div>

                            <div className="mt-4">
                                <Suggestions>
                                    <Suggestion
                                        suggestion="What is the weather today?"
                                        onClick={handleSuggestionClick}
                                    />
                                    <Suggestion
                                        suggestion="Give me a simple recipe for pasta."
                                        onClick={handleSuggestionClick}
                                    />
                                    <Suggestion
                                        suggestion="Explain the theory of relativity in simple terms."
                                        onClick={handleSuggestionClick}
                                    />
                                    <Suggestion
                                        suggestion="What are some good books to read?"
                                        onClick={handleSuggestionClick}
                                    />
                                </Suggestions>
                            </div>

                            <AnimatePresence>
                                {(completion || error) && (
                                    <motion.div
                                        key="completion"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="mt-6 pt-6 border-t border-white/20"
                                    >
                                        <h2 className="text-xl font-bold mb-4 text-white">Response:</h2>
                                        <div className="text-gray-200">
                                            {error ? (
                                                <p className="text-red-500">{error.message}</p>
                                            ) : (
                                                <Response>{completion}</Response>
                                            )}
                                            <div className="flex items-center justify-end gap-2 mt-4">
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><Copy size={14} /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><ThumbsUp size={14} /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><ThumbsDown size={14} /></Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
                    </CardFooter>
                </Card>
        </div>
    );
}
