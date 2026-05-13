import { describe, expect, it } from "vitest";
import { getLegacyCodebaseRouteRedirectHref } from "@/app/(workspace)/_lib/legacy-codebase-route-redirects";

describe("legacy codebase route redirects", () => {
	it("maps old stage roots into canonical Codebase destinations", () => {
		expect(getLegacyCodebaseRouteRedirectHref({ route: "start" })).toBe(
			"/starter/generate-codebase",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "product" })).toBe(
			"/starter/generate-codebase#problem",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "design" })).toBe(
			"/starter/generate-codebase#design",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "marketing" })).toBe(
			"/starter/generate-codebase#generated-preview",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "build-plan" })).toBe(
			"/starter/generate-codebase#setup",
		);
	});

	it("honors known old step ids and falls back to the route default", () => {
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "product",
				stepId: "foundation",
			}),
		).toBe("/starter/generate-codebase#foundation");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "product",
				stepId: "outcome",
			}),
		).toBe("/starter/generate-codebase#outcome");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "marketing",
				stepId: "operating-system",
			}),
		).toBe("/starter/generate-codebase#generated-preview");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "build-plan",
				stepId: "pricing",
			}),
		).toBe("/starter/generate-codebase#pricing");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "build-plan",
				stepId: "unknown",
			}),
		).toBe("/starter/generate-codebase#setup");
	});
});
