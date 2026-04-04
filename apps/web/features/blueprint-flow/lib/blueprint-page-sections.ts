import { getBlueprintStageDefinition } from "@shipbysunday/blueprint-compiler";

export const BLUEPRINT_OVERVIEW_ID = "overview" as const;

export const blueprintPageSectionIds = [
	"foundation",
	"problem",
	"outcome",
	"design",
	"pricing",
	"setup",
] as const;

export type BlueprintPageSectionId = (typeof blueprintPageSectionIds)[number];

const sectionDescriptionById = {
	foundation: "Name the product clearly and anchor who it is for.",
	problem: "Describe the pain, the moment it hits, and how severe it is.",
	outcome:
		"Define what success looks like and the concrete flow the user follows.",
	design:
		"Set the visual anchor and collect any references worth carrying forward.",
	pricing: "Capture the one-time price that shapes the generated starter.",
	setup:
		"Refine optional scope and handoff details only where you want to steer the output.",
} as const satisfies Record<BlueprintPageSectionId, string>;

const blueprintStage = getBlueprintStageDefinition("blueprint");
const blueprintStepById = new Map(
	blueprintStage.steps.map((step) => [step.id, step]),
);

export const blueprintPageSections = blueprintPageSectionIds.map(
	(sectionId) => {
		const step = blueprintStepById.get(sectionId);
		if (!step) {
			throw new Error(`Missing blueprint section definition for ${sectionId}`);
		}

		return {
			...step,
			id: sectionId,
			description: sectionDescriptionById[sectionId],
		};
	},
);

export function isBlueprintPageSectionId(
	value: string,
): value is BlueprintPageSectionId {
	return blueprintPageSectionIds.includes(value as BlueprintPageSectionId);
}

export function getBlueprintPageSectionHref(sectionId: BlueprintPageSectionId) {
	return `${blueprintStage.route}#${sectionId}`;
}

export function getBlueprintPageOverviewHref() {
	return `${blueprintStage.route}#${BLUEPRINT_OVERVIEW_ID}`;
}
