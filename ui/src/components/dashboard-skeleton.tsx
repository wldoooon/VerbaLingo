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
			<div className="rounded-lg col-span-2 min-h-114! lg:col-span-4" />
			<div className="relative">
				<DecorIcon className="size-3" position="top-left" />
				<DecorIcon className="size-3" position="top-right" />
				<DecorIcon className="size-3" position="bottom-left" />
				<DecorIcon className="size-3" position="bottom-right" />
			</div>
			<div className="rounded-lg" />
			<div className="rounded-lg" />
			<div className="rounded-lg" />
			<div className="rounded-lg col-span-2 min-h-92! lg:col-span-2" />
			<div className="rounded-lg col-span-2 min-h-92! lg:col-span-2" />
		</div>
	);
}
