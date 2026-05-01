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
import { DecorIcon } from "@/components/ui/decor-icon";

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon" variant="floating" className="[&_[data-sidebar=sidebar]]:rounded-none [&_[data-sidebar=sidebar]]:border-border/40 [&_[data-sidebar=sidebar]]:relative [&_[data-sidebar=sidebar]]:bg-background">
			{/* --- Architectural Decorations --- */}
			<div className="absolute inset-0 pointer-events-none z-50">
				<DecorIcon className="size-4 text-muted-foreground/40" position="top-left" />
				<DecorIcon className="size-4 text-muted-foreground/40" position="top-right" />
				<DecorIcon className="size-4 text-muted-foreground/40" position="bottom-left" />
				<DecorIcon className="size-4 text-muted-foreground/40" position="bottom-right" />

				{/* Bleeding grid lines */}
				<div className="absolute -top-[1px] -inset-x-12 h-px bg-border/40" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="absolute -bottom-[1px] -inset-x-12 h-px bg-border/40" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
			</div>
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
