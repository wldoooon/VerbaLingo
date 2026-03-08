"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, Compass } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center max-w-2xl"
            >
                <div className="relative mb-8">
                    <motion.h1
                        className="relative z-10 text-[120px] sm:text-[180px] md:text-[220px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/80 to-transparent opacity-10 select-none"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        404
                    </motion.h1>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4"
                >
                    Lost in Translation?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg text-muted-foreground mb-10 max-w-md"
                >
                    We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
                >
                    <Link href="/">
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 cursor-pointer">
                            <Home className="w-5 h-5" />
                            Go back home
                        </button>
                    </Link>
                </motion.div>

            </motion.div>
        </div>
    );
}
