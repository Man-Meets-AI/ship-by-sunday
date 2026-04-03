import { describe, expect, it } from "vitest";
import { getLegacyBlueprintRedirectHref } from "@/features/blueprint-flow/lib/legacy-blueprint-route-redirects";

describe("legacy blueprint route redirects", () => {
	it("maps the old staged routes onto canonical blueprint anchors", () => {
		expect(getLegacyBlueprintRedirectHref("start")).toBe("/blueprint");
		expect(getLegacyBlueprintRedirectHref("product", "problem")).toBe(
			"/blueprint#problem",
		);
		expect(getLegacyBlueprintRedirectHref("design", "references")).toBe(
			"/blueprint#design",
		);
		expect(getLegacyBlueprintRedirectHref("marketing", "preview")).toBe(
			"/blueprint#generated-preview",
		);
		expect(getLegacyBlueprintRedirectHref("buildPlan", "setup")).toBe(
			"/blueprint#setup",
		);
	});

	it("falls back to the section default when a legacy step is unknown", () => {
		expect(getLegacyBlueprintRedirectHref("product", "unknown")).toBe(
			"/blueprint#foundation",
		);
		expect(getLegacyBlueprintRedirectHref("buildPlan", "unknown")).toBe(
			"/blueprint#pricing",
		);
	});
});
