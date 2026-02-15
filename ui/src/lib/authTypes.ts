export type UserTier = "free" | "pro";

export type FeatureUsage = {
  current: number;
  limit: number;
  remaining: number;
};

export type UserRead = {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  tier: UserTier;
  oauth_provider?: string | null;
  oauth_avatar_url?: string | null;
  last_login_at?: string | null;
  tier_expires_at?: string | null;
  created_at: string;
  usage?: Record<string, FeatureUsage>;
};

export type LoginResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    tier: UserTier;
  };
};

export type SignupResponse = UserRead;
