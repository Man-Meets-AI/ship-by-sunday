"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CheckoutQaLoopSteerCard() {
	return (
		<Card>
			<CardHeader className="space-y-2">
				<CardTitle className="text-base">Steer the agent</CardTitle>
				<CardDescription>
					When Playwright stalls on Clerk, tell the agent explicitly to use the{" "}
					<strong>Clerk skill</strong> (or your documented Clerk flow) and
					restate the current goal (fresh purchase, test card, etc.).
				</CardDescription>
				<CardDescription>
					If you change a Clerk setting while it runs, say so in the thread
					before asking it to retry—otherwise it will keep failing the same way.
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
