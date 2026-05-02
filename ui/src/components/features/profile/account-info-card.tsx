"use client"

import { useState, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Lock, LogOut, Mail, ShieldCheck, CalendarDays,
  Eye, EyeOff, KeyRound, Smartphone, CreditCard,
  Zap, Search, Check, ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { useLogoutMutation, useUpdateProfileMutation } from "@/lib/authHooks"

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USER = {
  full_name: "Walid Benraho",
  email: "walid.benraho005@gmail.com",
  oauth_avatar_url: null as string | null,
  oauth_provider: null as string | null,
  tier: "pro" as const,
  is_email_verified: true,
  created_at: "2024-03-15T10:00:00Z",
  usage: {
    sparks:   { current: 3_200_000, limit: 5_000_000 },
    searches: { current: 1_430,     limit: 2_000 },
  },
}

const PLANS = [
  { id: "free",    label: "Free",    price: "$0",     sparks: "50K",   searches: "100" },
  { id: "basic",   label: "Basic",   price: "$4.99",  sparks: "800K",  searches: "500" },
  { id: "pro",     label: "Pro",     price: "$8.99",  sparks: "5M",    searches: "2K",  popular: true },
  { id: "premium", label: "Premium", price: "$14.99", sparks: "15M",   searches: "Unlimited" },
  { id: "max",     label: "Max",     price: "$18.99", sparks: "∞",     searches: "Unlimited" },
]

const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  free:    { label: "Free",    className: "bg-muted text-muted-foreground border-border" },
  basic:   { label: "Basic",   className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  pro:     { label: "Pro",     className: "bg-muted text-muted-foreground border-border" },
  premium: { label: "Premium", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  max:     { label: "Max",     className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name?: string | null, email?: string) {
  if (name) {
    const parts = name.trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email?.[0]?.toUpperCase() ?? "?"
}

function formatDate(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

// ── Sub-components ───────────────────────────────────────────────────────────

function AccountTab({ user }: { user: typeof MOCK_USER }) {
  const [displayName, setDisplayName] = useState(user.full_name ?? "")
  const isDirty = displayName !== (user.full_name ?? "")
  const tier = TIER_CONFIG[user.tier] ?? TIER_CONFIG.free
  const updateMutation = useUpdateProfileMutation()
  const logoutMutation = useLogoutMutation()

  return (
    <div className="space-y-6">
      {/* Avatar row */}
      <div className="flex items-center gap-5">
        <Avatar className="h-24 w-24 ring-2 ring-border/40 ring-offset-2 ring-offset-card">
          <AvatarImage src={user.oauth_avatar_url || "/user_logo.png"} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-2xl font-bold">
            {getInitials(user.full_name, user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-semibold text-foreground truncate">
            {user.full_name || user.email.split("@")[0] || "User"}
          </p>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
          <Badge
            variant="outline"
            className={cn("mt-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full", tier.className)}
          >
            {tier.label}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Editable fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="rounded-xl bg-muted/40 border-border/50 focus-visible:ring-primary/30 h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</Label>
          <div className="relative">
            <Input
              value={user.email}
              readOnly
              className="rounded-xl bg-muted/30 border-border/30 text-muted-foreground pr-10 cursor-not-allowed h-11"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Account meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: CalendarDays, label: "Member since", value: formatDate(user.created_at) },
          { icon: Mail,         label: "Sign-in method", value: user.oauth_provider ?? "Email / Password" },
          { icon: ShieldCheck,  label: "Email", value: user.is_email_verified ? "Verified" : "Unverified",
            badge: true, ok: user.is_email_verified },
        ].map(({ icon: Icon, label, value, badge, ok }) => (
          <div key={label} className="rounded-2xl bg-muted/30 border border-border/40 px-4 py-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
            </div>
            {badge ? (
              <Badge variant="outline" className={cn(
                "text-[10px] font-semibold px-2 py-0 rounded-full mt-1",
                ok ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                   : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                {value}
              </Badge>
            ) : (
              <p className="text-sm font-medium text-foreground capitalize">{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-2"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? "Signing out…" : "Sign out"}
        </Button>
        <Button
          size="sm"
          className="rounded-xl px-6 h-9"
          disabled={!isDirty || updateMutation.isPending}
          onClick={() => updateMutation.mutate({ full_name: displayName })}
        >
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [current, setCurrent]         = useState("")
  const [next, setNext]               = useState("")
  const [confirm, setConfirm]         = useState("")

  const sessions = [
    { device: "MacBook Pro", location: "Algiers, DZ", current: true,  last: "Now" },
    { device: "iPhone 15",   location: "Algiers, DZ", current: false, last: "2 hours ago" },
    { device: "Chrome / Windows", location: "Paris, FR", current: false, last: "3 days ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Change Password</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-11 pr-10 bg-muted/40 border-border/50 focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
              >
                {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-11 pr-10 bg-muted/40 border-border/50 focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
              >
                {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl h-11 bg-muted/40 border-border/50 focus-visible:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="rounded-xl px-6 h-9" disabled={!current || !next || next !== confirm}>
            Update Password
          </Button>
        </div>
      </div>

      <Separator />

      {/* Active sessions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Active Sessions</h3>
        </div>
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  {s.device}
                  {s.current && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      This device
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.location} · {s.last}</p>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg h-7">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BillingTab({ user }: { user: typeof MOCK_USER }) {
  const tier   = TIER_CONFIG[user.tier] ?? TIER_CONFIG.free
  const sparks = user.usage.sparks
  const searches = user.usage.searches
  const currentPlan = PLANS.find(p => p.id === user.tier) ?? PLANS[0]

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="rounded-2xl border border-border/50 bg-muted/20 px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{currentPlan.label} Plan</p>
            <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0 rounded-full", tier.className)}>
              Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{currentPlan.price}/month · renews Dec 15, 2025</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
          Manage <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Usage */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Month's Usage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: Zap, label: "AI Sparks",
              used: sparks.current, limit: sparks.limit,
              color: "bg-primary",
            },
            {
              icon: Search, label: "Searches",
              used: searches.current, limit: searches.limit,
              color: "bg-blue-500",
            },
          ].map(({ icon: Icon, label, used, limit, color }) => {
            const pct = Math.min(100, (used / limit) * 100)
            return (
              <div key={label} className="rounded-2xl border border-border/40 bg-muted/20 px-4 py-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatNumber(used)} / {formatNumber(limit)}
                  </span>
                </div>
                <Progress value={pct} className={cn("h-1.5 rounded-full", pct > 80 ? "[&>div]:bg-red-500" : `[&>div]:${color}`)} />
                <p className="text-[11px] text-muted-foreground">{formatNumber(limit - used)} remaining</p>
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Plan comparison */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Plans</h3>
        <div className="space-y-2">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === user.tier
            return (
              <div key={plan.id} className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors",
                isCurrent
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/40 bg-muted/10 hover:bg-muted/30"
              )}>
                <div className="flex items-center gap-3">
                  {isCurrent
                    ? <Check className="h-4 w-4 text-primary" />
                    : <div className="h-4 w-4 rounded-full border border-border/50" />
                  }
                  <div>
                    <p className={cn("text-sm font-semibold", isCurrent ? "text-primary" : "text-foreground")}>
                      {plan.label}
                      {plan.popular && !isCurrent && (
                        <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Popular</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{plan.sparks} Sparks · {plan.searches} searches</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{plan.price}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                  {!isCurrent && (
                    <Button variant="outline" size="sm" className="rounded-xl h-7 text-xs px-3">
                      {PLANS.indexOf(plan) > PLANS.findIndex(p => p.id === user.tier) ? "Upgrade" : "Downgrade"}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const TAB_ORDER = ["account", "security", "billing"]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -36 : 36, opacity: 0 }),
}

// ── Main component ────────────────────────────────────────────────────────────
export function AccountInfoCard() {
  const authUser = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState("account")
  const directionRef = useRef(0)

  const handleTabChange = (value: string) => {
    const prev = TAB_ORDER.indexOf(activeTab)
    const next = TAB_ORDER.indexOf(value)
    directionRef.current = next > prev ? 1 : -1
    setActiveTab(value)
  }

  // Merge real auth data over mock defaults (billing/usage still mock until API ready)
  const user = {
    ...MOCK_USER,
    full_name:        authUser?.full_name ?? MOCK_USER.full_name,
    email:            authUser?.email     ?? MOCK_USER.email,
    oauth_avatar_url: authUser?.oauth_avatar_url ?? null,
    oauth_provider:   authUser?.oauth_provider   ?? null,
    tier:             (authUser?.tier ?? MOCK_USER.tier) as typeof MOCK_USER.tier,
    is_email_verified: authUser?.is_email_verified ?? MOCK_USER.is_email_verified,
    created_at:       authUser?.created_at ?? MOCK_USER.created_at,
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Tab bar */}
        <div className="px-6 pt-5 pb-0">
          <TabsList className="bg-muted/70 rounded-xl p-1 h-auto gap-0.5">
            {[
              { value: "account",  label: "Account" },
              { value: "security", label: "Security" },
              { value: "billing",  label: "Billing" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "relative rounded-lg px-4 py-1.5 text-sm font-medium transition-colors duration-200",
                  "text-muted-foreground hover:text-foreground",
                  "data-[state=active]:text-foreground",
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                )}
              >
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/40"
                    transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab content */}
        <div className="px-6 pt-5 pb-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={directionRef.current}>
            <motion.div
              key={activeTab}
              custom={directionRef.current}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {activeTab === "account"  && <AccountTab  user={user} />}
              {activeTab === "security" && <SecurityTab />}
              {activeTab === "billing"  && <BillingTab  user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  )
}
