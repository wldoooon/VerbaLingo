"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, RefreshCwIcon, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useForgotPasswordMutation, useResetPasswordMutation, useVerifyOtpMutation } from "@/lib/authHooks"
import axios from "axios"

const emailSchema = z.object({ email: z.string().email() })
const otpSchema = z.object({ otp: z.string().min(6, "Must be 6 digits") })
const resetSchema = z.object({ password: z.string().min(6) })

function getErrorMessage(err: unknown) {
    if (axios.isAxiosError(err)) {
        return err.response?.data?.detail || "Request failed"
    }
    return "Something went wrong"
}

export function PasswordResetWizard({ onBack }: { onBack: () => void }) {
    const [step, setStep] = useState<"email" | "otp" | "reset">("email")
    const [email, setEmail] = useState("")
    const [otpValue, setOtpValue] = useState("")
    const [otpError, setOtpError] = useState("")

    const forgotPasswordMutation = useForgotPasswordMutation()
    const verifyOtpMutation = useVerifyOtpMutation()
    const resetPasswordMutation = useResetPasswordMutation()

    // Step 1: Email Form
    const emailForm = useForm<{ email: string }>({ resolver: zodResolver(emailSchema) })
    const onEmailSubmit = async (data: { email: string }) => {
        setEmail(data.email)
        try {
            await forgotPasswordMutation.mutateAsync({ email: data.email })
            setStep("otp")
        } catch { }
    }

    // Step 3: Reset Form
    const resetForm = useForm<{ password: string }>({ resolver: zodResolver(resetSchema) })
    const onResetSubmit = async (data: { password: string }) => {
        try {
            // Using the otp from state
            await resetPasswordMutation.mutateAsync({ email, otp: otpValue, new_password: data.password })
            // Success!
            onBack()
        } catch { }
    }

    if (step === "email") {
        return (
            <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>Enter your email address and we'll send you a code.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                            <FormField
                                control={emailForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} className="h-10 text-sm" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {forgotPasswordMutation.isError && <p className="text-sm text-red-500">{getErrorMessage(forgotPasswordMutation.error)}</p>}
                            <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                                {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Code
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="px-0 justify-center">
                    <Button variant="link" onClick={onBack} size="sm" className="text-slate-500">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Login
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (step === "otp") {
        return (
            <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Enter Code</CardTitle>
                    <CardDescription>
                        We sent a code to <span className="font-medium text-foreground">{email}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">6-digit code</label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                                    onClick={() => forgotPasswordMutation.mutate({ email })}
                                >
                                    {forgotPasswordMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCwIcon className="mr-1 w-3 h-3" />}
                                    Resend
                                </Button>
                            </div>
                            <InputOTP
                                maxLength={6}
                                value={otpValue}
                                onChange={(value) => {
                                    setOtpValue(value)
                                    setOtpError("")
                                }}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            {otpError && <p className="text-sm text-red-500 mt-2">{otpError}</p>}
                        </div>
                        {verifyOtpMutation.isError && <p className="text-sm text-red-500">{getErrorMessage(verifyOtpMutation.error)}</p>}
                        <Button
                            type="button"
                            className="w-full"
                            disabled={verifyOtpMutation.isPending}
                            onClick={async () => {
                                if (otpValue.length !== 6) {
                                    setOtpError("Code must be 6 digits")
                                    return
                                }
                                try {
                                    await verifyOtpMutation.mutateAsync({ email, otp: otpValue })
                                    setStep("reset")
                                } catch { }
                            }}
                        >
                            {verifyOtpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify Code
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="px-0 justify-center">
                    <Button variant="link" onClick={() => setStep("email")} size="sm" className="text-slate-500">
                        Change Email
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle>New Password</CardTitle>
                <CardDescription>Secure your account with a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                        <FormField
                            control={resetForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} className="h-10" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {resetPasswordMutation.isError && <p className="text-sm text-red-500">{getErrorMessage(resetPasswordMutation.error)}</p>}
                        <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                            {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reset Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
