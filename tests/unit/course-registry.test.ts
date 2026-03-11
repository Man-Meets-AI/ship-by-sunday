import {
	getCompletionIssues,
	getLessonById,
	getLessonHref,
	OBJECTIVE_CHECKLIST_FIELD_ID,
	getStudentFacingLessons,
	getUnlockedLessonIds,
	lessonRegistry,
} from "@/lib/course";

describe("course registry", () => {
	it("keeps mission and welcome available before progress exists", () => {
		expect(getUnlockedLessonIds([])).toEqual(["0.0", "0.1"]);
	});

	it("unlocks the sprint intro after welcome is completed", () => {
		expect(getUnlockedLessonIds(["0.1"])).toContain("0.2");
	});

	it("routes mission through the mission screen and lessons through lesson pages", () => {
		expect(getLessonHref("0.0")).toBe("/mission");
		expect(getLessonHref("1.1")).toBe("/lesson/1.1");
	});

	it("keeps mission out of the student-facing lesson sequence", () => {
		expect(getStudentFacingLessons().some((lesson) => lesson.id === "0.0")).toBe(
			false,
		);
		expect(getStudentFacingLessons()[0]?.id).toBe("0.1");
	});

	it("keeps the lesson registry available through the shared course domain", () => {
		expect(lessonRegistry.length).toBeGreaterThan(20);
		expect(getLessonById("4.6")?.title).toBe("Final Wrap");
	});

	it("reports missing required field labels for incomplete lessons", () => {
		const lesson = getLessonById("0.1");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {});

		expect(issues.map((issue) => issue.label)).toContain(
			"What are you here to ship this weekend?",
		);
	});

	it("reports unchecked objective items as completion blockers", () => {
		const lesson = getLessonById("0.1");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			weekend_goal: "Ship a tiny scheduling tool",
			[OBJECTIVE_CHECKLIST_FIELD_ID]: [
				{ label: "See the 4-block path", checked: true },
				{
					label: "Define the thing you are here to ship",
					checked: false,
				},
				{
					label: "Commit to doing reps instead of just watching",
					checked: false,
				},
			],
		});

		expect(issues.filter((issue) => issue.kind === "objective")).toHaveLength(2);
	});
});
