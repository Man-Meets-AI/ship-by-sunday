import {
	getCompletionIssues,
	getDefaultLayoutModeForLesson,
	getLessonById,
	getObjectiveTasks,
	getAvailableLayoutModesForLesson,
	lessonSupportsLayoutToggle,
	normalizeLayoutModeForLesson,
} from "@/lib/course";

describe("watch lesson contract", () => {
	it("keeps lessons 2.4 and 2.5 in a focus-only watch layout", () => {
		for (const lessonId of ["2.4", "2.5"]) {
			const lesson = getLessonById(lessonId);
			expect(lesson).toBeTruthy();

			expect(lesson?.shell).toBe("watch");
			expect(getAvailableLayoutModesForLesson(lesson!)).toEqual(["focus"]);
			expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
			expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
			expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
		}
	});

	it("treats lesson 2.4 as a watch-only lesson with no required in-product fields", () => {
		const lesson = getLessonById("2.4");
		const nextLesson = getLessonById("2.5");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(getObjectiveTasks(lesson!, {})).toEqual([]);
		expect(getCompletionIssues(lesson!, {})).toEqual([]);
		expect(nextLesson?.artifact.dependsOn).toContain("figma_file_ready");
	});

	it("treats lesson 2.5 as a watch-only lesson with no required in-product fields", () => {
		const lesson = getLessonById("2.5");
		const nextLesson = getLessonById("2.6");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(getObjectiveTasks(lesson!, {})).toEqual([]);
		expect(getCompletionIssues(lesson!, {})).toEqual([]);
		expect(nextLesson?.artifact.dependsOn).toContain("rough_screens");
	});
});
