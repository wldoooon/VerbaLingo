"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { Eye, EyeOff } from "lucide-react"
import { useLoginMutation, useMeQuery, useSignupMutation } from "@/lib/authHooks"

function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any
    return data?.detail || data?.message || "Sign up failed"
  }
  if (err instanceof Error) return err.message
  return "Sign up failed"
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get("next") || "/"

  const { data: me, isLoading: meLoading } = useMeQuery()
  const signupMutation = useSignupMutation()
  const loginMutation = useLoginMutation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const isBusy = signupMutation.isPending || loginMutation.isPending

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.trim().length >= 6 && !isBusy && termsAccepted,
    [email, password, isBusy, termsAccepted]
  )

  useEffect(() => {
    if (meLoading) return
    if (me) router.replace(nextUrl)
  }, [me, meLoading, router, nextUrl])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await signupMutation.mutateAsync({ email, password })
      // Backend signup does not set a cookie currently, so we auto-login.
      await loginMutation.mutateAsync({ email, password })
      router.replace(nextUrl)
    } catch {
      // handled by mutation state
    }
  }

  const error = signupMutation.error || loginMutation.error

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="bg-popover/70 backdrop-blur-xl border-border/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Sign up to save clips and track your progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-2 py-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pt-0.5"
                >
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {(signupMutation.isError || loginMutation.isError) && (
                <div className="text-sm text-destructive">
                  {getErrorMessage(error)}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isBusy ? "Creating account…" : "Sign up"}
              </Button>

              <div className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href={`/login?next=${encodeURIComponent(nextUrl)}`} className="text-primary hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
