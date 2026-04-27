"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type React from "react";

export type FREQUENCY = "monthly" | "yearly";

type FrequencyToggleProps = React.ComponentProps<"div"> & {
	frequency: FREQUENCY;
	setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
	frequencies?: FREQUENCY[];
};

export function FrequencyToggle({
	frequency,
	setFrequency,
	frequencies = ["monthly", "yearly"],
	...props
}: FrequencyToggleProps) {
	return (
		<div
			className={cn(
				"mx-auto flex w-fit rounded-xl border bg-card p-1 shadow-xs",
				props.className
			)}
			{...props}
		>
			{frequencies.map((freq) => (
				<button
					className="relative px-4 py-1 text-sm capitalize"
					key={freq}
					onClick={() => setFrequency(freq)}
					type="button"
				>
					<span className={cn("relative z-10 transition-colors", frequency === freq ? "text-white" : "")}>{freq}</span>
					{frequency === freq && (
						<motion.span
							className="absolute inset-0 z-0 rounded-xl bg-orange-500"
							layoutId="frequency"
							transition={{ type: "spring", duration: 0.4 }}
						/>
					)}
				</button>
			))}
		</div>
	);
}
