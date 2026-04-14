import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function DemoPage() {
	return (
		<TooltipProvider>
			<AppShell>
				<DashboardSkeleton />
			</AppShell>
		</TooltipProvider>
	);
}
