import { describe, expect, it } from "vitest";
import { getLegacyCodebaseRouteRedirectHref } from "@/app/(workspace)/_lib/legacy-codebase-route-redirects";

describe("legacy codebase route redirects", () => {
	it("maps old stage roots into canonical Codebase destinations", () => {
		expect(getLegacyCodebaseRouteRedirectHref({ route: "start" })).toBe(
			"/codebase",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "product" })).toBe(
			"/codebase#problem",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "design" })).toBe(
			"/codebase#design",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "marketing" })).toBe(
			"/codebase#generated-preview",
		);
		expect(getLegacyCodebaseRouteRedirectHref({ route: "build-plan" })).toBe(
			"/codebase#setup",
		);
	});

	it("honors known old step ids and falls back to the route default", () => {
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "product",
				stepId: "foundation",
			}),
		).toBe("/codebase#foundation");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "product",
				stepId: "outcome",
			}),
		).toBe("/codebase#outcome");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "marketing",
				stepId: "operating-system",
			}),
		).toBe("/codebase#generated-preview");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "build-plan",
				stepId: "pricing",
			}),
		).toBe("/codebase#pricing");
		expect(
			getLegacyCodebaseRouteRedirectHref({
				route: "build-plan",
				stepId: "unknown",
			}),
		).toBe("/codebase#setup");
	});
});
