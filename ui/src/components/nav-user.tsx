"use client";

import Link from "next/link";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon, CreditCardIcon, LogOutIcon, LifeBuoyIcon, ZapIcon } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUsageStore } from "@/stores/usage-store";
import { useLogoutMutation } from "@/lib/authHooks";

export function NavUser() {
	const user = useAuthStore((s) => s.user);
	const usageMap = useUsageStore((s) => s.usage);
	const { mutate: logout, isPending } = useLogoutMutation();

	const sparksBalance = usageMap["ai_chat"]?.balance ?? 0;
	const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
	const email = user?.email ?? "";
	const avatar = user?.oauth_avatar_url ?? "";
	const tier = user?.tier
		? user.tier.charAt(0).toUpperCase() + user.tier.slice(1)
		: "Free";
	const initials = displayName.charAt(0).toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="size-8 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
					<AvatarImage src={avatar} />
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuItem className="flex items-center justify-start gap-2">
					<DropdownMenuLabel className="flex items-center gap-3">
						<Avatar className="size-10">
							<AvatarImage src={avatar} />
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div>
							<span className="font-medium text-foreground">{displayName}</span>
							<br />
							<div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">
								{email}
							</div>
							<div className="mt-0.5 text-[10px] text-muted-foreground">
								{tier} plan
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="#">
							<UserIcon />
							Profile
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem className="justify-between pointer-events-none select-none">
						<div className="flex items-center gap-2">
							<ZapIcon />
							<span>AI Sparks</span>
						</div>
						<span className="text-xs font-mono text-foreground">
							{sparksBalance.toLocaleString()}
						</span>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/pricing">
							<CreditCardIcon />
							Plan &amp; Billing
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="#">
							<LifeBuoyIcon />
							Support
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						className="w-full cursor-pointer"
						variant="destructive"
						disabled={isPending}
						onClick={() => logout()}
					>
						<LogOutIcon />
						{isPending ? "Signing out…" : "Log out"}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
