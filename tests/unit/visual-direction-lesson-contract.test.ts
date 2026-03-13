import {
	getLessonById,
	normalizeLessonFieldValues,
	getObjectiveTasks,
	isLessonFieldShapeCompatible,
} from "@/lib/course";

describe("visual direction lesson contract", () => {
	it("reconfigures lesson 2.6 into a watch-only visual-direction walkthrough", () => {
		const lesson = getLessonById("2.6");
		expect(lesson).toBeTruthy();

		expect(lesson?.shell).toBe("watch");
		expect(lesson?.workbench).toBe("visual_direction");
		expect(lesson?.coachVideoPlacement).toBeUndefined();
		expect(lesson?.promptImport).toBeUndefined();
		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(getObjectiveTasks(lesson!, {})).toEqual([]);
		expect(lesson?.pinnedArtifacts).toEqual(["rough_screens"]);
	});

	it("keeps legacy visual-direction fields inert now that 2.6 is watch-only", () => {
		const lesson = getLessonById("2.6");
		expect(lesson).toBeTruthy();
		const legacyFieldValues = {
			style_rule_1: "Quiet typography",
			style_rule_2: "Dense spacing",
			style_rule_3: "Sharp cards",
			avoid_rule: "Soft gradients",
		};

		expect(isLessonFieldShapeCompatible(lesson!, legacyFieldValues)).toBe(
			false,
		);
		expect(normalizeLessonFieldValues(lesson!, legacyFieldValues)).toEqual({});
	});
});
