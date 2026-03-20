"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
	return (
		<div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
			<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				Run status
			</p>
			<div className="flex flex-wrap items-center gap-2">
				<Badge
					variant={browserOn ? "default" : "secondary"}
					className={cn(
						"cursor-pointer font-normal",
						browserOn && "bg-primary text-primary-foreground",
					)}
					role="button"
					tabIndex={0}
					onClick={() => onBrowserChange(!browserOn)}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							onBrowserChange(!browserOn);
						}
					}}
				>
					{browserOn ? "QA browser running" : "QA browser idle"}
				</Badge>
				<Badge variant="outline" className="max-w-[min(100%,280px)] truncate font-normal">
					Step: {currentStep.trim() || "—"}
				</Badge>
				<Badge variant="outline" className="max-w-[min(100%,280px)] truncate font-normal">
					Last issue: {lastIssue.trim() || "—"}
				</Badge>
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
		</div>
	);
}
