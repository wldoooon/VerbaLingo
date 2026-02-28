"use client"

import { Navigation } from "@/components/Navigation"
import { useAuthStore } from "@/stores/auth-store"

function emailToName(email: string) {
  const local = email.split("@")[0] || "User"
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export default function NavigationWrapper() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  const displayUser =
    status === "authenticated" && user
      ? {
          name: emailToName(user.email),
          email: user.email,
          avatar: "/avatars/user.jpg",
        }
      : {
          name: "Guest",
          email: "guest@Pokispokey.com",
          avatar: "/avatars/user.jpg",
        }

  return <Navigation user={displayUser} />
}

