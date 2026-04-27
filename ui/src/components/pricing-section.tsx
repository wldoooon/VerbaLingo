"use client";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { type FREQUENCY, FrequencyToggle } from "@/components/frequency-toggle";
import { StarIcon, CheckCircleIcon } from "lucide-react";

type Plan = {
	name: string;
	info: string;
	price: {
		monthly: number;
		yearly: number; // yearly per month
	};
	features: string[];
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
};

const plans: Plan[] = [
	{
		name: "Basic",
		info: "For most individuals",
		price: {
			monthly: 7,
			yearly: 5,
		},
		features: [
			"Up to 3 Blog posts",
			"Up to 3 Transcriptions",
			"Up to 3 Posts stored",
			"Markdown support",
			"Community support",
			"AI powered suggestions",
		],
		btn: {
			text: "Start Your Free Trial",
			href: "#",
		},
	},
	{
		highlighted: true,
		name: "Pro",
		info: "For small businesses",
		price: {
			monthly: 10,
			yearly: 7,
		},
		features: [
			"Up to 500 Blog Posts",
			"Up to 500 Transcriptions",
			"Up to 500 Posts stored",
			"Unlimited Markdown support",
			"SEO optimization tools",
			"Priority support",
			"AI powered suggestions",
		],
		btn: {
			text: "Get started",
			href: "#",
		},
	},
	{
		name: "Max",
		info: "For large organizations",
		price: {
			monthly: 19,
			yearly: 10,
		},
		features: [
			"Unlimited Blog Posts",
			"Unlimited Transcriptions",
			"Unlimited Posts stored",
			"Unlimited Markdown support",
			"SEO optimization tools",
			"Priority support",
			"AI powered suggestions",
		],
		btn: {
			text: "Contact team",
			href: "#",
		},
	},
];

export function PricingSection() {
	const [frequency, setFrequency] = React.useState<"monthly" | "yearly">(
		"monthly"
	);

	return (
		<div className="flex w-full flex-col items-center justify-center space-y-7 p-4">
			<div className="mx-auto max-w-xl space-y-2">
				<h2 className="text-center font-bold text-2xl tracking-tight md:text-3xl lg:font-extrabold lg:text-4xl">
					Plans that Scale with You
				</h2>
				<p className="text-center text-muted-foreground text-sm md:text-base">
					Whether you're just starting out or growing fast, our flexible pricing
					has you covered — with no hidden costs.
				</p>
			</div>

			<FrequencyToggle frequency={frequency} setFrequency={setFrequency} />
			<div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
				{plans.map((plan) => (
					<PricingCard frequency={frequency} key={plan.name} plan={plan} />
				))}
			</div>
		</div>
	);
}

type PricingCardProps = React.ComponentProps<"div"> & {
	plan: Plan;
	frequency?: FREQUENCY;
};

export function PricingCard({
	plan,
	className,
	frequency = "monthly",
	...props
}: PricingCardProps) {
	return (
		<div
			className={cn(
				"relative flex w-full flex-col overflow-hidden rounded-lg border shadow-xs",
				plan.highlighted && "scale-105",
				className
			)}
			key={plan.name}
			{...props}
		>
			{plan.highlighted && (
					<div className="pointer-events-none absolute inset-0 dark:bg-[radial-gradient(35%_50%_at_15%_0%,--theme(--color-foreground/.1),transparent)]" />
				)}
			<div
				className={cn(
					"border-b p-4",
					plan.highlighted && "bg-card dark:bg-card/80"
				)}
			>
				<AnimatePresence mode="wait">
					<div className="absolute top-2 right-2 z-10 flex items-center gap-2">
						{plan.highlighted && (
							<motion.div
								className="flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs"
								key="popular-badge"
								layout
								transition={{ duration: 0.1 }}
							>
								<StarIcon className="size-3 fill-current" />
								Popular
							</motion.div>
						)}

						{frequency === "yearly" &&
							plan.price.monthly > plan.price.yearly && (
								<motion.div
									animate={{ opacity: 1 }}
									className="flex items-center gap-1 rounded-md border bg-primary px-2 py-0.5 text-primary-foreground text-xs"
									exit={{ opacity: 0 }}
									initial={{ opacity: 0 }}
									key="discount-badge"
									layout
									transition={{ duration: 0.15 }}
								>
									{/* Calculate the actual discount percentage of the plan */}
									{Math.round(
										((plan.price.monthly - plan.price.yearly) /
											plan.price.monthly) *
											100
									)}
									% off
								</motion.div>
							)}
					</div>
				</AnimatePresence>

				<div className="font-medium text-lg">{plan.name}</div>
				<p className="font-normal text-muted-foreground text-sm">{plan.info}</p>
				<h3 className="mt-6 mb-1 flex w-max items-end gap-1">
					<NumberFlow
						className="font-extrabold text-3xl [&::part(suffix)]:font-normal [&::part(suffix)]:text-base [&::part(suffix)]:text-muted-foreground"
						format={{
							style: "currency",
							currency: "USD",
							notation: "compact",
						}}
						suffix="/month"
						value={plan.price[frequency]}
					/>
				</h3>
				<p className="mb-2 font-normal text-muted-foreground text-xs">
					billed {frequency}
				</p>
			</div>
			<div
				className={cn(
					"space-y-3 px-4 pt-6 pb-8 text-muted-foreground text-sm",
					plan.highlighted && "bg-muted/10"
				)}
			>
				{plan.features.map((feature) => (
					<div className="flex items-center gap-2" key={feature}>
						<CheckCircleIcon className="size-3.5 text-foreground" />
						<p>{feature}</p>
					</div>
				))}
			</div>
			<div
				className={cn(
					"mt-auto w-full border-t p-3",
					plan.highlighted && "bg-card dark:bg-card/80"
				)}
			>
				<Button
					asChild
					className="w-full"
					variant={plan.highlighted ? "default" : "outline"}
				>
					<Link href={plan.btn.href}>{plan.btn.text}</Link>
				</Button>
			</div>
		</div>
	);
}
