"use client"

import { FeedbackDialog } from "@/components/feedback-dialog"
import { HeaderUserProfile } from "@/components/header-user-profile"

export function HeaderToolbar({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  return (
    <div className="flex items-center gap-3">
      <FeedbackDialog />
      <HeaderUserProfile user={user} />
    </div>
  )
}