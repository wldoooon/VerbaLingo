"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { navLinks } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import { BellIcon } from "lucide-react";
import { SearchBar } from "@/components/comm/SearchBar";
import { AuthDialog } from "@/components/auth-dialog";
import { useAuthStore } from "@/stores/auth-store";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { ThemeToggleButton, useThemeTransition } from "@/components/ui/shadcn-io/theme-toggle-button";

export function AppHeader() {
	const { theme, setTheme } = useTheme();
	const { startTransition } = useThemeTransition();
	const [mounted, setMounted] = useState(false);
	const authStatus = useAuthStore((s) => s.status);
	const pathname = usePathname();

	const activeItem = navLinks.find((item) => {
		if (!item.path || item.path === "#") return false;
		if (item.path === "/") return pathname === "/";
		return pathname === item.path || pathname.startsWith(item.path + "/");
	});

	useEffect(() => setMounted(true), []);

	const handleThemeToggle = useCallback(() => {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		startTransition(() => {
			setTheme(newTheme);
		});
	}, [theme, setTheme, startTransition]);

	return (
		<header
			className={cn(
				"pxx-4 mb-6 flex items-center justify-between gap-2 md:px-2 relative z-50"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>

			<div className="flex-1 flex justify-center px-4 max-w-4xl">
				<SearchBar />
			</div>

			<div className="flex items-center gap-3">
				{mounted && (
					<ThemeToggleButton
						theme={theme as 'light' | 'dark'}
						onClick={handleThemeToggle}
						variant="circle"
						start="top-right"
						className="h-9 w-9 mr-1"
					/>
				)}
				<Button aria-label="Notifications" size="icon" variant="ghost">
					<BellIcon />
				</Button>
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				{authStatus === "guest" ? (
					<div className="flex items-center gap-2">
						<AuthDialog defaultTab="login">
							<Button variant="ghost" size="sm" className="font-medium">
								Sign in
							</Button>
						</AuthDialog>
						<AuthDialog defaultTab="signup">
							<Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
								Get Started
							</Button>
						</AuthDialog>
					</div>
				) : authStatus === "authenticated" ? (
					<NavUser />
				) : (
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-16 rounded-md" />
						<Skeleton className="h-8 w-24 rounded-md" />
					</div>
				)}
			</div>
		</header>
	);
}
