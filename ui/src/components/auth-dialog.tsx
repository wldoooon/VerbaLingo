"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2, Chrome, Check } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useLoginMutation, useSignupMutation } from "@/lib/authHooks"

// --- SCHEMAS ---
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    terms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms",
    }),
})

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof signupSchema>

// --- UTILS ---
function getErrorMessage(err: unknown) {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as any
        return data?.detail || data?.message || "Authentication failed"
    }
    if (err instanceof Error) return err.message
    return "Authentication failed"
}

export function AuthDialog({ defaultTab = "login", children }: { defaultTab?: "login" | "signup", children?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [tab, setTab] = useState<"login" | "signup">(defaultTab)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || <Button>Log in</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] p-8 bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 animate-scale-in overflow-hidden">
                <div className="flex flex-col items-center">
                    {/* Header */}
                    <div className="mb-6 scale-90">
                         {/* Logo removed as requested */}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                        {tab === "login" ? "Welcome Back" : "Create an account"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-8 text-center px-4">
                        {tab === "login"
                            ? "Log in to continue your language mastery."
                            : "Join 10,000+ language learners mastering fluency."}
                    </p>

                    {/* Social Auth */}
                    <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all group mb-6 shadow-sm">
                        <Chrome className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {tab === "login" ? "Log in with Google" : "Continue with Google"}
                        </span>
                    </button>

                    {/* Divider */}
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

                    {/* Forms */}
                    <div className="w-full">
                        {tab === "login" ? (
                            <LoginForm onSuccess={() => setIsOpen(false)} />
                        ) : (
                            <SignupForm onSuccess={() => setIsOpen(false)} />
                        )}
                    </div>

                    {/* Footer / Toggle */}
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
                </div>
            </DialogContent>
        </Dialog>
    )
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
    const loginMutation = useLoginMutation()
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    const [showPassword, setShowPassword] = useState(false)

    async function onSubmit(values: LoginValues) {
        try {
            await loginMutation.mutateAsync(values)
            onSuccess()
        } catch { }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                            <FormControl>
                                <Input
                                    placeholder="name@company.com"
                                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm h-auto"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                            </div>

                            <FormControl>
                                <div className="relative group">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium text-sm h-auto pr-10"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <div className="flex justify-end">
                                <Link href="#" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {loginMutation.isError && (
                    <div className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                        {getErrorMessage(loginMutation.error)}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm mt-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                </button>
            </form>
        </Form>
    )
}

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
    const signupMutation = useSignupMutation()
    const loginMutation = useLoginMutation()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { full_name: "", email: "", password: "", terms: false },
    })

    async function onSubmit(values: SignupValues) {
        try {
            await signupMutation.mutateAsync({
                email: values.email,
                password: values.password,
                full_name: values.full_name
            })
            await loginMutation.mutateAsync({ email: values.email, password: values.password })
            onSuccess()
        } catch { }
    }

    const isBusy = signupMutation.isPending || loginMutation.isPending
    const error = signupMutation.error || loginMutation.error

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                            <FormControl>
                                <Input
                                    placeholder="John Doe"
                                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm h-auto"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                            <FormControl>
                                <Input
                                    placeholder="name@company.com"
                                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm h-auto"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                            <FormControl>
                                <div className="relative group">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm h-auto pr-10"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                        <FormItem className="py-2">
                            <div className="flex items-start gap-2">
                                <FormControl>
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${field.value ? 'bg-primary border-primary text-white' : 'bg-slate-50 border-slate-300'}`} onClick={() => field.onChange(!field.value)}>
                                        {field.value && <Check className="w-3 h-3" />}
                                    </div>
                                </FormControl>
                                <div className="text-xs text-slate-500 leading-snug">
                                    I agree to the <Link href="/terms" className="text-slate-900 dark:text-slate-100 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-slate-900 dark:text-slate-100 font-bold hover:underline">Privacy Policy</Link>.
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {(signupMutation.isError || loginMutation.isError) && (
                    <div className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                        {getErrorMessage(error)}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm mt-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </button>
            </form>
        </Form>
    )
}
