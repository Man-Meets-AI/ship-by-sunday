"use client";

import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { PacketStepInlineFeedback } from "@/features/packet-flow/lib/packet-step-save-feedback";

const feedbackToneClassName = {
	default: "",
	warning:
		"border-amber-500/40 bg-amber-50/70 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100",
	success:
		"border-emerald-500/40 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-100",
	destructive: "",
} as const satisfies Record<PacketStepInlineFeedback["tone"], string>;

export function PacketStageSaveFeedback({
	feedback,
}: {
	feedback: PacketStepInlineFeedback;
}) {
	return (
		<Alert
			variant={feedback.tone === "destructive" ? "destructive" : "default"}
			className={cn(feedbackToneClassName[feedback.tone])}
		>
			{feedback.tone === "warning" ? <AlertTriangleIcon aria-hidden /> : null}
			<AlertTitle>{feedback.title}</AlertTitle>
			<AlertDescription>{feedback.description}</AlertDescription>
		</Alert>
	);
}
