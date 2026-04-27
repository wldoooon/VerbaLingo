"use client";

import { cn } from "@/lib/utils";
import { DecorIcon } from "@/components/ui/decor-icon";
import {
	Clapperboard,
	Mic2,
	Wand2,
	Presentation,
	Newspaper,
	Tv2,
	Users,
	BookOpen,
} from "lucide-react";

type Category = {
	label: string;
	icon: React.ElementType;
};

const CATEGORIES: Category[] = [
	{ label: "Movies", icon: Clapperboard },
	{ label: "Podcasts", icon: Mic2 },
	{ label: "Cartoons", icon: Wand2 },
	{ label: "Talks", icon: Presentation },
	{ label: "News", icon: Newspaper },
	{ label: "Shows", icon: Tv2 },
	{ label: "Interviews", icon: Users },
	{ label: "Documentaries", icon: BookOpen },
];

const shadedIndices = new Set([0, 2, 5, 7]);

export function LogoCloud() {
	return (
		<div className="grid grid-cols-2 border md:grid-cols-4">
			{CATEGORIES.map((cat, i) => {
				const Icon = cat.icon;
				const isShaded = shadedIndices.has(i);
				const isLastRow = i >= 4;
				const isRightEdge = (i + 1) % 4 === 0;
				const isMobileRightEdge = (i + 1) % 2 === 0;

				return (
					<CategoryCard
						key={cat.label}
						label={cat.label}
						icon={Icon}
						className={cn(
							!isLastRow && "border-b",
							!isRightEdge && "md:border-r",
							!isMobileRightEdge && "border-r md:border-r-0",
							isShaded && "bg-secondary dark:bg-secondary/30",
							!isShaded && "bg-background",
						)}
					>
						{i === 0 && <DecorIcon className="z-10" position="bottom-right" />}
						{i === 3 && <DecorIcon className="z-10 hidden md:block" position="bottom-left" />}
						{i === 4 && <DecorIcon className="z-10 hidden md:block" position="bottom-right" />}
					</CategoryCard>
				);
			})}
		</div>
	);
}

type CategoryCardProps = React.ComponentProps<"div"> & {
	label: string;
	icon: React.ElementType;
};

function CategoryCard({ label, icon: Icon, className, children, ...props }: CategoryCardProps) {
	return (
		<div
			className={cn(
				"relative flex flex-col items-center justify-center gap-2 px-4 py-8 md:p-8 group transition-colors hover:bg-orange-500/5",
				className
			)}
			{...props}
		>
			<Icon
				size={22}
				strokeWidth={1.5}
				className="text-muted-foreground group-hover:text-orange-500 transition-colors duration-200"
			/>
			<span className="text-xs font-medium tracking-wide text-muted-foreground group-hover:text-foreground transition-colors duration-200">
				{label}
			</span>
			{children}
		</div>
	);
}
