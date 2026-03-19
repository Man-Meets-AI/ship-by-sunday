import {
	getAvailableLayoutModesForLesson,
	getDefaultLayoutModeForLesson,
	getLessonById,
	lessonSupportsLayoutToggle,
	normalizeLayoutModeForLesson,
} from "@/features/course/lesson/model";

describe("lesson layout modes", () => {
	it("keeps Welcome locked to focus mode", () => {
		const lesson = getLessonById("1.1");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.1 to exist.");
		}

		expect(getAvailableLayoutModesForLesson(lesson)).toEqual(["focus"]);
		expect(getDefaultLayoutModeForLesson(lesson)).toBe("focus");
		expect(lessonSupportsLayoutToggle(lesson)).toBe(false);
		expect(normalizeLayoutModeForLesson(lesson, "split")).toBe("focus");
	});

	it("keeps Sprint locked to focus mode", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.2 to exist.");
		}

		expect(getAvailableLayoutModesForLesson(lesson)).toEqual(["focus"]);
		expect(getDefaultLayoutModeForLesson(lesson)).toBe("focus");
		expect(lessonSupportsLayoutToggle(lesson)).toBe(false);
		expect(normalizeLayoutModeForLesson(lesson, "focus")).toBe("focus");
	});

	it("locks representative Bunny lessons to focus mode", () => {
		for (const lessonId of ["1.6", "2.0", "3.0", "3.16", "4.0"]) {
			const lesson = getLessonById(lessonId);
			expect(lesson).toBeTruthy();
			if (!lesson) {
				throw new Error(`Expected lesson ${lessonId} to exist.`);
			}

			expect(getAvailableLayoutModesForLesson(lesson)).toEqual(["focus"]);
			expect(getDefaultLayoutModeForLesson(lesson)).toBe("focus");
			expect(lessonSupportsLayoutToggle(lesson)).toBe(false);
			expect(normalizeLayoutModeForLesson(lesson, "split")).toBe("focus");
			expect(normalizeLayoutModeForLesson(lesson, "weird")).toBe("focus");
		}
	});
});
