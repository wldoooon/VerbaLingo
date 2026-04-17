"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

const latestChange = {
	badge: "UPDATE",
	title: "Smarter shipping quotes",
	description: "Real-time rates at checkout now.",
	readMore: { href: "#", label: "Changelog" },
} as const;

export function LatestChange() {
	const [isOpen, setIsOpen] = useState(true);

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className={cn(
				"rounded-xl group/latest-change w-full flex flex-col overflow-hidden border bg-background/50 backdrop-blur-sm shadow-sm",
				"transition-opacity group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0"
			)}
		>
			<div className="relative w-full h-24 overflow-hidden border-b border-border/40">
				<img 
					src="/orange-picture.jpg" 
					alt="Update background" 
					className="w-full h-full object-cover transition-transform duration-500"
				/>
				<span className="absolute bottom-2 left-3 px-1.5 py-0.5 rounded-sm bg-orange-500 text-[9px] font-bold text-white uppercase tracking-wider">
					{latestChange.badge}
				</span>
			</div>
			
			<div className="flex flex-col gap-1 p-3 pt-4">
				<p className="font-bold text-xs tracking-tight text-foreground">{latestChange.title}</p>
				<span className="text-[10px] text-muted-foreground leading-tight whitespace-normal">
					{latestChange.description}
				</span>
				<Button
					asChild
					className="w-max px-0 font-bold text-[10px] text-orange-500 hover:text-orange-600 transition-colors h-7"
					size="sm"
					variant="link"
				>
					<a href={latestChange.readMore.href}>{latestChange.readMore.label}</a>
				</Button>
			</div>

			<Button
				className="absolute top-2 right-2 z-20 size-6 rounded-full bg-background/50 backdrop-blur-md opacity-0 transition-opacity group-hover/latest-change:opacity-100"
				onClick={() => setIsOpen(false)}
				size="icon-sm"
				variant="ghost"
			>
				<XIcon className="size-3.5 text-muted-foreground" />
			</Button>
		</div>
	);
}
