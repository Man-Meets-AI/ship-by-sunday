import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { deriveBlueprintFacts } from "@shipbysunday/blueprint-compiler";
import {
	blueprintPageSections,
	type BlueprintPageSectionId,
} from "@/lib/blueprint-flow/blueprint-page-sections";
import type { BlueprintStepInlineFeedback } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

export type BlueprintPageSectionStatus = {
	sectionId: BlueprintPageSectionId;
	isComplete: boolean;
	missingFactKeys: CanonicalProjectFactKey[];
};

function hasFactValue(
	value: CanonicalProjectFactsDraft[CanonicalProjectFactKey],
) {
	if (value === undefined || value === null) {
		return false;
	}
	if (typeof value === "string") {
		return value.trim().length > 0;
	}
	if (typeof value === "number") {
		return Number.isFinite(value);
	}
	if (Array.isArray(value)) {
		return value.length > 0;
	}
	return false;
}

export function buildSectionStatuses(
	facts: CanonicalProjectFactsDraft,
): BlueprintPageSectionStatus[] {
	const derivedFacts = deriveBlueprintFacts(facts);

	return blueprintPageSections.map((section) => {
		const requiredFieldKeys = section.requiredFieldKeys ?? section.fieldKeys;
		const missingFactKeys = requiredFieldKeys.filter(
			(fieldKey) => !hasFactValue(derivedFacts[fieldKey]),
		);

		return {
			sectionId: section.id,
			isComplete: missingFactKeys.length === 0,
			missingFactKeys,
		};
	});
}

export function buildFieldErrors(
	sectionStatuses: BlueprintPageSectionStatus[],
) {
	return Object.fromEntries(
		sectionStatuses.flatMap((sectionStatus) =>
			sectionStatus.missingFactKeys.map((fieldKey) => [
				fieldKey,
				"Add an answer here before Review can unlock.",
			]),
		),
	);
}

function formatFieldList(fieldKeys: CanonicalProjectFactKey[]) {
	return fieldKeys.map((fieldKey) => fieldKey.replaceAll("_", " ")).join(", ");
}

export function buildPageFeedback({
	hasAnyAnswer,
	isComplete,
	previouslyComplete,
	missingFactKeys,
}: {
	hasAnyAnswer: boolean;
	isComplete: boolean;
	previouslyComplete: boolean;
	missingFactKeys: CanonicalProjectFactKey[];
}): BlueprintStepInlineFeedback | null {
	if (isComplete) {
		return {
			tone: "success",
			title: "Saved and ready for review.",
			description: "The blueprint is complete. Continue to Review.",
		};
	}

	if (!hasAnyAnswer) {
		return {
			tone: "default",
			title: "Blueprint is still blank.",
			description: "Add at least one answer before continuing to Review.",
		};
	}

	return {
		tone: previouslyComplete ? "warning" : "default",
		title: previouslyComplete ? "Blueprint is incomplete." : "Draft saved.",
		description: `Complete ${formatFieldList(missingFactKeys)} before Review can unlock.`,
	};
}
