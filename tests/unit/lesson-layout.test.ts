import {
	getAvailableLayoutModesForLesson,
	getDefaultLayoutModeForLesson,
	getLessonById,
	lessonSupportsLayoutToggle,
	normalizeLayoutModeForLesson,
} from "@/features/course/lesson/model";

describe("lesson layout modes", () => {
	it("keeps Start Here lessons switchable between split and focus", () => {
		for (const lessonId of ["0.1", "0.2"]) {
			const lesson = getLessonById(lessonId);
			expect(lesson).toBeTruthy();

			expect(getAvailableLayoutModesForLesson(lesson!)).toEqual([
				"split",
				"focus",
			]);
			expect(getDefaultLayoutModeForLesson(lesson!)).toBe("split");
			expect(lessonSupportsLayoutToggle(lesson!)).toBe(true);
			expect(normalizeLayoutModeForLesson(lesson!, "focus")).toBe("focus");
		}
	});

	it("locks representative Bunny lessons to focus mode", () => {
		for (const lessonId of ["1.0", "2.0", "3.0", "3.16", "4.0"]) {
			const lesson = getLessonById(lessonId);
			expect(lesson).toBeTruthy();

			expect(getAvailableLayoutModesForLesson(lesson!)).toEqual(["focus"]);
			expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
			expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
			expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
			expect(normalizeLayoutModeForLesson(lesson!, "weird")).toBe("focus");
		}
	});
});
