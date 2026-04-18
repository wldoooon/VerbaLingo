"use client";

import React, { useState } from "react";
import { FullWidthDivider } from "@/components/ui/full-width-divider";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { DecorIcon } from "@/components/ui/decor-icon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { NumberCounter } from "@/components/ui/number-counter";

type FREQUENCY = "monthly" | "yearly";

type PricingPlan = {
	name: string;
	price: {
		monthly: number;
		yearly: number;
	};
	period?: string;
	href?: string;
	featuresTitle: string;
	features: string[];
	isPopular?: boolean;
};

const pricingPlans: PricingPlan[] = [
	{
		name: "FREE STARTER",
		price: { monthly: 0, yearly: 0 },
		featuresTitle: "CORE ACCESS:",
		features: [
			"100 searches / month",
			"50,000 AI credits",
		],
		href: "#",
	},
	{
		name: "BASIC",
		price: { monthly: 4.99, yearly: 4.15 },
		period: "month",
		featuresTitle: "EVERYTHING IN FREE, PLUS:",
		features: [
			"500 searches / month",
			"800,000 AI credits",
		],
		href: "#",
	},
	{
		name: "PRO",
		isPopular: true,
		href: "#",
		price: { monthly: 8.99, yearly: 7.49 },
		period: "month",
		featuresTitle: "EVERYTHING IN BASIC, PLUS:",
		features: [
			"2,000 searches / month",
			"5,000,000 AI credits",
		],
	},
	{
		name: "MAX",
		href: "#",
		price: { monthly: 14.99, yearly: 12.49 },
		period: "month",
		featuresTitle: "EVERYTHING IN PRO, PLUS:",
		features: [
			"Unlimited searches",
			"15,000,000 AI credits",
		],
	},
	{
		name: "UNLIMITED",
		href: "#",
		price: { monthly: 18.99, yearly: 15.82 },
		period: "month",
		featuresTitle: "NO LIMITS, PLUS:",
		features: [
			"Unlimited searches",
			"Unlimited AI credits",
		],
	},
];

export function PricingSection() {
	const [frequency, setFrequency] = useState<FREQUENCY>("monthly");

	return (
		<section className="mx-auto min-h-screen max-w-screen-2xl place-content-center border-x border-t border-border/40 py-12 relative overflow-hidden">
			{/* --- Architectural Corners --- */}
			<DecorIcon className="size-5 text-muted-foreground/40" position="top-left" />
			<DecorIcon className="size-5 text-muted-foreground/40" position="top-right" />
			<DecorIcon className="size-5 text-muted-foreground/40" position="bottom-left" />
			<DecorIcon className="size-5 text-muted-foreground/40" position="bottom-right" />

			<div className="mb-12 flex justify-center">
				<div className="flex w-fit rounded-lg border bg-background p-1.5 shadow-sm relative">
					{(["monthly", "yearly"] as const).map((freq) => (
						<button
							key={freq}
							onClick={() => setFrequency(freq)}
							className="relative px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors z-10"
						>
							<span className={cn(
								"relative z-10",
								frequency === freq ? "text-foreground" : "text-muted-foreground"
							)}>
								{freq}
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

			<div className="relative">
				<FullWidthDivider position="top" />
				<FullWidthDivider position="bottom" />

				<div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-7">
					<div className="flex flex-col bg-background p-8 md:col-span-2">
						<p className="mb-6 text-muted-foreground text-sm uppercase tracking-wider">
							BLUEPRINT ACCESS
						</p>
						<h1 className="font-bold text-3xl leading-tight md:text-5xl">
							Engineering Tiers
						</h1>
					</div>

					{pricingPlans.map((plan) => (
						<PricingCard key={plan.name} plan={plan} frequency={frequency} />
					))}

					{/* Comparison Rows */}
					{comparisonFeatures.map((feature, i) => (
						<React.Fragment key={i}>
							<div className="lg:col-span-2 bg-background px-8 py-6 flex items-center border-t border-border/40">
								<span className="text-sm text-foreground/80 font-medium">
									{feature.name}
								</span>
							</div>

							{feature.values.map((val, idx) => (
								<div key={idx} className="bg-background flex items-center justify-center p-6 border-t border-border/40">
									{typeof val === 'boolean' ? (
										val ? (
											<CheckIcon className="size-4" />
										) : (
											<div className="size-1 rounded-full bg-border" />
										)
									) : (
										<span className="text-xs text-muted-foreground uppercase">
											{val}
										</span>
									)}
								</div>
							))}
						</React.Fragment>
					))}
				</div>
			</div>
		</section>
	);
}

const comparisonFeatures = [
	{ name: "Monthly Search Queries", values: ["100", "500", "2,000", "Unlimited", "Unlimited"] },
	{ name: "AI credits", values: ["50k", "800k", "5M", "15M", "Unlimited"] },
	{ name: "Word Context Engine", values: [true, true, true, true, true] },
	{ name: "AI Immersion Logic", values: ["Basic", "Advanced", "Advanced", "Research", "Research"] },
	{ name: "Acoustic Shadowing", values: [false, true, true, true, true] },
	{ name: "Pattern Detection", values: [false, false, true, true, true] },
	{ name: "Immersion Analytics", values: [false, false, true, true, true] },
	{ name: "Dedicated Nodes", values: [false, false, false, false, true] },
];

function PricingCard({ plan, frequency }: { plan: PricingPlan; frequency: FREQUENCY }) {
	const currentPrice = plan.price[frequency];

	return (
		<div className="flex flex-col bg-background *:px-4 *:py-6">
			<div className="border-b min-h-[160px] flex flex-col justify-between">
				<div>
					<p className="mb-6 text-muted-foreground text-sm uppercase tracking-wider">
						{plan.name}
					</p>
					<div className="mb-2 flex items-baseline gap-2 h-10 overflow-hidden">
						{plan.price.monthly !== plan.price.yearly ? (
							<NumberCounter
								value={currentPrice}
								decimals={currentPrice % 1 === 0 ? 0 : 2}
								prefix="$"
								duration={1.9}
								className="font-bold text-4xl tabular-nums"
							/>
						) : (
							<h2 className="font-bold text-4xl">
								{currentPrice === 0 ? "Free" : `$${currentPrice}`}
							</h2>
						)}
						{plan.period && (
							<span className="text-muted-foreground text-xs uppercase block self-end pb-1">
								/ {plan.period}
							</span>
						)}
					</div>
				</div>

				<Button
					asChild
					className="w-full"
					variant={plan.isPopular ? "default" : "outline"}
				>
					<a href={plan.href}>Get started</a>
				</Button>
			</div>

			<div className="space-y-3 text-muted-foreground text-sm">
				<p className="mb-6 text-xs uppercase">{plan.featuresTitle}</p>

				{featureChecklist(plan)}
			</div>
		</div>
	);
}

function featureChecklist(plan: PricingPlan) {
	return plan.features.map((feature) => (
		<p
			className="flex items-center gap-2 text-foreground/80"
			key={feature}
		>
			<CheckIcon className="size-4" />
			{feature}
		</p>
	));
}
