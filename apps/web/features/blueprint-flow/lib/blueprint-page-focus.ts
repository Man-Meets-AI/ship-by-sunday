import {
	getBlueprintStageFieldControlId,
	getBlueprintStageFieldInputId,
} from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import type { BlueprintPageSectionStatus } from "@/features/blueprint-flow/lib/blueprint-page-validation-model";

export function focusFirstMissingBlueprintField(
	sectionStatuses: BlueprintPageSectionStatus[],
) {
	const firstIncompleteSection = sectionStatuses.find(
		(sectionStatus) => sectionStatus.missingFactKeys.length > 0,
	);
	const firstMissingFieldKey = firstIncompleteSection?.missingFactKeys[0];
	if (!firstIncompleteSection || !firstMissingFieldKey) {
		return;
	}

	window.setTimeout(() => {
		const control = document.getElementById(
			getBlueprintStageFieldControlId(
				firstIncompleteSection.sectionId,
				firstMissingFieldKey,
			),
		) as HTMLElement | null;
		const input = document.getElementById(
			getBlueprintStageFieldInputId(
				firstIncompleteSection.sectionId,
				firstMissingFieldKey,
			),
		) as HTMLInputElement | HTMLTextAreaElement | null;
		const focusTarget = control ?? input;

		focusTarget?.scrollIntoView?.({ behavior: "smooth", block: "center" });
		focusTarget?.focus?.();
	}, 0);
}
