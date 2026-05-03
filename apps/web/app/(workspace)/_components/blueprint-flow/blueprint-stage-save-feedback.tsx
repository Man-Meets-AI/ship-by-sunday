"use client";

import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlueprintStepInlineFeedback } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

const feedbackToneClassName = {
	default: "border-border/60 bg-muted/30 text-muted-foreground",
	warning: "border-state-warning/30 bg-state-warning/10 text-state-warning",
	success: "border-state-success/30 bg-state-success/10 text-state-success",
	destructive:
		"border-destructive/30 bg-destructive/6 text-destructive dark:bg-destructive/12",
} as const satisfies Record<BlueprintStepInlineFeedback["tone"], string>;

export function BlueprintStageSaveFeedback({
	feedback,
}: {
	feedback: BlueprintStepInlineFeedback;
}) {
	return (
		<div
			role={feedback.tone === "destructive" ? "alert" : "status"}
			data-slot="blueprint-stage-save-feedback"
		>
			<div
				className={cn(
					"flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm leading-6",
					feedbackToneClassName[feedback.tone],
				)}
			>
				{feedback.tone === "warning" || feedback.tone === "destructive" ? (
					<AlertTriangleIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
				) : null}
				<div className="min-w-0">
					<p className="font-medium text-foreground">{feedback.title}</p>
					<p className="text-muted-foreground">{feedback.description}</p>
				</div>
			</div>
		</div>
	);
}
