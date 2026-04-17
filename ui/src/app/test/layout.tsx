import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";

export default function TestLayout({ children }: { children: React.ReactNode }) {
	return (
		<TooltipProvider>
			<AppShell>
				{children}
			</AppShell>
		</TooltipProvider>
	);
}
