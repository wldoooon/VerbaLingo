"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

  const isBusy = signupMutation.isPending || loginMutation.isPending

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.trim().length >= 6 && !isBusy,
    [email, password, isBusy]
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
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
              </div>

              {(signupMutation.isError || loginMutation.isError) && (
                <div className="text-sm text-destructive">
                  {getErrorMessage(error)}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isBusy ? "Creating account…" : "Sign up"}
              </Button>

              <div className="text-sm text-muted-foreground">
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
