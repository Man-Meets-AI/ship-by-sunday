"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CheckoutQaLoopStaticPanels() {
	return (
		<div className="space-y-3">
			<Alert>
				<AlertTitle>Intended checkout UX</AlertTitle>
				<AlertDescription>
					Students should be able to <strong>buy first</strong>, then have the
					account created from the{" "}
					<strong>email used in Stripe checkout</strong>
					—not forced through a long sign-up detour before paying.
				</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertTitle>Watch for broken flow signals</AlertTitle>
				<AlertDescription>
					If checkout shows the wrong price (e.g. a stale <strong>$99</strong>{" "}
					line) or confusing/low-contrast copy, log it—those are first-class
					bugs for this lesson.
				</AlertDescription>
			</Alert>
			<Alert>
				<AlertTitle>This lesson is QA, not launch</AlertTitle>
				<AlertDescription>
					Skip production deploy, marketing copy generation, and unrelated
					plugins. You are here to run one checkout pass and capture issues.
				</AlertDescription>
			</Alert>
			<Alert>
				<AlertTitle>Agents can drive the browser</AlertTitle>
				<AlertDescription>
					Browser automation can feel “hands off,” but you still steer when auth
					or verification blocks the run—that is part of the workflow.
				</AlertDescription>
			</Alert>
		</div>
	);
}
