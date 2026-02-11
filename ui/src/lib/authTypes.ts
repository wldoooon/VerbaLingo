export type UserTier = "free" | "pro"

export type FeatureUsage = {
  current: number;
  limit: number;
  remaining: number;
}

export type UserRead = {
  id: string
  email: string
  is_active: boolean
  tier: UserTier
  created_at: string
  usage?: Record<string, FeatureUsage>
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