export type UserTier = "free" | "pro"

export type UserRead = {
  id: string
  email: string
  is_active: boolean
  tier: UserTier
  created_at: string
}

export type LoginResponse = {
  message: string
  user: {
    id: string
    email: string
    tier: UserTier
  }
}

export type SignupResponse = UserRead
