"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, BadgeCheck, Zap, Globe2, LayoutGrid, Layers, ShieldCheck, RefreshCw, XCircle } from "lucide-react";
import { DecorIcon } from "@/components/ui/decor-icon";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { NumberCounter } from "@/components/ui/number-counter";
import { ShimmeringText } from "@/components/ui/shimmering-text";

type FREQUENCY = "monthly" | "yearly";

type PricingPlan = {
	name: string;
	price: { monthly: number; yearly: number };
	period?: string;
	href?: string;
	featuresTitle: string;
	features: string[];
	isPopular?: boolean;
};

const pricingPlans: PricingPlan[] = [
	{
		name: "FREE",
		price: { monthly: 0, yearly: 0 },
		featuresTitle: "CORE ACCESS:",
		features: ["100 searches / month", "50,000 AI Sparks"],
		href: "#",
	},
	{
		name: "BASIC",
		price: { monthly: 4.99, yearly: 4.15 },
		period: "month",
		featuresTitle: "EVERYTHING IN FREE +",
		features: ["500 searches / month", "800,000 AI Sparks"],
		href: "#",
	},
	{
		name: "PRO",
		isPopular: true,
		href: "#",
		price: { monthly: 8.99, yearly: 7.49 },
		period: "month",
		featuresTitle: "EVERYTHING IN BASIC +",
		features: ["2,000 searches / month", "5,000,000 AI Sparks"],
	},
	{
		name: "MAX",
		href: "#",
		price: { monthly: 14.99, yearly: 12.49 },
		period: "month",
		featuresTitle: "EVERYTHING IN PRO +",
		features: ["Unlimited searches", "15,000,000 AI Sparks"],
	},
	{
		name: "UNLIMITED",
		href: "#",
		price: { monthly: 18.99, yearly: 15.82 },
		period: "month",
		featuresTitle: "NO LIMITS:",
		features: ["Unlimited searches", "Unlimited AI Sparks"],
	},
];

const comparisonFeatures = [
	{ name: "Monthly Searches", values: ["100", "500", "2,000", "Unlimited", "Unlimited"] },
	{ name: "AI Sparks", values: ["50K", "800K", "5M", "15M", "Unlimited"] },
	{ name: "Transcript Highlighting", values: [true, true, true, true, true] },
	{ name: "AI Explanations", values: ["Basic", "Advanced", "Advanced", "Research", "Research"] },
	{ name: "Priority Support", values: [false, true, true, true, true] },
	{ name: "Usage Analytics", values: [false, false, true, true, true] },
	{ name: "Early Feature Access", values: [false, false, true, true, true] },
	{ name: "Dedicated Channel", values: [false, false, false, false, true] },
];



/* ── Continuous ruler column ────────────────────────────────────────── */
function RulerCol({ right = false }: { right?: boolean }) {
	return (
		<div className={cn(
			"border-b border-border/40 relative hidden lg:block overflow-hidden",
			right ? "border-l border-r border-border/40" : "border-r border-border/40"
		)}>
			{/* main vertical line */}
			<div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border/40" />
			{/* tick marks evenly distributed */}
			{Array.from({ length: 24 }).map((_, i) => (
				<div
					key={i}
					className="absolute left-0 right-0 flex justify-center"
					style={{ top: `${(i + 1) * (100 / 25)}%` }}
				>
					<div className={cn(
						"h-px bg-border/50",
						i % 5 === 4 ? "w-8" : i % 2 === 1 ? "w-4" : "w-2"
					)} />
				</div>
			))}
			{/* coordinate labels at major ticks */}
			{[0, 25, 50, 75].map((pct) => (
				<span
					key={pct}
					className="absolute left-1/2 -translate-x-1/2 font-mono text-[8px] text-muted-foreground/20 select-none"
					style={{ top: `${pct}%` }}
				>
					{String(pct).padStart(2, "0")}
				</span>
			))}
		</div>
	);
}

/* ── Pricing card ───────────────────────────────────────────────────── */
function PricingCard({ plan, frequency }: { plan: PricingPlan; frequency: FREQUENCY }) {
	const currentPrice = plan.price[frequency];
	const isAnimated = plan.price.monthly !== plan.price.yearly;

	return (
		<div className={cn(
			"relative border-r border-b border-border/40 flex flex-col",
			plan.isPopular && "bg-[radial-gradient(60%_55%_at_85%_0%,rgba(255,255,255,0.06),transparent)] dark:bg-[radial-gradient(60%_55%_at_85%_0%,--theme(--color-foreground/.1),transparent)]"
		)}>
			{/* recommended corner badge */}
			{plan.isPopular && (
				<div className="absolute -top-px right-4 z-10">
					<div className="bg-background border border-border/60 border-t-0 rounded-b-md px-3 py-1 flex items-center gap-1.5">
						<ShimmeringText
							text="Recommended"
							duration={2.5}
							repeatDelay={1.5}
							spread={3}
							className="text-[10px] font-bold uppercase tracking-widest"
						/>
					</div>
				</div>
			)}

			{/* plan name */}
			<div className="border-b border-border/40 px-6 pt-10 pb-6">
				<p className="text-sm font-black text-foreground uppercase tracking-widest">{plan.name}</p>
			</div>

			{/* price */}
			<div className="border-b border-border/40 px-6 py-8">
				<div className="flex items-baseline gap-1 mb-0.5">
					{isAnimated ? (
						<NumberCounter
							value={currentPrice}
							decimals={currentPrice % 1 === 0 ? 0 : 2}
							prefix="$"
							duration={1.5}
							className="font-black text-4xl tabular-nums"
						/>
					) : (
						<span className="font-black text-4xl">Free</span>
					)}
					{plan.period && (
						<span className="text-muted-foreground text-[10px] self-end pb-1">/ mo</span>
					)}
				</div>
				{frequency === "yearly" && isAnimated && (
					<p className="text-[10px] text-muted-foreground/60 mt-1">billed annually</p>
				)}
			</div>

			{/* features */}
			<div className="px-6 py-8 flex-1">
				<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
					{plan.featuresTitle}
				</p>
				<div className="space-y-2.5">
					{plan.features.map((f) => (
						<div key={f} className="flex items-center gap-2">
							<BadgeCheck className="w-4 h-4 shrink-0 text-muted-foreground/50" />
							<span className="text-sm font-medium text-foreground">{f}</span>
						</div>
					))}
				</div>
			</div>

			{/* CTA */}
			<div className="px-6 pb-10">
				<Button
					asChild
					size="sm"
					className={cn(
						"w-full",
						plan.isPopular
							? "bg-orange-500 hover:bg-orange-600 text-white border-0"
							: ""
					)}
					variant={plan.isPopular ? "default" : "outline"}
				>
					<a href={plan.href}>Get started</a>
				</Button>
			</div>
		</div>
	);
}

/* ── Main component ─────────────────────────────────────────────────── */
export function PricingSection() {
	const [frequency, setFrequency] = useState<FREQUENCY>("monthly");

	return (
		<div className="py-10 border-t border-l border-border/40">
			{/* 3-col outer grid: ruler | content | ruler — rulers stretch full height */}
			<div className="grid grid-cols-1 lg:grid-cols-[140px_1fr_140px]">

				<RulerCol />

				{/* ── CENTER CONTENT ─────────────────────────────── */}
				<div>

					{/* HEADER */}
					<div className="relative border-r border-b border-border/40 px-10 py-16 text-center">
						<DecorIcon position="top-left" />
						<DecorIcon position="top-right" />
						<DecorIcon position="bottom-left" />
						<DecorIcon position="bottom-right" />

					
						<p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500 mb-3">Pricing</p>
						<h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4">
							Fuel your language journey.
						</h1>
						<p className="text-muted-foreground max-w-lg mx-auto mb-10 text-sm leading-relaxed">
							Simple pricing. No hidden fees. Cancel anytime.
						</p>

						{/* billing toggle */}
						<div className="inline-flex rounded-lg border bg-background p-1.5 shadow-sm">
							{(["monthly", "yearly"] as const).map((freq) => (
								<button
									key={freq}
									onClick={() => setFrequency(freq)}
									className="relative px-6 py-2 text-xs font-bold uppercase tracking-widest z-10"
								>
									<span className={cn(
										"relative z-10 flex items-center gap-2",
										frequency === freq ? "text-foreground" : "text-muted-foreground"
									)}>
										{freq}
										{freq === "yearly" && (
											<span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-black leading-none">
												-17%
											</span>
										)}
									</span>
									{frequency === freq && (
										<motion.div
											layoutId="active-freq"
											className="absolute inset-0 z-0 bg-muted/40 rounded-md border"
											transition={{ type: "spring", stiffness: 400, damping: 30 }}
										/>
									)}
								</button>
							))}
						</div>
					</div>

					{/* PRICING CARDS */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-r border-border/40">
						{pricingPlans.map((plan) => (
							<PricingCard key={plan.name} plan={plan} frequency={frequency} />
						))}
					</div>


					{/* TRUST FOOTER */}
					<div className="grid grid-cols-1 md:grid-cols-3">
						{[
							{ title: "Secure Payments", desc: "All transactions handled securely by Polar." },
							{ title: "Cancel Anytime", desc: "No lock-in. Stop your plan whenever you want." },
							{ title: "Sparks Reset Monthly", desc: "AI credits refresh automatically each billing cycle." },
						].map((item, i) => (
							<div key={item.title} className={cn(
								"relative border-r border-b border-border/40 px-8 py-7 flex items-start gap-4",
								i === 1 && "bg-muted/20 dark:bg-muted/5"
							)}>
								{i === 0 && <DecorIcon position="bottom-left" />}
								{i === 2 && <DecorIcon position="bottom-right" />}
								<div>
									<p className="font-bold text-sm text-foreground mb-0.5">{item.title}</p>
									<p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
								</div>
							</div>
						))}
					</div>

				</div>

				<RulerCol right />

			</div>
		</div>
	);
}
