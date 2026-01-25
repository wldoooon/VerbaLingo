"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useLoginMutation } from "@/lib/authHooks"
import axios from "axios"

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

type LoginValues = z.infer<typeof loginSchema>

function getErrorMessage(err: unknown) {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as any
        return data?.detail || data?.message || "Authentication failed"
    }
    if (err instanceof Error) return err.message
    return "Authentication failed"
}

export function LoginForm({ onSuccess, onForgot }: { onSuccess: () => void, onForgot: () => void }) {
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
                                <button type="button" onClick={onForgot} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                                    Forgot password?
                                </button>
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
