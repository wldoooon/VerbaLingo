"use client"

import { useEffect } from "react"
import { useMeQuery } from "@/lib/authHooks"
import { useAuthStore } from "@/stores/auth-store"
import { useUsageStore } from "@/stores/usage-store"
import { apiClient } from "@/lib/apiClient"

export default function AuthSync() {
  const { data: me, isLoading } = useMeQuery()
  const setUser = useAuthStore((s) => s.setUser)
  const setStatus = useAuthStore((s) => s.setStatus)
  const currentStatus = useAuthStore((s) => s.status)
  const setAllUsage = useUsageStore((s) => s.setAllUsage)

  // Proactively refresh the access token every 25 min so it never silently expires.
  // Without this, optional-auth endpoints (search) process requests as guest after
  // the 30-min token expires — no 401 is returned, so the interceptor never kicks in,
  // and the usage store gets polluted with guest-tier limits.
  useEffect(() => {
    if (!me) return

    const silentRefresh = async () => {
      try {
        await apiClient.post("/auth/refresh")
      } catch {}
    }

    silentRefresh()
    const interval = setInterval(silentRefresh, 25 * 60 * 1000)
    return () => clearInterval(interval)
  }, [me?.id])

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
        // Clear stale usage so entitlements don't incorrectly block the user
        // with data from a previous authenticated session
        setAllUsage({})
      }
    }
  }, [me, isLoading, setUser, setStatus, currentStatus, setAllUsage])

  return null
}
