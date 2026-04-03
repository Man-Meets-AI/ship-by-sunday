import {
	getBlueprintFieldScaleDefinition,
	getBlueprintStepLabel,
	blueprintFieldHelperText,
	blueprintFieldInputKind,
	blueprintFieldLabel,
} from "../src/index";
import { describe, expect, it } from "vitest";

describe("blueprint presentation", () => {
	it("provides labels, helper text, and input kinds for blueprint forms", () => {
		expect(blueprintFieldLabel("primary_user")).toBe(
			"Who wants this? Who benefits from this?",
		);
		expect(blueprintFieldLabel("pricing")).toBe(
			"What's the one-time price in USD?",
		);
		expect(blueprintFieldHelperText("product_name")).toBe(
			"Enter the public-facing product name.",
		);
		expect(blueprintFieldInputKind("product_name")).toBe("input");
		expect(blueprintFieldInputKind("pricing")).toBe("number");
		expect(blueprintFieldInputKind("core_flow")).toBe("textarea");
	});

	it("provides scale metadata and step label overrides", () => {
		expect(getBlueprintFieldScaleDefinition("problem_severity")).toEqual(
			expect.objectContaining({
				leftLabel: "Minor annoyance",
				rightLabel: "Critical blocker",
			}),
		);
		expect(getBlueprintStepLabel("build-plan", "setup")).toBe(
			"Optional setup details",
		);
	});
});
