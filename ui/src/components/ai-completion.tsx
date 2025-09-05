"use client";
import { useCompletion } from "@ai-sdk/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import Threads from "./Threads"; // Assuming Threads.tsx is in the same directory
import AnimatedContent from "./AnimatedContent";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const OPENAI_ICON = (
    <>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 256 260"
            aria-label="OpenAI Icon"
            className="w-4 h-4 dark:hidden block"
        >
            <title>OpenAI Icon Light</title>
            <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
        </svg>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 256 260"
            aria-label="OpenAI Icon"
            className="w-4 h-4 hidden dark:block"
        >
            <title>OpenAI Icon Dark</title>
            <path
                fill="#fff"
                d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
            />
        </svg>
    </>
);

export function AiCompletion() {
    const { completion, complete, isLoading, error } = useCompletion({
        api: "/api/v1/completion",
    });
    const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");

    const AI_MODELS = [
        "o3-mini",
        "Gemini 2.5 Flash",
        "Claude 3.5 Sonnet",
        "GPT-4-1 Mini",
        "GPT-4-1",
    ];

    const MODEL_ICONS: Record<string, React.ReactNode> = {
        "o3-mini": OPENAI_ICON,
        "Gemini 2.5 Flash": (
            <svg
                height="1em"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Gemini</title>
                <defs>
                    <linearGradient
                        id="lobe-icons-gemini-fill"
                        x1="0%"
                        x2="68.73%"
                        y1="100%"
                        y2="30.395%"
                    >
                        <stop offset="0%" stopColor="#1C7DFF" />
                        <stop offset="52.021%" stopColor="#1C69FF" />
                        <stop offset="100%" stopColor="#F0DCD6" />
                    </linearGradient>
                </defs>
                <path
                    d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
                    fill="url(#lobe-icons-gemini-fill)"
                    fillRule="nonzero"
                />
            </svg>
        ),
        "Claude 3.5 Sonnet": (
            <>
                <svg
                    fill="#000"
                    fillRule="evenodd"
                    className="w-4 h-4 dark:hidden block"
                    viewBox="0 0 24 24"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <title>Anthropic Icon Light</title>
                    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
                </svg>
                <svg
                    fill="#fff"
                    fillRule="evenodd"
                    className="w-4 h-4 hidden dark:block"
                    viewBox="0 0 24 24"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <title>Anthropic Icon Dark</title>
                    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
                </svg>
            </>
        ),
        "GPT-4-1 Mini": OPENAI_ICON,
        "GPT-4-1": OPENAI_ICON,
    };

    const handleGenerate = () => {
        const prompt = "Tell me a fun fact about the ocean.";
        complete(prompt);
    };

    return (
        <div className="w-full max-w-md">
            <AnimatedContent
                distance={150}
                direction="vertical"
                reverse={false}
                duration={2.5}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity
                scale={1}
                threshold={0}
                delay={0.3}
            >
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedModel}
                                            initial={{
                                                opacity: 0,
                                                y: -5,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 5,
                                            }}
                                            transition={{
                                                duration: 0.15,
                                            }}
                                            className="flex items-center gap-1"
                                        >
                                            {
                                                MODEL_ICONS[
                                                selectedModel
                                                ]
                                            }
                                            {selectedModel}
                                            <ChevronDown className="w-3 h-3 opacity-50" />
                                        </motion.div>
                                    </AnimatePresence>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className={cn(
                                    "min-w-[10rem]",
                                    "border-black/10 dark:border-white/10",
                                    "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
                                )}
                            >
                                {AI_MODELS.map((model) => (
                                    <DropdownMenuItem
                                        key={model}
                                        onSelect={() =>
                                            setSelectedModel(model)
                                        }
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            {MODEL_ICONS[model] || (
                                                <Bot className="w-4 h-4 opacity-50" />
                                            )}
                                            <span>{model}</span>
                                        </div>
                                        {selectedModel ===
                                            model && (
                                                <Check className="w-4 h-4 text-blue-500" />
                                            )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-zinc-400">VerbaLingo AI Asistant</span>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        style={{ width: 'calc(100% + 3rem)', height: '100px', position: 'relative', left: '-1.5rem', top: '-1.5rem' }}
                    >
                        <Threads
                            amplitude={2}
                            distance={0}
                            enableMouseInteraction={true}
                        />
                    </motion.div>
                    <div className="pt-0 px-8 pb-8">
                        <div className="flex flex-col items-center">
                            <h1 className="text-2xl font-bold text-white mt-[-1rem]">AI Assistant</h1>
                            <p className="text-center text-gray-300 mt-2">Click the button to get a fun fact!</p>
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="rounded-full bg-blue-500/50 px-6 py-3 text-white font-semibold hover:bg-blue-500/80 transition-colors disabled:opacity-50 mt-4"
                            >
                                {isLoading ? 'Generating…' : 'Ask AI'}
                            </button>
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
                                            <Markdown remarkPlugins={[remarkGfm]}>{completion}</Markdown>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </AnimatedContent>
        </div>
    );
}
