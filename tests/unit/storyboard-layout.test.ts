import {
	getDefaultLayoutModeForLesson,
	getLessonById,
	lessonSupportsLayoutToggle,
	normalizeLayoutModeForLesson,
} from "@/lib/course";

describe("storyboard layout rules", () => {
	it("locks lesson 2.3 to focus mode", () => {
		const lesson = getLessonById("2.3");
		expect(lesson).toBeTruthy();

		expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
		expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
	});

	it("coerces stale split state back to focus for lesson 2.3", () => {
		const lesson = getLessonById("2.3");
		expect(lesson).toBeTruthy();

		expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
		expect(normalizeLayoutModeForLesson(lesson!, "focus")).toBe("focus");
		expect(normalizeLayoutModeForLesson(lesson!, "weird")).toBe("focus");
	});
});
