"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function BillingSuccessContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	const status = searchParams.get("status");
	const subscriptionId = searchParams.get("subscription_id");

	const isSuccess = status === "active";
	const [syncing, setSyncing] = useState(isSuccess);

	useEffect(() => {
		if (!isSuccess) return;

		let attempts = 0;
		const poll = async () => {
			attempts++;
			await queryClient.invalidateQueries({ queryKey: ["me"] });
			const user = queryClient.getQueryData<{ tier: string }>(["me"]);
			if ((user && user.tier !== "free") || attempts >= 6) {
				setSyncing(false);
			} else {
				setTimeout(poll, 2000);
			}
		};

		const timer = setTimeout(poll, 2000);
		return () => clearTimeout(timer);
	}, [isSuccess, queryClient]);

	if (!isSuccess) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
				<div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
					<XCircle className="size-8 text-destructive" />
				</div>
				<div className="space-y-2">
					<h1 className="font-bold text-2xl tracking-tight">Payment not completed</h1>
					<p className="max-w-sm text-muted-foreground text-sm">
						Your payment was not processed. No charge was made.
					</p>
				</div>
				<div className="flex gap-3">
					<Button onClick={() => router.push("/pricing")}>Try again</Button>
					<Button variant="outline" onClick={() => router.push("/")}>Go home</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
			<div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
				<CheckCircle2 className="size-8 text-green-500" />
			</div>
			<div className="space-y-2">
				<h1 className="font-bold text-2xl tracking-tight">Payment successful!</h1>
				<p className="max-w-sm text-muted-foreground text-sm">
					{syncing
						? "Activating your plan — this takes just a moment…"
						: "Your plan is now active. Enjoy your new features!"}
				</p>
				{subscriptionId && (
					<p className="text-muted-foreground text-xs">
						Subscription ID: {subscriptionId}
					</p>
				)}
			</div>
			{syncing ? (
				<Loader2 className="size-5 animate-spin text-muted-foreground" />
			) : (
				<div className="flex gap-3">
					<Button onClick={() => router.push("/search")}>Start searching</Button>
					<Button variant="outline" onClick={() => router.push("/profile")}>View profile</Button>
				</div>
			)}
		</div>
	);
}

export default function BillingSuccessPage() {
	return (
		<Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>}>
			<BillingSuccessContent />
		</Suspense>
	);
}
