"use client";

import { ArrowRightIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CodebaseStageSaveFeedback } from "@/app/(workspace)/_components/codebase-flow/codebase-stage-save-feedback";
import {
	type CodebaseSaveBarPhase,
	useCodebaseSaveBarPhase,
} from "@/app/(workspace)/_hooks/codebase-flow/use-codebase-save-bar-phase";
import { useCodebaseSavedRelativeTime } from "@/app/(workspace)/_hooks/codebase-flow/use-codebase-saved-relative-time";
import { cn } from "@/lib/utils";
import type { CodebaseStepInlineFeedback } from "@/lib/codebase-flow/codebase-step-save-feedback";

const PHASE_LABEL: Record<Exclude<CodebaseSaveBarPhase, "idle">, string> = {
	saving: "Saving your codebase…",
	redirecting: "Opening review…",
};

export function CodebasePageSaveBar({
	feedback,
	isReviewReady,
	isSaving,
	lastSavedAt,
	onSaveAndContinue,
}: {
	feedback: CodebaseStepInlineFeedback | null;
	isReviewReady: boolean;
	isSaving: boolean;
	lastSavedAt: number | null;
	onSaveAndContinue: () => void | Promise<void>;
}) {
	const [isErrorDismissed, setIsErrorDismissed] = useState(false);
	const phase = useCodebaseSaveBarPhase({ feedback, isSaving });
	const relativeTime = useCodebaseSavedRelativeTime(lastSavedAt);
	const visibleFeedback =
		feedback && (feedback.tone !== "destructive" || !isErrorDismissed)
			? feedback
			: null;
	const isBusy = phase !== "idle";
	const showRelativeTime = !isBusy && relativeTime !== null;

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
			data-testid="codebase-page-save-bar"
			data-phase={phase}
		>
			{visibleFeedback ? (
				<CodebasePageFeedbackRow
					feedback={visibleFeedback}
					onDismiss={
						visibleFeedback.tone === "destructive"
							? () => setIsErrorDismissed(true)
							: undefined
					}
				/>
			) : null}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<p className="text-sm leading-relaxed text-muted-foreground">
						{isReviewReady
							? "All sections complete. You can continue to review."
							: "Complete all sections to unlock review."}
					</p>
					{showRelativeTime ? (
						<p
							className="text-xs text-muted-foreground/70"
							data-testid="codebase-page-save-bar-last-saved"
						>
							{relativeTime}
						</p>
					) : null}
				</div>
				<Button
					type="button"
					size="lg"
					className="shrink-0 gap-2 px-6"
					disabled={isBusy}
					onClick={onSaveAndContinue}
					data-testid="codebase-page-save-cta"
					data-phase={phase}
				>
					{isBusy ? (
						<>
							<Spinner className="size-4" />
							{PHASE_LABEL[phase as Exclude<CodebaseSaveBarPhase, "idle">]}
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

function CodebasePageFeedbackRow({
	feedback,
	onDismiss,
}: {
	feedback: CodebaseStepInlineFeedback;
	onDismiss?: () => void;
}) {
	if (!onDismiss) {
		return (
			<div
				aria-live="polite"
				className="mb-6"
				data-testid="codebase-page-save-feedback"
			>
				<CodebaseStageSaveFeedback feedback={feedback} />
			</div>
		);
	}
	return (
		<div className="relative mb-6" data-testid="codebase-page-save-feedback">
			<CodebaseStageSaveFeedback feedback={feedback} />
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				onClick={onDismiss}
				aria-label="Dismiss error"
				className="absolute right-2 top-2 size-6 text-current/60 hover:text-current"
				data-testid="codebase-page-save-feedback-dismiss"
			>
				<XIcon className="size-3.5" />
			</Button>
		</div>
	);
}
