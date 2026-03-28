import {
	getPacketFieldScaleDefinition,
	normalizeProblemUrgencyValue,
	normalizeProblemSeverityValue,
} from "@packet-compiler";
import { describe, expect, it } from "vitest";

describe("packet field scales", () => {
	it("normalizes severity labels and freeform severity text", () => {
		expect(normalizeProblemSeverityValue("High")).toBe("8");
		expect(normalizeProblemSeverityValue("medium")).toBe("5");
		expect(normalizeProblemSeverityValue("low")).toBe("3");
		expect(
			normalizeProblemSeverityValue(
				"It's extremely annoying. Probably a 7 out of 10.",
			),
		).toBe("7");
	});

	it("normalizes urgency labels and legacy urgency text", () => {
		expect(normalizeProblemUrgencyValue("This week")).toBe(
			"Needs attention soon",
		);
		expect(normalizeProblemUrgencyValue("urgent")).toBe("Needs action now");
		expect(normalizeProblemUrgencyValue("can wait")).toBe("Can schedule");
	});

	it("returns shared scale metadata for packet scale fields", () => {
		expect(getPacketFieldScaleDefinition("problem_severity")).toEqual(
			expect.objectContaining({
				leftLabel: "Minor annoyance",
				rightLabel: "Critical blocker",
			}),
		);
		expect(getPacketFieldScaleDefinition("problem_urgency")).toEqual(
			expect.objectContaining({
				leftLabel: "Can wait",
				rightLabel: "Immediate",
			}),
		);
	});
});
