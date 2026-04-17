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
		name: "APPRENTICE",
		price: "Free",
		description: "For individual learners",
		featuresTitle: "CORE ACCESS:",
		features: [
			"10 context scans / day",
			"5 saved blueprints",
			"Standard acoustic engine",
		],
		href: "#",
	},
	{
		name: "ARCHITECT",
		isPopular: true,
		href: "#",
		price: "$19",
		period: "month",
		description: "For language engineers",
		featuresTitle: "UNLIMITED SCANS, PLUS:",
		features: [
			"Unlimited scans",
			"Infinite blueprints",
			"Shadowing lab access",
			"Pattern detection",
		],
	},
	{
		name: "INDUSTRIAL",
		href: "#",
		price: "$49",
		period: "month",
		description: "For teams & studios",
		featuresTitle: "SCALED INFRASTRUCTURE:",
		features: [
			"Team phrase hubs",
			"Phonetic diagnostics",
			"Priority support",
			"White-label exports",
		],
	},
	{
		name: "RESEARCH",
		href: "#",
		price: "$99",
		period: "month",
		description: "For institutions",
		featuresTitle: "COMPLETE ENGINE:",
		features: [
			"Full API infrastructure",
			"Custom phonetic models",
			"Data lake access",
			"Dedicated instances",
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

				<div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-6">
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
				</div>
			</div>
		</section>
	);
}

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

				{plan.features.map((feature) => (
					<p
						className="flex items-center gap-2 text-foreground/80"
						key={feature}
					>
						<CheckIcon className="size-4" />
						{feature}
					</p>
				))}
			</div>
		</div>
	);
}
