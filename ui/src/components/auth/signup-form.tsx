"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import axios from "axios"

const signupSchema = z.object({
    // full_name: z.string().min(2, "Name must be at least 2 characters"), // REMOVED as per request
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    terms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms",
    }),
})

type SignupValues = z.infer<typeof signupSchema>

function getErrorMessage(err: unknown) {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as any
        return data?.detail || data?.message || "Authentication failed"
    }
    if (err instanceof Error) return err.message
    return "Authentication failed"
}

export function SignupForm({ onSuccess }: { onSuccess: () => void }) {
    const signupMutation = useSignupMutation()
    const loginMutation = useLoginMutation()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: "", password: "", terms: false },
    })

    async function onSubmit(values: SignupValues) {
        try {
            await signupMutation.mutateAsync({
                email: values.email,
                password: values.password,
                // full_name: values.full_name // REMOVED 
                full_name: "User" // Default for now since backend might expect it? Or backend generates it.
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
                {/* Full Name Field Removed */}

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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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

                <Button
                    type="submit"
                    disabled={isBusy}
                    className="w-full h-11 bg-orange-500 text-white hover:text-white font-bold rounded-xl cursor-pointer hover:bg-orange-500 border-0"
                >
                    {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </form>
        </Form>
    )
}
