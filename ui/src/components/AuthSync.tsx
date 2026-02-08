"use client"

import { useEffect } from "react"
import { useMeQuery } from "@/lib/authHooks"
import { useAuthStore } from "@/stores/auth-store"

export default function AuthSync() {
  const { data: me, isLoading } = useMeQuery()
  const setUser = useAuthStore((s) => s.setUser)
  const setStatus = useAuthStore((s) => s.setStatus)

  useEffect(() => {
    if (isLoading) {
      setStatus("unknown")
      return
    }

    if (me) {
      setUser(me)
      setStatus("authenticated")
    } else {
      setUser(null)
      setStatus("guest")
    }
  }, [me, isLoading, setUser, setStatus])

  return null
}
