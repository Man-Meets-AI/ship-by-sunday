import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueprintStageSaveFeedback } from "@/features/blueprint-flow/components/blueprint-stage-save-feedback";
import { Spinner } from "@/components/ui/spinner";
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
		<section className="border-t border-border/40 pb-4 pt-8">
			{feedback ? (
				<div aria-live="polite" className="mb-6">
					<BlueprintStageSaveFeedback feedback={feedback} />
				</div>
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
					disabled={isSaving}
					onClick={onSaveAndContinue}
				>
					{isSaving ? (
						<>
							<Spinner className="size-4" />
							Saving…
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
