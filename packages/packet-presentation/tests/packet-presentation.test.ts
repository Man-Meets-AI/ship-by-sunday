import {
	getPacketFieldScaleDefinition,
	getPacketStepLabel,
	packetFieldHelperText,
	packetFieldInputKind,
	packetFieldLabel,
} from "../src/index";
import { describe, expect, it } from "vitest";

describe("packet presentation", () => {
	it("provides labels, helper text, and input kinds for packet forms", () => {
		expect(packetFieldLabel("primary_user")).toBe(
			"Who wants this? Who benefits from this?",
		);
		expect(packetFieldLabel("price_usd_cents")).toBe(
			"What is the actual numeric price?",
		);
		expect(packetFieldHelperText("product_name")).toBe(
			"Enter the public-facing product name.",
		);
		expect(packetFieldInputKind("product_name")).toBe("input");
		expect(packetFieldInputKind("price_usd_cents")).toBe("number");
		expect(packetFieldInputKind("screen_sequence")).toBe("textarea");
	});

	it("provides scale metadata and step label overrides", () => {
		expect(getPacketFieldScaleDefinition("problem_urgency")).toEqual(
			expect.objectContaining({
				leftLabel: "Can wait",
				rightLabel: "Immediate",
			}),
		);
		expect(getPacketStepLabel("product", "scope")).toBe(
			"What absolutely has to get built",
		);
	});
});
