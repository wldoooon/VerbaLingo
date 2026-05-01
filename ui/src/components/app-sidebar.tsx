"use client";

import Image from "next/image";
import Link from "next/link";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/nav-group";
import { footerNavLinks, navGroups } from "@/components/app-shared";
import { UsageMeter } from "@/components/usage-meter";
export function AppSidebar() {
	return (
		<Sidebar collapsible="icon" variant="floating" className="[&_[data-sidebar=sidebar]]:rounded-2xl [&_[data-sidebar=sidebar]]:border-border/40 [&_[data-sidebar=sidebar]]:relative [&_[data-sidebar=sidebar]]:bg-background">
			<SidebarHeader className="h-14 border-b border-border/40">
				<a href="/" className="flex h-full w-full items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
					<Image src="/main_logo.png" alt="PokiSpokey" width={34} height={34} className="size-9 shrink-0" />
					<span className="font-medium group-data-[collapsible=icon]:hidden">PokiSpokey</span>
				</a>
			</SidebarHeader>
			<SidebarContent>
				{navGroups.map((group, index) => (
					<NavGroup key={`sidebar-group-${index}`} {...group} />
				))}
			</SidebarContent>
			<SidebarFooter className="border-t border-border/40">
				<UsageMeter />
				<SidebarMenu className="mt-2">
					{footerNavLinks.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								className="text-muted-foreground"
								isActive={item.isActive}
								size="sm"
							>
								<Link href={item.path ?? "#"}>
									{item.icon}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
