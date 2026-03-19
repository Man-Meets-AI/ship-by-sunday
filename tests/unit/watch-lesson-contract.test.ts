import {
	getAvailableLayoutModesForLesson,
	getCompletionIssues,
	getDefaultLayoutModeForLesson,
	getLessonById,
	getObjectiveTasks,
	getStudentFacingLessons,
	lessonSupportsLayoutToggle,
	normalizeLayoutModeForLesson,
} from "@/features/course/lesson/model";

describe("watch lesson contract", () => {
	it("keeps the Bunny-driven lessons in a focus-only watch layout", () => {
		const watchLessons = getStudentFacingLessons().filter(
			(lesson) => lesson.shell === "watch",
		);

		expect(watchLessons.length).toBeGreaterThan(20);

		for (const lesson of watchLessons) {
			expect(lesson.shell).toBe("watch");
			expect(getAvailableLayoutModesForLesson(lesson)).toEqual(["focus"]);
			expect(getDefaultLayoutModeForLesson(lesson)).toBe("focus");
			expect(lessonSupportsLayoutToggle(lesson)).toBe(false);
			expect(normalizeLayoutModeForLesson(lesson, "split")).toBe("focus");
		}
	});

	it("treats watch lessons as video-complete steps with no required in-product fields", () => {
		for (const lessonId of ["2.1", "3.0", "3.8", "4.0"]) {
			const lesson = getLessonById(lessonId);
			expect(lesson).toBeTruthy();
			if (!lesson) {
				throw new Error(`Expected lesson ${lessonId} to exist.`);
			}

			expect(lesson.workbenchFields ?? []).toEqual([]);
			expect(getObjectiveTasks(lesson, {})).toEqual([
				expect.objectContaining({
					id: "__coach_video_ready",
					label: "Lesson video is attached and ready",
					status: "complete",
				}),
			]);
			expect(getCompletionIssues(lesson, {})).toEqual([]);
		}
	});

	it("keeps the restored opening lessons out of the watch-shell contract", () => {
		expect(getLessonById("1.1")?.shell).toBe("split");
		expect(getLessonById("1.2")?.shell).toBe("split");
		expect(getLessonById("1.3")?.shell).toBe("split");
		expect(getLessonById("1.4")?.shell).toBe("split");
		expect(getLessonById("1.5")?.shell).toBe("split");
	});
});
