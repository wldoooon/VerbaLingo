"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useLoginMutation, useMeQuery, useSignupMutation } from "@/lib/authHooks"

// 1. The Schema (The Law)
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
})

type SignupValues = z.infer<typeof signupSchema>

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

  // 2. The Hook (The Brain)
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      terms: false,
    },
  })

  // Local UI state
  const [showPassword, setShowPassword] = useState(false)

  const isBusy = signupMutation.isPending || loginMutation.isPending

  // Side Effect: Redirect if already logged in
  if (!meLoading && me) {
    router.replace(nextUrl)
  }

  // 3. The Handler (The Action)
  async function onSubmit(values: SignupValues) {
    try {
      await signupMutation.mutateAsync({ email: values.email, password: values.password })
      // Auto-login after signup
      await loginMutation.mutateAsync({ email: values.email, password: values.password })
      router.replace(nextUrl)
    } catch {
      // Errors handled by mutation state, displayed below
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
            {/* 4. The Form (The Body) */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                            className="pr-10"
                            {...field}
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms Checkbox */}
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 py-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="translate-y-[2px]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal text-muted-foreground block leading-tight">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline underline-offset-4">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                            Privacy Policy
                          </Link>
                          .
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* General Error Message */}
                {(signupMutation.isError || loginMutation.isError) && (
                  <div className="text-sm text-destructive font-medium">
                    {getErrorMessage(error)}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isBusy}>
                  {isBusy ? "Creating account…" : "Sign up"}
                </Button>

                <div className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Link href={`/login?next=${encodeURIComponent(nextUrl)}`} className="text-primary hover:underline">
                    Log in
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
