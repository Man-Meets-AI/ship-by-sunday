"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CheckoutQaLoopGoalCard() {
	return (
		<Card>
			<CardHeader className="space-y-2">
				<CardTitle className="text-base">Lesson goal</CardTitle>
				<CardDescription className="text-foreground/90">
					Test the <strong>fresh-account purchase path</strong> with a real QA
					pass (local app + payments + agent-driven browser), not generic “do
					QA.” Capture concrete bugs before you talk about launch.
				</CardDescription>
				<CardDescription>
					Deploy, Vercel, GitHub push, logs, and production env vars are covered
					in <strong>Production Deploy Handoff</strong> (3.14); the debug loop
					lives in <strong>3.13</strong>.
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
