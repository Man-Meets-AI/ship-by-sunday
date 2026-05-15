import { getCodebaseStageDefinition } from "@shipbysunday/codebase-compiler";

import { routeConfig } from "@/config/product";

export const CODEBASE_OVERVIEW_ID = "overview" as const;

export const codebasePageSectionIds = [
	"foundation",
	"problem",
	"outcome",
	"design",
	"pricing",
	"setup",
	"generated-preview",
] as const;

export type CodebasePageSectionId = (typeof codebasePageSectionIds)[number];

const sectionDescriptionById = {
	foundation: "Name the product clearly and anchor who it is for.",
	problem: "Describe the pain, the moment it hits, and how severe it is.",
	outcome:
		"Define what success looks like and the concrete flow the user follows.",
	design:
		"Set the visual anchor and collect any references worth carrying forward.",
	pricing:
		"Choose a pricing model and set the price for the generated starter.",
	setup:
		"Refine optional scope and handoff details only where you want to steer the output.",
	"generated-preview":
		"Review the generated system preview that downstream packets and lessons reference.",
} as const satisfies Record<CodebasePageSectionId, string>;

const codebaseStage = getCodebaseStageDefinition("codebase");
const codebaseStepById = new Map(
	codebaseStage.steps.map((step) => [step.id, step]),
);

export const codebasePageSections = codebasePageSectionIds.map((sectionId) => {
	const step = codebaseStepById.get(sectionId);
	if (!step) {
		throw new Error(`Missing codebase section definition for ${sectionId}`);
	}

	return {
		...step,
		id: sectionId,
		description: sectionDescriptionById[sectionId],
	};
});

export function isCodebasePageSectionId(
	value: string,
): value is CodebasePageSectionId {
	return codebasePageSectionIds.includes(value as CodebasePageSectionId);
}

export function getCodebasePageSectionHref(sectionId: CodebasePageSectionId) {
	return `${routeConfig.codebase}#${sectionId}`;
}

export function getCodebasePageOverviewHref() {
	return `${routeConfig.codebase}#${CODEBASE_OVERVIEW_ID}`;
}
