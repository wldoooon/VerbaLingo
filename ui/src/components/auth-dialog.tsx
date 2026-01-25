"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Chrome } from "lucide-react"
import { LoginForm } from "./auth/login-form"
import { SignupForm } from "./auth/signup-form"
import { PasswordResetWizard } from "./auth/password-reset-wizard"

export function AuthDialog({ defaultTab = "login", children }: { defaultTab?: "login" | "signup", children?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [tab, setTab] = useState<"login" | "signup" | "forgot_password">(defaultTab)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || <Button>Log in</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] p-8 bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 animate-scale-in overflow-hidden">
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

                            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all group mb-6 shadow-sm">
                                <Chrome className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors" />
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
                                    className="text-slate-900 dark:text-slate-100 font-bold hover:underline"
                                >
                                    {tab === "login" ? "Sign up" : "Log in"}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
