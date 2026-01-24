"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useLoginMutation, useMeQuery } from "@/lib/authHooks"

function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any
    return data?.detail || data?.message || "Login failed"
  }
  if (err instanceof Error) return err.message
  return "Login failed"
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get("next") || "/"

  const { data: me, isLoading: meLoading } = useMeQuery()
  const loginMutation = useLoginMutation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.trim().length > 0 && !loginMutation.isPending,
    [email, password, loginMutation.isPending]
  )

  useEffect(() => {
    if (meLoading) return
    if (me) router.replace(nextUrl)
  }, [me, meLoading, router, nextUrl])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await loginMutation.mutateAsync({ email, password })
      router.replace(nextUrl)
    } catch {
      // handled by mutation state
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="bg-popover/70 backdrop-blur-xl border-border/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Log in to save clips and personalize your learning.</CardDescription>
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>

              {loginMutation.isError && (
                <div className="text-sm text-destructive">
                  {getErrorMessage(loginMutation.error)}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {loginMutation.isPending ? "Logging in…" : "Log in"}
              </Button>

              <div className="text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link href={`/signup?next=${encodeURIComponent(nextUrl)}`} className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
