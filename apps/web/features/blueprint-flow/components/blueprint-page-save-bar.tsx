import { Button } from "@/components/ui/button";
import { BlueprintStageSaveFeedback } from "@/features/blueprint-flow/components/blueprint-stage-save-feedback";
import type { BlueprintStepInlineFeedback } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";

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
	return (
		<section className="space-y-4 rounded-[24px] border border-border/60 bg-background p-6 shadow-sm">
			<div aria-live="polite" className={feedback ? undefined : "min-h-12"}>
				{feedback ? <BlueprintStageSaveFeedback feedback={feedback} /> : null}
			</div>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm leading-6 text-muted-foreground">
					{isReviewReady
						? "The blueprint is complete. Continue to Review for the final handoff."
						: "Continue saves the current draft, reveals any remaining blockers, and moves to Review only when the blueprint is complete."}
				</p>
				<Button
					type="button"
					className="h-11 min-w-52"
					disabled={isSaving}
					onClick={onSaveAndContinue}
				>
					{isSaving ? "Saving..." : "Continue to Review"}
				</Button>
			</div>
		</section>
	);
}
