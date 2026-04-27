"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
					className="relative px-4 py-1 text-sm capitalize font-medium transition-colors"
					key={freq}
					onClick={() => setFrequency(freq)}
					type="button"
				>
					<span className={cn(
                        "relative z-10",
                        frequency === freq ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {freq}
                    </span>
					{frequency === freq && (
						<motion.span
							className="absolute inset-0 z-0 rounded-lg bg-background shadow-xs dark:bg-zinc-800"
							layoutId="frequency"
							transition={{ type: "spring", stiffness: 400, damping: 30 }}
						/>
					)}
				</button>
			))}
		</div>
	);
}
