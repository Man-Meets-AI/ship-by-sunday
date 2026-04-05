"use client";

import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlueprintStepInlineFeedback } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";

const feedbackToneClassName = {
	default: "border-border/60 bg-muted/30 text-muted-foreground",
	warning:
		"border-amber-500/30 bg-amber-50/70 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100",
	success:
		"border-emerald-500/30 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-100",
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
			className={cn(feedbackToneClassName[feedback.tone])}
			data-slot="blueprint-stage-save-feedback"
		>
			<div className="flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm leading-6">
				{feedback.tone === "warning" || feedback.tone === "destructive" ? (
					<AlertTriangleIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
				) : null}
				<div className="min-w-0">
					<p className="font-medium text-foreground">{feedback.title}</p>
					<p className="text-current/85">{feedback.description}</p>
				</div>
			</div>
		</div>
	);
}
