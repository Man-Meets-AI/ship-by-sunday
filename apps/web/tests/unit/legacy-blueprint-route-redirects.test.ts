import { describe, expect, it } from "vitest";
import { getLegacyBlueprintRouteRedirectHref } from "@/app/(workspace)/_lib/legacy-blueprint-route-redirects";

describe("legacy blueprint route redirects", () => {
	it("maps old stage roots into canonical Blueprint destinations", () => {
		expect(getLegacyBlueprintRouteRedirectHref({ route: "start" })).toBe(
			"/blueprint",
		);
		expect(getLegacyBlueprintRouteRedirectHref({ route: "product" })).toBe(
			"/blueprint#problem",
		);
		expect(getLegacyBlueprintRouteRedirectHref({ route: "design" })).toBe(
			"/blueprint#design",
		);
		expect(getLegacyBlueprintRouteRedirectHref({ route: "marketing" })).toBe(
			"/blueprint#generated-preview",
		);
		expect(getLegacyBlueprintRouteRedirectHref({ route: "build-plan" })).toBe(
			"/blueprint#setup",
		);
	});

	it("honors known old step ids and falls back to the route default", () => {
		expect(
			getLegacyBlueprintRouteRedirectHref({
				route: "product",
				stepId: "foundation",
			}),
		).toBe("/blueprint#foundation");
		expect(
			getLegacyBlueprintRouteRedirectHref({
				route: "product",
				stepId: "outcome",
			}),
		).toBe("/blueprint#outcome");
		expect(
			getLegacyBlueprintRouteRedirectHref({
				route: "marketing",
				stepId: "operating-system",
			}),
		).toBe("/blueprint#generated-preview");
		expect(
			getLegacyBlueprintRouteRedirectHref({
				route: "build-plan",
				stepId: "pricing",
			}),
		).toBe("/blueprint#pricing");
		expect(
			getLegacyBlueprintRouteRedirectHref({
				route: "build-plan",
				stepId: "unknown",
			}),
		).toBe("/blueprint#setup");
	});
});
