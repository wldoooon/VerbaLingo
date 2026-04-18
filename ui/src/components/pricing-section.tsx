import React from "react";
import { FullWidthDivider } from "@/components/ui/full-width-divider";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { DecorIcon } from "@/components/ui/decor-icon";
import { cn } from "@/lib/utils";

type PricingPlan = {
	name: string;
	price: string;
	period?: string;
	description: string;
	href?: string;
	featuresTitle: string;
	features: string[];
	isPopular?: boolean;
};

const pricingPlans: PricingPlan[] = [
	{
		name: "FREE STARTER",
		price: "Free",
		description: "Explore the app and enjoy free AIword lookups.",
		featuresTitle: "CORE ACCESS:",
		features: [
			"100 searches / month",
			"50,000 AI credits",
			"Word lookup & context",
		],
		href: "#",
	},
	{
		name: "BASIC",
		price: "$4.99",
		period: "month",
		description: "For regular learners who want more AI power.",
		featuresTitle: "EVERYTHING IN FREE, PLUS:",
		features: [
			"500 searches / month",
			"800,000 AI credits",
			"Advanced AI explanations",
		],
		href: "#",
	},
	{
		name: "PRO",
		isPopular: true,
		href: "#",
		price: "$8.99",
		period: "month",
		description: "The sweet spot for serious students.",
		featuresTitle: "EVERYTHING IN BASIC, PLUS:",
		features: [
			"2,000 searches / month",
			"5,000,000 AI credits",
			"Advanced analytics",
		],
	},
	{
		name: "MAX",
		href: "#",
		price: "$14.99",
		period: "month",
		description: "For dedicated power learners.",
		featuresTitle: "EVERYTHING IN PRO, PLUS:",
		features: [
			"Unlimited searches",
			"15,000,000 AI credits",
			"Priority support",
		],
	},
	{
		name: "UNLIMITED",
		href: "#",
		price: "$18.99",
		period: "month",
		description: "The ultimate language immersion experience.",
		featuresTitle: "NO LIMITS, PLUS:",
		features: [
			"Unlimited searches",
			"Unlimited AI credits",
			"Dedicated support channel",
		],
	},
];

export function PricingSection() {
	return (
		<section className="mx-auto min-h-screen max-w-screen-2xl place-content-center border-x border-t border-border/40 py-4 relative">
			{/* --- Architectural Corners --- */}
			<DecorIcon className="size-5 text-muted-foreground/40" position="top-left" />
			<DecorIcon className="size-5 text-muted-foreground/40" position="top-right" />
			<DecorIcon className="size-5 text-muted-foreground/40" position="bottom-left" />
			<DecorIcon className="size-5 text-muted-foreground/40" position="bottom-right" />

			<div className="relative">
				<FullWidthDivider position="top" />
				<FullWidthDivider position="bottom" />

				<div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-7">
					<div className="flex flex-col bg-background p-8 md:col-span-2">
						<p className="mb-6 text-muted-foreground text-sm uppercase tracking-wider">
							BLUEPRINT ACCESS
						</p>
						<h1 className="font-bold text-3xl leading-tight md:text-5xl">
							Engineering Tiers that scale
						</h1>
					</div>

					{pricingPlans.map((plan) => (
						<PricingCard key={plan.name} plan={plan} />
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
	{ name: "Daily Context Scans", values: ["10", "Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
	{ name: "Phrase Archives", values: ["5 Units", "Infinite", "Infinite", "Infinite", "Infinite"] },
	{ name: "Acoustic Engine", values: ["Std", "Pro", "Pro", "Research", "Industrial"] },
	{ name: "Shadowing Lab", values: [false, true, true, true, true] },
	{ name: "Pattern Detection", values: [false, true, true, true, true] },
	{ name: "Diagnostic Export", values: [false, false, true, true, true] },
	{ name: "Team Sub-Hubs", values: [false, false, false, true, true] },
	{ name: "Dedicated Nodes", values: [false, false, false, false, true] },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
	return (
		<div className="flex flex-col bg-background *:px-4 *:py-6">
			<div className="border-b">
				<p className="mb-6 text-muted-foreground text-sm uppercase tracking-wider">
					{plan.name}
				</p>
				<div className="mb-2 flex items-baseline gap-2">
					<h2 className="font-bold text-4xl">{plan.price}</h2>
					{plan.period && (
						<span className="text-muted-foreground text-xs">
							/ {plan.period}
						</span>
					)}
				</div>
				<p className="mb-8 line-clamp-1 text-muted-foreground">
					{plan.description}
				</p>

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
