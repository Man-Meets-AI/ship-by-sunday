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
		<section className="border-t border-border/40 pt-8 pb-4">
			{feedback ? (
				<div aria-live="polite" className="mb-4">
					<BlueprintStageSaveFeedback feedback={feedback} />
				</div>
			) : null}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm leading-6 text-muted-foreground">
					{isReviewReady
						? "Everything looks good. Continue to review your blueprint."
						: "Save your progress and continue when all sections are complete."}
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
