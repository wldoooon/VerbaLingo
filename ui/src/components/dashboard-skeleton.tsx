import { cn } from "@/lib/utils";
import { DecorIcon } from "@/components/ui/decor-icon";

export function DashboardSkeleton() {
	return (
		<div
			className={cn(
				"grid grid-cols-2 gap-4 lg:grid-cols-4",
				"*:min-h-48 *:w-full *:bg-muted *:border *:border-border *:dark:bg-muted/50"
			)}
		>
			{/* --- Card 1: Top Hero Section (Spans full width) --- */}
			<div className="relative col-span-2 min-h-114! lg:col-span-4" >
				<DecorIcon className="size-5 text-muted-foreground" position="top-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="top-right" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-right" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-right" />

				{/* --- Bleeding Grid Lines (Shared across all cards) --- */}
				{/* Adjust -inset-x-[300px] and -inset-y-[300px] to control how far they stretch */}
				<div className="pointer-events-none absolute -top-[1px] -inset-x-[50px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[50px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>

			{/* --- Card 2: Bottom Row - First Box --- */}
			<div className="relative">
				<DecorIcon className="size-5 text-muted-foreground" position="top-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="top-right" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-right" />

				<div className="pointer-events-none absolute -top-[1px] -inset-x-[100px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[100px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[100px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>

			{/* --- Card 3: Bottom Row - Second Box --- */}
			<div className="relative" >
				<div className="pointer-events-none absolute -top-[1px] -inset-x-[300px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[300px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[300px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[300px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>

			{/* --- Card 4: Bottom Row - Third Box --- */}
			<div className="relative" >
				<div className="pointer-events-none absolute -top-[1px] -inset-x-[300px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[300px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[300px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[300px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>

			{/* --- Card 5: Bottom Row - Fourth Box --- */}
			<div className="relative" >
				<div className="pointer-events-none absolute -top-[1px] -inset-x-[300px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[300px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[300px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[300px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>
		</div>
	);
}


