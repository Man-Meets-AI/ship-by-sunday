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
		expect(blueprintFieldLabel("price_usd_cents")).toBe(
			"What is the actual numeric price?",
		);
		expect(blueprintFieldHelperText("product_name")).toBe(
			"Enter the public-facing product name.",
		);
		expect(blueprintFieldInputKind("product_name")).toBe("input");
		expect(blueprintFieldInputKind("price_usd_cents")).toBe("number");
		expect(blueprintFieldInputKind("screen_sequence")).toBe("textarea");
	});

	it("provides scale metadata and step label overrides", () => {
		expect(getBlueprintFieldScaleDefinition("problem_urgency")).toEqual(
			expect.objectContaining({
				leftLabel: "Can wait",
				rightLabel: "Immediate",
			}),
		);
		expect(getBlueprintStepLabel("product", "scope")).toBe(
			"What absolutely has to get built",
		);
	});
});
