"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function CheckoutQaLoopStatusRow({
	browserOn,
	onBrowserChange,
	currentStep,
	lastIssue,
	onCurrentStepChange,
	onLastIssueChange,
}: {
	browserOn: boolean;
	onBrowserChange: (value: boolean) => void;
	currentStep: string;
	lastIssue: string;
	onCurrentStepChange: (value: string) => void;
	onLastIssueChange: (value: string) => void;
}) {
	const stepPreview = currentStep.trim() || "—";
	const issuePreview = lastIssue.trim() || "—";

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Run status</CardTitle>
				<CardDescription>
					Step: {stepPreview} · Last issue: {issuePreview}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-3">
					<Switch
						id="checkout-qa-browser-running"
						checked={browserOn}
						onCheckedChange={onBrowserChange}
					/>
					<Label htmlFor="checkout-qa-browser-running" className="font-normal">
						{browserOn ? "QA browser running" : "QA browser idle"}
					</Label>
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="checkout-qa-current-step" className="text-xs">
							Current step (optional)
						</Label>
						<Input
							id="checkout-qa-current-step"
							value={currentStep}
							onChange={(event) => onCurrentStepChange(event.target.value)}
							placeholder="e.g. Stripe checkout"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="checkout-qa-last-issue" className="text-xs">
							Last issue found (optional)
						</Label>
						<Input
							id="checkout-qa-last-issue"
							value={lastIssue}
							onChange={(event) => onLastIssueChange(event.target.value)}
							placeholder="Short note"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
