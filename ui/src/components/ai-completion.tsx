"use client";
import { useCompletion } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { TextGif } from "@/components/comm/GifText";
import { Button } from "@/components/ui/button";
import { Suggestions, Suggestion } from "@/components/ui/shadcn-io/ai/suggestion";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { ThumbsDown, ThumbsUp, Copy } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ModelSelector from "@/components/comm/ModelSelector";

export function AiCompletion() {
    const { completion, complete, isLoading, error } = useCompletion({
        api: "/api/v1/completion",
    });
    const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");
    const [clickedSuggestion, setClickedSuggestion] = useState<string | null>(null);

    const handleGenerate = () => {
        const prompt = "Tell me a fun fact about the ocean.";
        complete(prompt);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setClickedSuggestion(suggestion);
        complete(suggestion);
    };

    return (
        <div className="w-full h-full">
            <Card className="h-full flex flex-col border-t-0 rounded-none border-b-0">
                    <CardHeader>
                        <div className="flex items-center justify-start w-full">
                            
                                <TextGif
                                    gifUrl="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHF5Y3JnMTg0ZDB0NGM4MDI1c2djZGxtem45eHF3ZTdnZ3Z2bTJhMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PnTG1y3MMveevPpe13/giphy.gif"
                                    text="What can i help you with today ?"
                                    size="sm"
                                    weight="medium"
                                />
                            
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                       <div className="pt-0">
                            <div className="flex flex-col items-center">
                                
                                
                                
                            </div>

                            <div className="mt-4">
                                <Suggestions>
                                    <Suggestion
                                        suggestion="What is the weather today?"
                                        onClick={handleSuggestionClick}
                                        disabled={isLoading}
                                    >
                                        {isLoading && clickedSuggestion === "What is the weather today?" ? "Generating..." : "What is the weather today?"}
                                    </Suggestion>
                                    <Suggestion
                                        suggestion="Give me a simple recipe for pasta."
                                        onClick={handleSuggestionClick}
                                        disabled={isLoading}
                                    >
                                        {isLoading && clickedSuggestion === "Give me a simple recipe for pasta." ? "Generating..." : "Give me a simple recipe for pasta."}
                                    </Suggestion>
                                    <Suggestion
                                        suggestion="Explain the theory of relativity in simple terms."
                                        onClick={handleSuggestionClick}
                                        disabled={isLoading}
                                    >
                                        {isLoading && clickedSuggestion === "Explain the theory of relativity in simple terms." ? "Generating..." : "Explain the theory of relativity in simple terms."}
                                    </Suggestion>
                                    <Suggestion
                                        suggestion="What are some good books to read?"
                                        onClick={handleSuggestionClick}
                                        disabled={isLoading}
                                    >
                                        {isLoading && clickedSuggestion === "What are some good books to read?" ? "Generating..." : "What are some good books to read?"}
                                    </Suggestion>
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
