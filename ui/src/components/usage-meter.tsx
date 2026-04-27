"use client"

import { useUsageStore } from "@/stores/usage-store"
import { useAuthStore } from "@/stores/auth-store"
import { Progress } from "@/components/ui/progress"
import { ZapIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}k`
    return n.toLocaleString()
}

function UsageRow({
    icon: Icon,
    label,
    used,
    total,
    valueLabel,
}: {
    icon: React.ElementType
    label: string
    used: number
    total: number
    valueLabel: string
}) {
    const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{valueLabel}</span>
            </div>
            <Progress
                value={pct}
                className={cn("h-1.5", pct >= 90 && "[&>div]:bg-red-500", pct >= 70 && pct < 90 && "[&>div]:bg-amber-500")}
            />
        </div>
    )
}

export function UsageMeter() {
    const usageMap = useUsageStore((s) => s.usage)
    const user = useAuthStore((s) => s.user)

    const searches = usageMap["search"] ?? { current: 0, limit: 100, remaining: 100 }
    const sparks = usageMap["ai_chat"] ?? { current: 0, limit: 50_000, balance: 50_000 }

    const sparkUsed = sparks.current ?? 0
    const sparkLimit = sparks.limit ?? 50_000
    const sparkBalance = sparks.balance ?? sparks.remaining ?? Math.max(0, sparkLimit - sparkUsed)

    const searchRemaining = searches.remaining ?? Math.max(0, searches.limit - searches.current)

    const tier = user?.tier
        ? user.tier.charAt(0).toUpperCase() + user.tier.slice(1)
        : "Free"

    return (
        <div className={cn(
            "relative w-full rounded-xl border border-border/50 bg-card p-3 flex flex-col gap-3 overflow-hidden",
            "transition-opacity group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0"
        )}>
            {/* Top-right white glow — same as footer */}
            <div className="pointer-events-none absolute inset-0 dark:bg-[radial-gradient(35%_80%_at_85%_0%,--theme(--color-foreground/.1),transparent)]" />

            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Usage</span>
                <span className="text-[10px] text-muted-foreground">{tier} plan</span>
            </div>

            <UsageRow
                icon={SearchIcon}
                label="Searches"
                used={searches.current}
                total={searches.limit}
                valueLabel={`${fmt(searchRemaining)} left`}
            />
            <UsageRow
                icon={ZapIcon}
                label="AI Credits"
                used={sparkUsed}
                total={sparkLimit}
                valueLabel={`${fmt(sparkBalance)} left`}
            />
        </div>
    )
}
