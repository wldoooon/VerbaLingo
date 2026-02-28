"use client"

import { Search, Sparkles, BookOpen, MessageSquare, Zap, ArrowRight, Crown } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { AuthDialog } from "@/components/auth-dialog"
import { Button } from "@/components/ui/button"

/**
 * SearchLimitWall
 * ===============
 * Shown inline in the search results area when an anonymous user
 * has exhausted their free searches (currently 3).
 *
 * Design philosophy:
 * - Replaces the results area (not a modal/overlay) — the user stays on the same page.
 * - The search bar above is disabled independently by the SearchBar component.
 * - Frames the limit as an "achievement" not a punishment.
 * - Lists what they GET (not what they lost).
 * - Single primary CTA → opens the AuthDialog on the signup tab.
 *
 * Architecture:
 * - Stateless — receives no props. All state comes from Zustand stores.
 * - Uses the existing AuthDialog with defaultTab="signup".
 */

const benefits = [
    {
        icon: Search,
        title: "Unlimited Searches",
        description: "Search across 14.2M video clips without limits",
    },
    {
        icon: MessageSquare,
        title: "AI Language Assistant",
        description: "Ask anything about usage, tone, and cultural nuance",
    },
    {
        icon: BookOpen,
        title: "Save & Organize",
        description: "Build your personal vocabulary from real-world clips",
    },
    {
        icon: Zap,
        title: "Track Progress",
        description: "See how your comprehension improves over time",
    },
]

// Staggered animation config for the benefits list
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export function SearchLimitWall() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center justify-center py-12 px-4 sm:px-6 min-h-[85vh]"
        >
            <div className="w-full max-w-5xl">
                {/* Main Card */}
                <div className="relative bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
                    {/* Subtle gradient background */}


                    <div className="relative p-8 sm:p-10">


                        {/* Heading — achievement framing */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-2">
                                You've explored 3 clips!
                            </h2>
                            <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                                Create a free account to continue searching across millions of real-world video clips.
                            </p>
                        </motion.div>

                        {/* Benefits list */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3 mb-8"
                        >
                            {benefits.map((benefit) => (
                                <motion.div
                                    key={benefit.title}
                                    variants={itemVariants}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/20 transition-colors"
                                >
                                    <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <benefit.icon className="w-4.5 h-4.5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-sm leading-tight">
                                            {benefit.title}
                                        </p>
                                        <p className="text-muted-foreground text-xs mt-0.5 leading-snug">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA — opens existing AuthDialog on signup tab */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            className="space-y-3"
                        >
                            <AuthDialog defaultTab="signup">
                                <Button
                                    size="lg"
                                    className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group"
                                >
                                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                                    Create Free Account
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </AuthDialog>

                            <AuthDialog defaultTab="login">
                                <button className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer">
                                    Already have an account?{" "}
                                    <span className="text-primary font-bold hover:underline">Log in</span>
                                </button>
                            </AuthDialog>
                        </motion.div>

                        {/* Trust signal */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center text-[11px] text-muted-foreground/60 mt-6 font-medium"
                        >
                            Free forever · No credit card required · 50 searches/day
                        </motion.p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
