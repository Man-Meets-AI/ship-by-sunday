import {
	getCompletionIssues,
	getLessonById,
	getObjectiveTasks,
	getStudentFacingLessons,
	getUnlockedBlockIds,
	getUnlockedLessonIds,
	lessonRegistry,
} from "@/features/course/lesson/model";

const studentFacingIds = [
	"0.1",
	"0.2",
	"1.0",
	"1.1",
	"1.2",
	"1.3",
	"1.4",
	"1.5",
	"1.6",
	"1.7",
	"2.0",
	"2.1",
	"2.2",
	"3.0",
	"3.1",
	"3.2",
	"3.3",
	"3.4",
	"3.5",
	"3.6",
	"3.7",
	"3.8",
	"3.9",
	"3.10",
	"3.11",
	"3.12",
	"3.13",
	"3.14",
	"3.15",
	"3.16",
	"4.0",
];

describe("course registry", () => {
	it("keeps mission and welcome available before progress exists", () => {
		expect(getUnlockedLessonIds([])).toEqual(["0.0", "0.1"]);
	});

	it("unlocks the Bunny-driven sequence at the handoff lessons", () => {
		expect(getUnlockedLessonIds(["0.1"])).toContain("0.2");
		expect(getUnlockedLessonIds(["0.1", "0.2"])).toContain("1.0");
		expect(getUnlockedLessonIds(["0.1", "0.2", "1.7"])).toContain("2.0");
		expect(getUnlockedLessonIds(["0.1", "0.2", "1.7", "2.2"])).toContain("3.0");
		expect(
			getUnlockedLessonIds(["0.1", "0.2", "1.7", "2.2", "3.16"]),
		).toContain("4.0");
	});

	it("unlocks blocks at the new Bunny handoff points", () => {
		expect(getUnlockedBlockIds([])).toEqual(["CEO"]);
		expect(getUnlockedBlockIds(["1.7"])).toEqual(["CEO", "DESIGN"]);
		expect(getUnlockedBlockIds(["1.7", "2.2"])).toEqual([
			"CEO",
			"DESIGN",
			"BUILD",
		]);
		expect(getUnlockedBlockIds(["1.7", "2.2", "3.16"])).toEqual([
			"CEO",
			"DESIGN",
			"BUILD",
			"SHIP",
		]);
	});

	it("keeps the student-facing lesson sequence aligned with the Bunny-first map", () => {
		expect(getStudentFacingLessons().map((lesson) => lesson.id)).toEqual(
			studentFacingIds,
		);
		expect(lessonRegistry.length).toBe(32);
		expect(getLessonById("4.0")?.title).toBe("Product Review");
		expect(getLessonById("4.6")).toBeNull();
	});

	it("keeps Build as the 17-video sequence from 3.0 through 3.16", () => {
		const buildLessons = getStudentFacingLessons().filter(
			(lesson) => lesson.block === "BUILD",
		);

		expect(buildLessons.map((lesson) => lesson.id)).toEqual([
			"3.0",
			"3.1",
			"3.2",
			"3.3",
			"3.4",
			"3.5",
			"3.6",
			"3.7",
			"3.8",
			"3.9",
			"3.10",
			"3.11",
			"3.12",
			"3.13",
			"3.14",
			"3.15",
			"3.16",
		]);
		expect(buildLessons.at(-1)?.nextLessonId).toBe("4.0");
	});

	it("hydrates the live Bunny media onto the representative watch lessons", () => {
		for (const lessonId of ["1.0", "2.0", "3.0", "3.16", "4.0"]) {
			const lesson = getLessonById(lessonId);
			expect(lesson).toBeTruthy();
			if (!lesson) {
				throw new Error(`Expected lesson ${lessonId} to exist.`);
			}
			expect(lesson.shell).toBe("watch");
			expect(lesson.workbench).toBe("external_workspace");
			expect(lesson.workbenchFields ?? []).toEqual([]);
			expect(lesson.requireReadyVideoForCompletion).toBe(true);
			expect(lesson.content.coach.video).toMatchObject({
				status: "ready",
				provider: "bunny",
				libraryId: 619172,
			});
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
});
