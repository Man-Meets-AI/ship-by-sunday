import { describe, expect, it } from "vitest";
import { getLegacyCodebaseRouteRedirectHref } from "@/app/(workspace)/_lib/legacy-codebase-route-redirects";

describe("legacy codebase route redirects", () => {
	it("maps old stage roots into canonical Codebase destinations", () => {
		expect(getLegacyCodebaseRouteRedirectHref({ route: "start" })).toBe(
			"/generate-codebase",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "product" })).toBe(
			"/generate-codebase#problem",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "design" })).toBe(
			"/generate-codebase#design",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "marketing" })).toBe(
			"/generate-codebase#generated-preview",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "build-plan" })).toBe(
			"/generate-codebase#setup",
		);
	});

	it("honors known old step ids and falls back to the route default", () => {
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "product",
				stepId: "foundation",
			}),
		).toBe("/generate-codebase#foundation");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "product",
				stepId: "outcome",
			}),
		).toBe("/generate-codebase#outcome");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "marketing",
				stepId: "operating-system",
			}),
		).toBe("/generate-codebase#generated-preview");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "build-plan",
				stepId: "pricing",
			}),
		).toBe("/generate-codebase#pricing");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "build-plan",
				stepId: "unknown",
			}),
		).toBe("/generate-codebase#setup");
	});
});
