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
	it("keeps watch lessons in a focus-only watch layout", () => {
		for (const lessonId of ["2.4", "2.5", "3.5", "3.8", "3.9"]) {
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

	it("treats lesson 3.2 as a focus-only repo orientation step with required evidence", () => {
		const lesson = getLessonById("3.2");
		const nextLesson = getLessonById("3.3");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson?.shell).toBe("focus");
		expect(getAvailableLayoutModesForLesson(lesson!)).toEqual(["focus"]);
		expect(getDefaultLayoutModeForLesson(lesson!)).toBe("focus");
		expect(lessonSupportsLayoutToggle(lesson!)).toBe(false);
		expect(normalizeLayoutModeForLesson(lesson!, "split")).toBe("focus");
		expect((lesson?.workbenchFields ?? []).map((field) => field.id)).toEqual([
			"repo_orientation_checklist",
			"startup_command",
			"repo_map_notes",
		]);
		expect(getObjectiveTasks(lesson!, {}).length).toBeGreaterThan(0);
		const emptyIssues = getCompletionIssues(lesson!, {});
		expect(emptyIssues.length).toBeGreaterThan(0);
		expect(
			emptyIssues.some(
				(issue) => issue.label === "Lesson video is attached and ready",
			),
		).toBe(true);
		expect(nextLesson?.artifact.dependsOn).toContain("repo_orientation_ready");
	});

	it("treats lesson 3.5 as a watch-only lesson with no required in-product fields", () => {
		const lesson = getLessonById("3.5");
		const nextLesson = getLessonById("3.6");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(getObjectiveTasks(lesson!, {})).toEqual([]);
		expect(getCompletionIssues(lesson!, {})).toEqual([]);
		expect(nextLesson?.artifact.dependsOn).toContain(
			"working_local_environment",
		);
	});

	it("treats lesson 3.8 as a watch-only lesson with no required in-product fields", () => {
		const lesson = getLessonById("3.8");
		const nextLesson = getLessonById("3.9");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(getObjectiveTasks(lesson!, {})).toEqual([]);
		expect(getCompletionIssues(lesson!, {})).toEqual([]);
		expect(nextLesson?.artifact.dependsOn).toContain(
			"core_flow_working_locally",
		);
	});

	it("treats lesson 3.9 as a watch-only lesson with no required in-product fields", () => {
		const lesson = getLessonById("3.9");
		const nextLesson = getLessonById("3.10");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(getObjectiveTasks(lesson!, {})).toEqual([]);
		expect(getCompletionIssues(lesson!, {})).toEqual([]);
		expect(nextLesson?.artifact.dependsOn).toContain("blocker_log");
	});
});
