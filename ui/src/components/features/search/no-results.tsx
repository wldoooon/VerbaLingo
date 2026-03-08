"use client"

import { motion } from "framer-motion"
import { Search, Compass, BookOpen, Mic } from "lucide-react"

interface NoResultsProps {
    query: string
}

export function NoResults({ query }: NoResultsProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            {/* Simple animated icon */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6"
            >
                <Search className="w-8 h-8 text-muted-foreground" />
            </motion.div>

            {/* Text Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                    No videos found
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
                    We couldn't find any exact matches for <span className="font-medium text-foreground">"{query}"</span>. Please check your spelling or try another word.
                </p>
            </motion.div>
        </div>
    )
}
