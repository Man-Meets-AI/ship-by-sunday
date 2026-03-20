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
	"1.1",
	"1.2",
	"1.3",
	"1.4",
	"1.5",
	"1.6",
	"1.7",
	"1.8",
	"1.9",
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
		expect(getUnlockedLessonIds([])).toEqual(["1.0", "1.1"]);
	});

	it("unlocks the Bunny-driven sequence at the handoff lessons", () => {
		expect(getUnlockedLessonIds(["1.1"])).toContain("1.2");
		expect(getUnlockedLessonIds(["1.1", "1.2"])).toContain("1.3");
		expect(getUnlockedLessonIds(["1.1", "1.2", "1.9"])).toContain("2.0");
		expect(getUnlockedLessonIds(["1.1", "1.2", "1.9", "2.2"])).toContain("3.0");
		expect(
			getUnlockedLessonIds(["1.1", "1.2", "1.9", "2.2", "3.16"]),
		).toContain("4.0");
	});

	it("unlocks blocks at the new Bunny handoff points", () => {
		expect(getUnlockedBlockIds([])).toEqual(["CEO"]);
		expect(getUnlockedBlockIds(["1.9"])).toEqual(["CEO", "DESIGN"]);
		expect(getUnlockedBlockIds(["1.9", "2.2"])).toEqual([
			"CEO",
			"DESIGN",
			"BUILD",
		]);
		expect(getUnlockedBlockIds(["1.9", "2.2", "3.16"])).toEqual([
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
		expect(lessonRegistry.length).toBe(31);
		expect(getLessonById("4.0")?.title).toBe("Product Review");
		expect(getLessonById("1.0")?.title).toBe("Mission Map");
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

	it("hydrates the live Bunny media onto welcome and representative watch lessons", () => {
		const welcomeLesson = getLessonById("1.1");
		expect(welcomeLesson).toBeTruthy();
		if (!welcomeLesson) {
			throw new Error("Expected lesson 1.1 to exist.");
		}
		expect(welcomeLesson.shell).toBe("split");
		expect(welcomeLesson.coachVideoPlacement).toBe("workbench");
		expect(welcomeLesson.content.coach.video).toMatchObject({
			status: "ready",
			provider: "bunny",
			libraryId: 619172,
			title: "Welcome",
		});

		const startWithProblem = getLessonById("1.3");
		expect(startWithProblem).toBeTruthy();
		if (!startWithProblem) {
			throw new Error("Expected lesson 1.3 to exist.");
		}
		expect(startWithProblem.shell).toBe("split");
		expect(startWithProblem.content.coach.video).toMatchObject({
			status: "ready",
			provider: "bunny",
			libraryId: 619172,
			videoId: "b0173058-5cf9-4a93-b865-8bb6e48fd5f7",
			title: "Start With the Problem",
		});

		const pickOneUser = getLessonById("1.4");
		expect(pickOneUser).toBeTruthy();
		if (!pickOneUser) {
			throw new Error("Expected lesson 1.4 to exist.");
		}
		expect(pickOneUser.shell).toBe("split");
		expect(pickOneUser.content.coach.video).toMatchObject({
			status: "ready",
			provider: "bunny",
			libraryId: 619172,
			videoId: "59276fe3-0832-455b-8223-2a2974028be8",
			title: "Pick One User",
		});

		const defineOutcome = getLessonById("1.5");
		expect(defineOutcome).toBeTruthy();
		if (!defineOutcome) {
			throw new Error("Expected lesson 1.5 to exist.");
		}
		expect(defineOutcome.shell).toBe("split");
		expect(defineOutcome.workbench).toBe("guided_form");
		expect(defineOutcome.artifact.key).toBe("outcome_statement");
		expect((defineOutcome.workbenchFields ?? []).map((f) => f.id)).toEqual([
			"outcome",
			"success_looks_like",
			"difference_for_user",
		]);
		expect(defineOutcome.requireReadyVideoForCompletion).toBe(true);
		expect(defineOutcome.content.coach.video).toMatchObject({
			status: "ready",
			provider: "bunny",
			libraryId: 619172,
			videoId: "59276fe3-0832-455b-8223-2a2974028be8",
			title: "Define the Outcome",
		});
		const outcomeTasks = getObjectiveTasks(defineOutcome, {});
		expect(outcomeTasks.map((t) => t.id).sort()).toEqual(
			[
				"__coach_video_ready",
				"difference_for_user",
				"outcome",
				"success_looks_like",
			].sort(),
		);
		expect(
			getCompletionIssues(defineOutcome, {})
				.map((i) => i.id)
				.sort(),
		).toEqual(["difference_for_user", "outcome", "success_looks_like"].sort());

		expect(getLessonById("1.6")?.pinnedArtifacts).toEqual([
			"user_statement",
			"outcome_statement",
		]);

		const scopeHammer = getLessonById("1.7");
		expect(scopeHammer).toBeTruthy();
		if (!scopeHammer) {
			throw new Error("Expected lesson 1.7 to exist.");
		}
		expect(scopeHammer.pinnedArtifacts).toEqual([
			"user_statement",
			"outcome_statement",
		]);
		expect(scopeHammer.workbench).toBe("external_workspace");
		expect(scopeHammer.artifact.key).toBe("scope_boundary");
		expect(scopeHammer.artifact.type).toBe("mixed");
		expect(scopeHammer.promptImport).toMatchObject({
			promptTemplateId: "scope_boundary",
			inScopeFieldId: "in_scope",
			outOfScopeFieldId: "out_of_scope",
			rationaleFieldId: "v1_rationale",
		});
		expect(
			(scopeHammer.workbenchFields ?? []).map((field) => field.id),
		).toEqual(["in_scope", "out_of_scope", "v1_rationale"]);
		expect(
			getObjectiveTasks(scopeHammer, {})
				.map((task) => task.id)
				.sort(),
		).toEqual(
			[
				"__coach_video_ready",
				"in_scope",
				"out_of_scope",
				"v1_rationale",
			].sort(),
		);
		expect(
			getCompletionIssues(scopeHammer, {})
				.map((issue) => issue.id)
				.sort(),
		).toEqual(["in_scope", "out_of_scope", "v1_rationale"].sort());
		expect(
			getCompletionIssues(scopeHammer, {
				in_scope: ["Login"],
				out_of_scope: ["Billing"],
				v1_rationale: "Smallest path to first value.",
			}),
		).toEqual([]);
		expect(
			getCompletionIssues(scopeHammer, {
				in_scope: ["   "],
				out_of_scope: ["Billing"],
				v1_rationale: "Ok",
			})
				.map((issue) => issue.id)
				.sort(),
		).toEqual(["in_scope"]);

		for (const lessonId of ["2.0", "3.0", "3.16", "4.0"]) {
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
