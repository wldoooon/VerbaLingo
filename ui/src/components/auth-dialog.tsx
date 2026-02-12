"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { X, Loader2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { LoginForm } from "./auth/login-form"
import { SignupForm } from "./auth/signup-form"
import { PasswordResetWizard } from "./auth/password-reset-wizard"
import { useGoogleOAuth } from "@/lib/useGoogleOAuth"

export function AuthDialog({ defaultTab = "login", children }: { defaultTab?: "login" | "signup", children?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [tab, setTab] = useState<"login" | "signup" | "forgot_password">(defaultTab)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const { openGoogleOAuth } = useGoogleOAuth()
    const queryClient = useQueryClient()

    const handleClose = () => {
        setIsOpen(false)
        setTimeout(() => setTab("login"), 300)
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true)
        try {
            const result = await openGoogleOAuth()
            if (result.success) {
                // OAuth message received - close dialog immediately
                // The global AuthSync component and useMeQuery will handle the background refetch
                handleClose()
            } else if (result.error) {
                console.error('Google OAuth failed:', result.error)
            }
        } finally {
            setIsGoogleLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || <Button>Log in</Button>}
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[440px] p-0 bg-transparent border-none shadow-none"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Authentication</DialogTitle>
                <DialogDescription className="sr-only">Login, sign up, or recover password</DialogDescription>
                <div className="relative bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 p-8 overflow-hidden">

                    {/* Google OAuth Loading Overlay */}
                    {isGoogleLoading && (
                        <div className="absolute inset-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                            <div className="relative mb-4">
                                <div className="w-12 h-12 border-4 border-slate-200 dark:border-zinc-700 rounded-full" />
                                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-orange-500 rounded-full animate-spin" />
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
                                Connecting to Google...
                            </p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                                Complete sign-in in the popup window
                            </p>
                        </div>
                    )}

                    {/* Explicit Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer z-50"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center">

                        {/* Only show Header/Social if NOT in wizard mode (optional, but cleaner) */}
                        {tab !== "forgot_password" && (
                            <>
                                {/* Header */}
                                <div className="mb-6 scale-90"></div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                                    {tab === "login" ? "Welcome Back" : "Create an account"}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-8 text-center px-4">
                                    {tab === "login"
                                        ? "Log in to continue your language mastery."
                                        : "Join 10,000+ language learners mastering fluency."}
                                </p>

                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isGoogleLoading}
                                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all group mb-6 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGoogleLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                                    ) : (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {tab === "login" ? "Log in with Google" : "Continue with Google"}
                                    </span>
                                </button>

                                <div className="relative w-full mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100 dark:border-zinc-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase">
                                        <span className="bg-white dark:bg-zinc-950 px-3 text-slate-400 font-bold tracking-widest">
                                            or {tab === "login" ? "log in" : "sign up"} with email
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Forms Container */}
                        <div className="w-full">
                            {tab === "login" ? (
                                <LoginForm onSuccess={() => setIsOpen(false)} onForgot={() => setTab("forgot_password")} />
                            ) : tab === "signup" ? (
                                <SignupForm onSuccess={() => setIsOpen(false)} />
                            ) : (
                                <PasswordResetWizard onBack={() => setTab("login")} />
                            )}
                        </div>

                        {/* Footer / Toggle (Hidden on reset) */}
                        {tab !== "forgot_password" && (
                            <div className="mt-8 text-center border-t border-slate-100 dark:border-zinc-800 pt-6 w-full">
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                                    {tab === "login" ? "Don't have an account?" : "Already have an account?"}{' '}
                                    <button
                                        onClick={() => setTab(tab === "login" ? "signup" : "login")}
                                        className="text-orange-500 hover:text-orange-600 font-bold relative cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-orange-500 hover:after:w-full after:transition-all after:duration-300"
                                    >
                                        {tab === "login" ? "Sign up" : "Log in"}
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
