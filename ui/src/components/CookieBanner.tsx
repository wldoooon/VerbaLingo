"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if the user has already consented
        const hasConsented = localStorage.getItem("pokispokey_cookie_consent")

        // Wait a short delay before showing the banner so it doesn't jarringly appear instantly on load
        if (!hasConsented) {
            const timeout = setTimeout(() => {
                setIsVisible(true)
            }, 1000)
            return () => clearTimeout(timeout)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem("pokispokey_cookie_consent", "true")
        setIsVisible(false)
    }

    const handleDecline = () => {
        // Even if they decline, we remember that they made a choice so we don't bother them again.
        // In a real app, you would also use this state to disable non-essential tracking scripts.
        localStorage.setItem("pokispokey_cookie_consent", "declined")
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto z-[100] sm:max-w-[400px]"
                >
                    <div className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-5 relative overflow-hidden">
                        {/* Soft glow effect behind the icon */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                        <Cookie className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-foreground text-base tracking-tight">
                                        We value your privacy
                                    </h3>
                                </div>
                                <button
                                    onClick={handleDecline}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                We use essential cookies to make PokiSpokey work, and optional cookies to remember your preferences and improve your language journey.
                                By clicking accept, you agree to our <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                            </p>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl h-10 border-border/50 font-medium hover:bg-muted"
                                    onClick={handleDecline}
                                >
                                    Decline Optional
                                </Button>
                                <Button
                                    className="flex-1 rounded-xl h-10 bg-orange-500 hover:bg-orange-600 text-white font-bold border-0 shadow-sm"
                                    onClick={handleAccept}
                                >
                                    Accept All
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
