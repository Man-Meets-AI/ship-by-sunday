import { routeConfig } from "@/config/product";
import {
	getBlueprintPageSectionHref,
	type BlueprintPageSectionId,
} from "@/features/blueprint-flow/lib/blueprint-page-sections";

export type LegacyBlueprintRoute =
	| "start"
	| "product"
	| "design"
	| "marketing"
	| "build-plan";

const defaultSectionByLegacyRoute = {
	start: null,
	product: "problem",
	design: "design",
	marketing: "generated-preview",
	"build-plan": "setup",
} as const satisfies Record<
	LegacyBlueprintRoute,
	BlueprintPageSectionId | null
>;

const sectionByLegacyStep: Record<
	LegacyBlueprintRoute,
	Partial<Record<string, BlueprintPageSectionId>>
> = {
	start: {},
	product: {
		foundation: "foundation",
		problem: "problem",
		outcome: "outcome",
	},
	design: {
		design: "design",
	},
	marketing: {
		preview: "generated-preview",
		"generated-preview": "generated-preview",
		"operating-system": "generated-preview",
	},
	"build-plan": {
		pricing: "pricing",
		setup: "setup",
	},
};

export function getLegacyBlueprintRouteRedirectHref({
	route,
	stepId,
}: {
	route: LegacyBlueprintRoute;
	stepId?: string | null;
}) {
	const stepSectionId = stepId ? sectionByLegacyStep[route]?.[stepId] : null;
	const sectionId = stepSectionId ?? defaultSectionByLegacyRoute[route];

	return sectionId
		? getBlueprintPageSectionHref(sectionId)
		: routeConfig.blueprint;
}
