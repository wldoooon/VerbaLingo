"use client"

import { Navigation } from "@/components/Navigation"
import { useAuthStore } from "@/stores/authStore"

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
          email: "guest@verbalingo.com",
          avatar: "/avatars/user.jpg",
        }

  return <Navigation user={displayUser} />
}
