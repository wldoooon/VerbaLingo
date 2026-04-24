"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, Zap, Globe2, LayoutGrid, Layers, ShieldCheck, RefreshCw, XCircle } from "lucide-react";
import { DecorIcon } from "@/components/ui/decor-icon";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { NumberCounter } from "@/components/ui/number-counter";

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



/* ── Ruler side box ─────────────────────────────────────────────────── */
function RulerBox({ className }: { className?: string }) {
	return (
		<div className={cn("border-r border-b border-border/40 relative hidden lg:block overflow-hidden", className)}>
			<div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border/40" />
			{Array.from({ length: 12 }).map((_, i) => (
				<div
					key={i}
					className="absolute left-0 right-0 flex justify-center"
					style={{ top: `${(i + 1) * (100 / 13)}%` }}
				>
					<div className={cn("h-px bg-border/50", i % 3 === 2 ? "w-4" : "w-2")} />
				</div>
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
						<div className="w-1 h-1 rounded-full bg-orange-500" />
						<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
							Recommended
						</span>
					</div>
				</div>
			)}

			{/* plan name */}
			<div className="border-b border-border/40 px-6 pt-7 pb-5">
				<p className="text-xs text-muted-foreground uppercase tracking-widest">{plan.name}</p>
			</div>

			{/* price */}
			<div className="border-b border-border/40 px-6 py-6">
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
			<div className="px-6 py-5 flex-1">
				<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
					{plan.featuresTitle}
				</p>
				<div className="space-y-2.5">
					{plan.features.map((f) => (
						<div key={f} className="flex items-center gap-2">
							<CheckIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
							<span className="text-xs text-foreground/80">{f}</span>
						</div>
					))}
				</div>
			</div>

			{/* CTA */}
			<div className="px-6 pb-7">
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
		<div className="py-10 px-4">
			<div className="max-w-6xl mx-auto border-t border-l border-border/40">

				{/* ── HEADER ROW ─────────────────────────────────── */}
				<div className="grid grid-cols-1 lg:grid-cols-[56px_1fr_56px]">
					<RulerBox />

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

					<RulerBox />
				</div>



				{/* ── PRICING CARDS ──────────────────────────────── */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
					{pricingPlans.map((plan) => (
						<PricingCard key={plan.name} plan={plan} frequency={frequency} />
					))}
				</div>

				{/* ── COMPARISON HEADER ──────────────────────────── */}
				<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]">
					{/* section label */}
					<div className="relative border-r border-b border-border/40 px-8 py-6 bg-muted/20 dark:bg-muted/5">
						<DecorIcon position="top-left" />
						<h2 className="text-lg font-black text-foreground">Compare plans</h2>
					</div>
					{/* plan name headers */}
					{pricingPlans.map((plan) => (
						<div key={plan.name} className={cn(
							"border-r border-b border-border/40 px-4 py-6 hidden lg:flex items-center justify-center bg-muted/20 dark:bg-muted/5",
							plan.isPopular && "bg-orange-500/[0.04]"
						)}>
							<span className={cn(
								"text-[10px] font-black uppercase tracking-widest",
								plan.isPopular ? "text-orange-500" : "text-muted-foreground"
							)}>
								{plan.name}
							</span>
						</div>
					))}
				</div>

				{/* ── COMPARISON ROWS ────────────────────────────── */}
				{comparisonFeatures.map((feature, i) => (
					<div
						key={feature.name}
						className={cn(
							"grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] border-b border-border/40",
							i % 2 !== 0 && "bg-muted/20 dark:bg-muted/5"
						)}
					>
						<div className="relative border-r border-border/40 px-8 py-4 flex items-center">
							{i === comparisonFeatures.length - 1 && <DecorIcon position="bottom-left" />}
							<span className="text-sm text-foreground/80 font-medium">{feature.name}</span>
						</div>
						{feature.values.map((val, idx) => (
							<div key={idx} className={cn(
								"border-r border-border/40 flex items-center justify-center px-4 py-4",
								pricingPlans[idx]?.isPopular && "bg-orange-500/[0.03]"
							)}>
								{typeof val === "boolean" ? (
									val ? (
										<div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
											<CheckIcon className="w-3 h-3 text-orange-500" />
										</div>
									) : (
										<div className="w-1.5 h-1.5 rounded-full bg-border" />
									)
								) : (
									<span className="text-xs text-muted-foreground font-medium">{val}</span>
								)}
							</div>
						))}
					</div>
				))}

				{/* ── TRUST FOOTER ───────────────────────────────── */}
				<div className="grid grid-cols-1 md:grid-cols-3">
					{[
						{ icon: ShieldCheck, title: "Secure Payments", desc: "All transactions handled securely by Polar." },
						{ icon: XCircle, title: "Cancel Anytime", desc: "No lock-in. Stop your plan whenever you want." },
						{ icon: RefreshCw, title: "Sparks Reset Monthly", desc: "AI credits refresh automatically each billing cycle." },
					].map((item, i) => (
						<div key={item.title} className={cn(
							"relative border-r border-b border-border/40 px-8 py-7 flex items-start gap-4",
							i === 1 && "bg-muted/20 dark:bg-muted/5"
						)}>
							{i === 0 && <DecorIcon position="bottom-left" />}
							{i === 2 && <DecorIcon position="bottom-right" />}
							<item.icon className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
							<div>
								<p className="font-bold text-sm text-foreground mb-0.5">{item.title}</p>
								<p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
							</div>
						</div>
					))}
				</div>

			</div>
		</div>
	);
}
