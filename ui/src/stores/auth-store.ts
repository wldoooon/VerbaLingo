"use client"

import { create } from "zustand"
import type { UserRead } from "@/lib/authTypes"

export type AuthStatus = "unknown" | "authenticated" | "guest"

type AuthState = {
  status: AuthStatus
  user: UserRead | null
  setUser: (user: UserRead | null) => void
  setStatus: (status: AuthStatus) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  user: null,
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
}))
