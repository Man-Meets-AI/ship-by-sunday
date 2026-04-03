import { legacyRouteConfig, routeConfig } from "@/config/product";
import {
	getBlueprintPageSectionHref,
	type BlueprintPageSectionId,
} from "@/features/blueprint-flow/lib/blueprint-page-sections";

type LegacyBlueprintStageSegment = keyof typeof legacyRouteConfig;

const defaultSectionByLegacyStage = {
	start: null,
	product: "foundation",
	design: "design",
	marketing: "generated-preview",
	buildPlan: "pricing",
} as const satisfies Record<
	LegacyBlueprintStageSegment,
	BlueprintPageSectionId | null
>;

const legacyStepSectionMap = {
	product: {
		foundation: "foundation",
		problem: "problem",
		outcome: "outcome",
	},
	design: {
		direction: "design",
		references: "design",
	},
	marketing: {
		preview: "generated-preview",
	},
	buildPlan: {
		delivery: "pricing",
		setup: "setup",
	},
} as const satisfies Partial<
	Record<string, Record<string, BlueprintPageSectionId>>
>;

function getSectionHref(sectionId: BlueprintPageSectionId | null) {
	return sectionId
		? getBlueprintPageSectionHref(sectionId)
		: routeConfig.blueprint;
}

export function getLegacyBlueprintRedirectHref(
	stageSegment: LegacyBlueprintStageSegment,
	stepSegment?: string,
) {
	if (stageSegment === "start") {
		return routeConfig.blueprint;
	}

	const normalizedStageSegment =
		stageSegment === "buildPlan" ? "buildPlan" : stageSegment;
	const stepMap = legacyStepSectionMap[normalizedStageSegment];
	if (stepSegment && stepMap) {
		const sectionId = stepMap[stepSegment as keyof typeof stepMap];
		if (sectionId) {
			return getBlueprintPageSectionHref(sectionId);
		}
	}

	return getSectionHref(defaultSectionByLegacyStage[stageSegment]);
}
