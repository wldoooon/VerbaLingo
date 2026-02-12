"use client"

import { useEffect } from "react"
import { useMeQuery } from "@/lib/authHooks"
import { useAuthStore } from "@/stores/auth-store"

export default function AuthSync() {
  const { data: me, isLoading } = useMeQuery()
  const setUser = useAuthStore((s) => s.setUser)
  const setStatus = useAuthStore((s) => s.setStatus)
  const currentStatus = useAuthStore((s) => s.status)

  useEffect(() => {
    // 1. Initial Loading State
    if (isLoading && currentStatus === "unknown") {
      return
    }

    // 2. Handle Authentication Success
    if (me) {
      setUser(me)
      if (currentStatus !== "authenticated") {
        setStatus("authenticated")
      }
    } 
    // 3. Handle Guest State (only if not loading)
    else if (!isLoading) {
      setUser(null)
      if (currentStatus !== "guest") {
        setStatus("guest")
      }
    }
  }, [me, isLoading, setUser, setStatus, currentStatus])

  return null
}
