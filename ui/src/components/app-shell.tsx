import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import FooterWrapper from "@/components/FooterWrapper";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="overflow-x-hidden p-4 md:p-6">
				<AppHeader />
				<div className="flex flex-1 flex-col gap-4 p-1">
					{children}
				</div>
				<FooterWrapper />
			</SidebarInset>
		</SidebarProvider>
	);
}
