import { routeConfig } from "@/config/product";
import {
	getCodebasePageSectionHref,
	type CodebasePageSectionId,
} from "@/lib/codebase-flow/codebase-page-sections";

export type LegacyCodebaseRoute =
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
} as const satisfies Record<LegacyCodebaseRoute, CodebasePageSectionId | null>;

const sectionByLegacyStep: Record<
	LegacyCodebaseRoute,
	Partial<Record<string, CodebasePageSectionId>>
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

export function getLegacyCodebaseRouteRedirectHref({
	route,
	stepId,
}: {
	route: LegacyCodebaseRoute;
	stepId?: string | null;
}) {
	const stepSectionId = stepId ? sectionByLegacyStep[route]?.[stepId] : null;
	const sectionId = stepSectionId ?? defaultSectionByLegacyRoute[route];

	return sectionId
		? getCodebasePageSectionHref(sectionId)
		: routeConfig.codebase;
}
