import {
	getCodebaseStageFieldControlId,
	getCodebaseStageFieldInputId,
} from "@/lib/codebase-flow/codebase-step-save-feedback";
import type { CodebasePageSectionStatus } from "@/lib/codebase-flow/codebase-page-validation-model";

export function focusFirstMissingCodebaseField(
	sectionStatuses: CodebasePageSectionStatus[],
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
			getCodebaseStageFieldControlId(
				firstIncompleteSection.sectionId,
				firstMissingFieldKey,
			),
		) as HTMLElement | null;
		const input = document.getElementById(
			getCodebaseStageFieldInputId(
				firstIncompleteSection.sectionId,
				firstMissingFieldKey,
			),
		) as HTMLInputElement | HTMLTextAreaElement | null;
		const focusTarget = control ?? input;

		focusTarget?.scrollIntoView?.({ behavior: "smooth", block: "center" });
		focusTarget?.focus?.();
	}, 0);
}
