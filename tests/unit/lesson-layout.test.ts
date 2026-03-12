import {
	getAvailableLayoutModesForLesson,
	getDefaultLayoutModeForLesson,
	getLessonById,
	lessonSupportsLayoutToggle,
	normalizeLayoutModeForLesson,
} from "@/lib/course";

describe("lesson layout modes", () => {
	it("keeps split-shell lessons switchable between split and focus", () => {
		const lesson = getLessonById("3.1");
		expect(lesson).toBeTruthy();

		expect(getAvailableLayoutModesForLesson(lesson!)).toEqual([
			"split",
			"focus",
		]);
		expect(getDefaultLayoutModeForLesson(lesson!)).toBe("split");
		expect(lessonSupportsLayoutToggle(lesson!)).toBe(true);
		expect(normalizeLayoutModeForLesson(lesson!, "focus")).toBe("focus");
	});

	it("locks lesson 2.3 to focus mode and coerces stale split state", () => {
		const lesson = getLessonById("2.3");
		expect(lesson).toBeTruthy();

		expect(getAvailableLayoutModesForLesson(lesson!)).toEqual(["focus"]);
		expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
		expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
		expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
		expect(normalizeLayoutModeForLesson(lesson!, "focus")).toBe("focus");
		expect(normalizeLayoutModeForLesson(lesson!, "weird")).toBe("focus");
	});

	it("locks lesson 1.5 to focus mode so the core-flow stage owns the screen", () => {
		const lesson = getLessonById("1.5");
		expect(lesson).toBeTruthy();

		expect(getAvailableLayoutModesForLesson(lesson!)).toEqual(["focus"]);
		expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
		expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
		expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
		expect(normalizeLayoutModeForLesson(lesson!, "focus")).toBe("focus");
	});

	it("treats watch lessons as focus-only layouts with no toggle", () => {
		for (const lessonId of ["2.4", "2.5", "3.4", "3.5"]) {
			const lesson = getLessonById(lessonId);
			expect(lesson).toBeTruthy();

			expect(getAvailableLayoutModesForLesson(lesson!)).toEqual(["focus"]);
			expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
			expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
			expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
		}
	});

	it("locks lesson 3.6 to focus mode and coerces stale split state", () => {
		const lesson = getLessonById("3.6");
		expect(lesson).toBeTruthy();

		expect(getAvailableLayoutModesForLesson(lesson!)).toEqual(["focus"]);
		expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
		expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
		expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
		expect(normalizeLayoutModeForLesson(lesson!, "focus")).toBe("focus");
	});
});
