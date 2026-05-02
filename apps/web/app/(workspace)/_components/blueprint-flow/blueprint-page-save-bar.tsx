"use client";

import { ArrowRightIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BlueprintStageSaveFeedback } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-save-feedback";
import {
	type BlueprintSaveBarPhase,
	useBlueprintSaveBarPhase,
} from "@/app/(workspace)/_hooks/blueprint-flow/use-blueprint-save-bar-phase";
import { cn } from "@/lib/utils";
import type { BlueprintStepInlineFeedback } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

const PHASE_LABEL: Record<Exclude<BlueprintSaveBarPhase, "idle">, string> = {
	saving: "Saving your blueprint…",
	redirecting: "Opening review…",
};

export function BlueprintPageSaveBar({
	feedback,
	isReviewReady,
	isSaving,
	onSaveAndContinue,
}: {
	feedback: BlueprintStepInlineFeedback | null;
	isReviewReady: boolean;
	isSaving: boolean;
	onSaveAndContinue: () => void | Promise<void>;
}) {
	const [isErrorDismissed, setIsErrorDismissed] = useState(false);
	const phase = useBlueprintSaveBarPhase({ feedback, isSaving });
	const visibleFeedback =
		feedback && (feedback.tone !== "destructive" || !isErrorDismissed)
			? feedback
			: null;
	const isBusy = phase !== "idle";

	useEffect(() => {
		if (feedback?.tone === "destructive") {
			setIsErrorDismissed(false);
		}
	}, [feedback]);

	return (
		<section
			className={cn(
				"border-t border-border/40 pt-8",
				"sticky bottom-2 z-20 -mx-4 mt-2 rounded-xl border-x border-border/40 bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70",
				"sm:static sm:mx-0 sm:rounded-none sm:border-x-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none",
				"pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4",
			)}
			data-testid="blueprint-page-save-bar"
			data-phase={phase}
		>
			{visibleFeedback ? (
				<BlueprintPageFeedbackRow
					feedback={visibleFeedback}
					onDismiss={
						visibleFeedback.tone === "destructive"
							? () => setIsErrorDismissed(true)
							: undefined
					}
				/>
			) : null}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm leading-relaxed text-muted-foreground">
					{isReviewReady
						? "All sections complete. You can continue to review."
						: "Complete all sections to unlock review."}
				</p>
				<Button
					type="button"
					size="lg"
					className="shrink-0 gap-2 px-6"
					disabled={isBusy}
					onClick={onSaveAndContinue}
					data-testid="blueprint-page-save-cta"
					data-phase={phase}
				>
					{isBusy ? (
						<>
							<Spinner className="size-4" />
							{PHASE_LABEL[phase as Exclude<BlueprintSaveBarPhase, "idle">]}
						</>
					) : (
						<>
							Continue to Review
							<ArrowRightIcon data-icon="inline-end" className="size-4" />
						</>
					)}
				</Button>
			</div>
		</section>
	);
}

function BlueprintPageFeedbackRow({
	feedback,
	onDismiss,
}: {
	feedback: BlueprintStepInlineFeedback;
	onDismiss?: () => void;
}) {
	if (!onDismiss) {
		return (
			<div
				aria-live="polite"
				className="mb-6"
				data-testid="blueprint-page-save-feedback"
			>
				<BlueprintStageSaveFeedback feedback={feedback} />
			</div>
		);
	}
	return (
		<div className="relative mb-6" data-testid="blueprint-page-save-feedback">
			<BlueprintStageSaveFeedback feedback={feedback} />
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				onClick={onDismiss}
				aria-label="Dismiss error"
				className="absolute right-2 top-2 size-6 text-current/60 hover:text-current"
				data-testid="blueprint-page-save-feedback-dismiss"
			>
				<XIcon className="size-3.5" />
			</Button>
		</div>
	);
}
