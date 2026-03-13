"use client"

import { motion } from "framer-motion"
import { Search, Compass, BookOpen, Mic } from "lucide-react"

interface NoResultsProps {
    query: string
}

export function NoResults({ query }: NoResultsProps) {
    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 min-h-[60vh]">
            <div className="w-full max-w-4xl">
                <div className="relative bg-card/50 border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden group hover:border-primary/30 transition-all">
                    {/* Decorative background Search icon - matching Context Engine™ style */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Search className="w-64 h-64 text-primary transform rotate-12 translate-x-12 -translate-y-12" />
                    </div>

                    <div className="relative p-12 sm:p-20 text-center flex flex-col items-center">
                        {/* Simple animated icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8"
                        >
                            <Search className="w-10 h-10 text-primary" />
                        </motion.div>

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-3">
                                No clips found
                            </h2>
                            <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                                We couldn't find any exact matches for <span className="font-bold text-foreground underline decoration-primary/30 underline-offset-4">"{query}"</span>. <br />
                                Please check your spelling or try another word.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
