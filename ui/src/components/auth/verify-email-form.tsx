"use client"

import { useState } from "react"
import { Loader2, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useVerifyEmailMutation, useSignupMutation } from "@/lib/authHooks"
import { useRateLimitCountdown } from "@/hooks/useRateLimitCountdown"
import axios from "axios"

function getErrorMessage(err: unknown) {
    if (axios.isAxiosError(err)) {
        return err.response?.data?.detail || "Request failed"
    }
    return "Something went wrong"
}

interface VerifyEmailFormProps {
    email: string
    password: string
    onSuccess: () => void
    onBack: () => void
}

export function VerifyEmailForm({ email, password, onSuccess, onBack }: VerifyEmailFormProps) {
    const [otpValue, setOtpValue] = useState("")
    const [otpError, setOtpError] = useState("")

    // /auth/verify-email sets the auth cookie directly — no separate login step needed!
    const verifyMutation = useVerifyEmailMutation()
    const signupMutation = useSignupMutation()
    const verifyRateLimit = useRateLimitCountdown(verifyMutation.error)

    const handleResend = () => {
        signupMutation.mutate({ email, password, full_name: "User" })
    }

    return (
        <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl font-bold">Verify your email</CardTitle>
                <CardDescription className="text-sm">
                    Enter the verification code we sent to: <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4">
                {/* Label Row */}
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-foreground">Verification code</label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs rounded-md bg-orange-500 text-white hover:text-white hover:bg-orange-600 border-0 font-bold cursor-pointer"
                        onClick={handleResend}
                        disabled={signupMutation.isPending}
                    >
                        {signupMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCwIcon className="w-3 h-3 mr-1" />}
                        Resend Code
                    </Button>
                </div>

                {/* OTP Input — same style as password-reset-wizard */}
                <div className="flex justify-center">
                    <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={(value) => {
                            setOtpValue(value)
                            setOtpError("")
                        }}
                    >
                        <InputOTPGroup className="gap-1">
                            <InputOTPSlot index={0} className="w-12 h-14 text-xl rounded-lg border-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-100" />
                            <InputOTPSlot index={1} className="w-12 h-14 text-xl rounded-lg border-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-100" />
                            <InputOTPSlot index={2} className="w-12 h-14 text-xl rounded-lg border-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-100" />
                        </InputOTPGroup>
                        <InputOTPSeparator className="mx-2 text-muted-foreground">—</InputOTPSeparator>
                        <InputOTPGroup className="gap-1">
                            <InputOTPSlot index={3} className="w-12 h-14 text-xl rounded-lg border-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-100" />
                            <InputOTPSlot index={4} className="w-12 h-14 text-xl rounded-lg border-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-100" />
                            <InputOTPSlot index={5} className="w-12 h-14 text-xl rounded-lg border-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-100" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {otpError && <p className="text-sm text-red-500 text-center">{otpError}</p>}
                {verifyMutation.isError && (
                    <p className="text-sm text-red-500 text-center">
                        {verifyRateLimit ?? getErrorMessage(verifyMutation.error)}
                    </p>
                )}
            </CardContent>

            {/* Divider + Verify Button */}
            <div className="border-t border-border pt-4 mt-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 bg-orange-500 text-white hover:text-white font-bold rounded-xl cursor-pointer hover:bg-orange-500 border-0"
                    disabled={verifyMutation.isPending}
                    onClick={async () => {
                        if (otpValue.length !== 6) {
                            setOtpError("Code must be 6 digits")
                            return
                        }
                        try {
                            // Backend verifies OTP + sets auth cookie all in one request!
                            await verifyMutation.mutateAsync({ email, otp: otpValue })
                            onSuccess()
                        } catch { }
                    }}
                >
                    {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Sign In
                </Button>
            </div>

            {/* Footer */}
            <CardFooter className="px-0 pt-4 justify-center">
                <p className="text-xs text-muted-foreground">
                    Wrong email?{' '}
                    <button
                        onClick={onBack}
                        className="text-orange-500 hover:text-orange-600 font-medium relative cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-orange-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                        Back to sign up
                    </button>
                </p>
            </CardFooter>
        </Card>
    )
}
