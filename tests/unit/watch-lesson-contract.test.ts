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
	it("keeps lesson 2.4 in a focus-only watch layout", () => {
		const lesson = getLessonById("2.4");
		expect(lesson).toBeTruthy();

		expect(lesson?.shell).toBe("watch");
		expect(getAvailableLayoutModesForLesson(lesson!)).toEqual(["focus"]);
		expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
		expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
		expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
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
});
