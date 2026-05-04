import {
	getCodebaseFieldScaleDefinition,
	getCodebaseStepLabel,
	codebaseFieldHelperText,
	codebaseFieldInputKind,
	codebaseFieldLabel,
} from "../src/index";
import { describe, expect, it } from "vitest";

describe("codebase presentation", () => {
	it("provides labels, helper text, and input kinds for codebase forms", () => {
		expect(codebaseFieldLabel("primary_user")).toBe(
			"Who wants this? Who benefits from this?",
		);
		expect(codebaseFieldLabel("pricing")).toBe(
			"What's the one-time price in USD?",
		);
		expect(codebaseFieldLabel("design_preset_id")).toBe(
			"Choose a design direction",
		);
		expect(codebaseFieldHelperText("product_name")).toBe(
			"Enter the public-facing product name.",
		);
		expect(codebaseFieldHelperText("theme_preset")).toContain(
			"Adjust the starter theme",
		);
		expect(codebaseFieldInputKind("product_name")).toBe("input");
		expect(codebaseFieldInputKind("pricing")).toBe("number");
		expect(codebaseFieldInputKind("core_flow")).toBe("textarea");
	});

	it("provides scale metadata and step label overrides", () => {
		expect(getCodebaseFieldScaleDefinition("problem_severity")).toEqual(
			expect.objectContaining({
				leftLabel: "Minor annoyance",
				rightLabel: "Critical blocker",
			}),
		);
		expect(getCodebaseStepLabel("codebase", "setup")).toBe(
			"Optional setup details",
		);
	});
});
