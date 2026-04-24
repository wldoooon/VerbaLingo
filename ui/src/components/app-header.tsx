"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { navLinks } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import { BellIcon } from "lucide-react";
import { SearchBar } from "@/components/comm/SearchBar";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { ThemeToggleButton, useThemeTransition } from "@/components/ui/shadcn-io/theme-toggle-button";

const activeItem = navLinks.find((item) => item.isActive);

export function AppHeader() {
	const { theme, setTheme } = useTheme();
	const { startTransition } = useThemeTransition();
	const [mounted, setMounted] = useState(false);

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
				"pxx-4 mb-6 flex items-center justify-between gap-2 md:px-2"
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
					<BellIcon
					/>
				</Button>
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser />
			</div>
		</header>
	);
}
