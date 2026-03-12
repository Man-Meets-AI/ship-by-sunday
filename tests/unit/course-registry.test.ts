import {
	buildArtifactPreview,
	FIELD_SHAPE_VERSION_FIELD_ID,
	getCandidateProblemOptions,
	getCompletionIssues,
	getLessonById,
	getLessonHref,
	getObjectiveTasks,
	prepareFieldValuesForPersistence,
	getWorkbenchSectionStates,
	getUnlockedBlockIds,
	normalizeLessonFieldValues,
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

	it("keeps CEO available by default and unlocks later blocks explicitly", () => {
		expect(getUnlockedBlockIds([])).toEqual(["CEO"]);
		expect(getUnlockedBlockIds(["1.7"])).toEqual(["CEO", "DESIGN"]);
		expect(getUnlockedBlockIds(["1.7", "2.7"])).toEqual([
			"CEO",
			"DESIGN",
			"BUILD",
		]);
	});

	it("routes mission through the mission screen and lessons through lesson pages", () => {
		expect(getLessonHref("0.0")).toBe("/mission");
		expect(getLessonHref("1.1")).toBe("/lesson/1.1");
	});

	it("keeps mission out of the student-facing lesson sequence", () => {
		expect(
			getStudentFacingLessons().some((lesson) => lesson.id === "0.0"),
		).toBe(false);
		expect(getStudentFacingLessons()[0]?.id).toBe("0.1");
	});

	it("keeps the lesson registry available through the shared course domain", () => {
		expect(lessonRegistry.length).toBeGreaterThan(20);
		expect(getLessonById("4.6")?.title).toBe("Final Wrap");
	});

	it("declares columns for every table workbench field", () => {
		const tableFields = lessonRegistry.flatMap((lesson) =>
			(lesson.workbenchFields ?? []).filter((field) => field.kind === "table"),
		);

		expect(tableFields.length).toBeGreaterThan(0);
		expect(tableFields.every((field) => (field.columns?.length ?? 0) > 0)).toBe(
			true,
		);
	});

	it("reports missing required field labels for incomplete lessons", () => {
		const lesson = getLessonById("0.1");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {});

		expect(issues.map((issue) => issue.label)).toContain("Weekend ship goal");
	});

	it("treats blank table rows as incomplete work", () => {
		const lesson = getLessonById("1.4");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			research_table: [["", "", "", ""]],
		});

		expect(issues.map((issue) => issue.label)).toContain("Research Table");
	});

	it("keeps manual task fallback for lessons without observable workbench fields", () => {
		const lesson = getLessonById("0.2");
		expect(lesson).toBeTruthy();

		const tasks = getObjectiveTasks(lesson!, {
			[OBJECTIVE_CHECKLIST_FIELD_ID]: [
				{ label: "Download Figma, VSCode", checked: true },
				{ label: "Review the 4 Blocks", checked: false },
			],
		});

		expect(tasks.map((task) => task.status)).toEqual([
			"complete",
			"incomplete",
		]);
		expect(tasks.every((task) => task.interactive)).toBe(true);
	});

	it("keeps lesson 1.1 prompts aligned with naming who has the problem", () => {
		const lesson = getLessonById("1.1");
		expect(lesson).toBeTruthy();

		const requiredFields = lesson!.workbenchFields?.filter(
			(field) => field.required,
		);
		expect(requiredFields?.map((field) => field.label)).toEqual([
			"Who has this problem?",
			"What painful problem keeps happening?",
			"Who has this problem?",
			"What painful problem keeps happening?",
			"Who has this problem?",
			"What painful problem keeps happening?",
		]);
	});

	it("tracks section progress for the redesigned 1.1 workbench", () => {
		const lesson = getLessonById("1.1");
		expect(lesson).toBeTruthy();

		const sectionStates = getWorkbenchSectionStates(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			problem_1_who: "Startup operators",
			problem_1_pain:
				"They lose action items after meetings and waste time rebuilding them.",
			problem_2_who: "Freelancers",
		});

		expect(sectionStates.map((section) => section.isComplete)).toEqual([
			true,
			false,
			false,
		]);
		expect(sectionStates[1]?.completionLabel).toBe(
			"Candidate problem 2 written",
		);
	});

	it("derives specific generated task labels for lesson 1.1", () => {
		const lesson = getLessonById("1.1");
		expect(lesson).toBeTruthy();

		const tasks = getObjectiveTasks(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			problem_1_who: "Startup operators",
			problem_1_pain:
				"They lose action items after meetings and waste time rebuilding them.",
		});

		expect(tasks.map((task) => task.label)).toEqual([
			"Problem owner 1",
			"Problem statement 1",
			"Problem owner 2",
			"Problem statement 2",
			"Problem owner 3",
			"Problem statement 3",
		]);
		expect(tasks.map((task) => task.status)).toEqual([
			"complete",
			"complete",
			"incomplete",
			"incomplete",
			"incomplete",
			"incomplete",
		]);
	});

	it("derives option-level generated tasks for console checklist lessons", () => {
		const lesson = getLessonById("3.2");
		expect(lesson).toBeTruthy();

		const tasks = getObjectiveTasks(lesson!, {
			environment_ready: [
				{ label: "Open the starter or repo", checked: true },
				{ label: "Install dependencies", checked: true },
				{ label: "Run the app locally", checked: false },
				{ label: "Capture confirmation", checked: false },
			],
		});

		expect(tasks.map((task) => task.label)).toEqual([
			"Open the starter or repo",
			"Install dependencies",
			"Run the app locally",
			"Capture confirmation",
		]);
		expect(tasks.map((task) => task.status)).toEqual([
			"complete",
			"complete",
			"incomplete",
			"incomplete",
		]);
	});

	it("makes candidate selection the first required task on lesson 1.2", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();

		const tasks = getObjectiveTasks(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
		});

		expect(tasks[0]?.label).toBe("Pick problem to carry forward");
		expect(tasks[0]?.sectionTitle).toBe("Chosen problem");
		expect(tasks[0]?.status).toBe("incomplete");
	});

	it("requires a chosen candidate problem before 1.2 can complete", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 3,
			pain_moment: "Right after meetings when the notes are still messy.",
			current_solution: "They clean up notes by hand.",
			reachability: "I know a few people like this already.",
		});

		expect(issues.map((issue) => issue.label)).toContain(
			"Pick problem to carry forward",
		);
	});

	it("drops stale field values when a lesson field shape version changes", () => {
		const lesson = getLessonById("1.1");
		expect(lesson).toBeTruthy();

		expect(
			normalizeLessonFieldValues(lesson!, {
				problem_1:
					"Startup operators lose action items after meetings and waste time rebuilding them.",
			}),
		).toEqual({});

		expect(
			normalizeLessonFieldValues(lesson!, {
				[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
				problem_1_who: "Startup operators",
			}),
		).toEqual({
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			problem_1_who: "Startup operators",
		});
	});

	it("drops stale 1.2 drafts that predate the candidate-selection handoff", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();

		expect(
			normalizeLessonFieldValues(lesson!, {
				user_type: "Early-stage startup operators",
				pain_moment: "Right after meetings.",
			}),
		).toEqual({});
	});

	it("drops stale 1.2 drafts from the old duplicate user field shape", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();

		expect(
			normalizeLessonFieldValues(lesson!, {
				[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
				selected_problem_index: 1,
				selected_problem_owner: "Startup operators",
				selected_problem_statement:
					"They lose action items after meetings and waste time rebuilding them.",
				user_type: "Early-stage startup operators who run team meetings",
				pain_moment: "Right after meetings.",
			}),
		).toEqual({});
	});

	it("derives candidate options from the lesson handoff config instead of field-id parsing", () => {
		const lesson = getLessonById("1.2");
		expect(lesson?.handoff).toBeTruthy();

		const options = getCandidateProblemOptions(lesson!.handoff, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			problem_1_who: "Startup operators",
			problem_1_pain: "They lose action items after meetings.",
			problem_2_who: "Agency owners",
			problem_2_pain: "They lose client next steps after calls.",
			problem_3_who: "Freelancers",
			problem_3_pain: "They forget follow-ups after discovery calls.",
			problem_4_who: "Should be ignored",
			problem_4_pain: "This is not in the handoff config.",
		});

		expect(options).toEqual([
			{
				index: 1,
				owner: "Startup operators",
				statement: "They lose action items after meetings.",
			},
			{
				index: 2,
				owner: "Agency owners",
				statement: "They lose client next steps after calls.",
			},
			{
				index: 3,
				owner: "Freelancers",
				statement: "They forget follow-ups after discovery calls.",
			},
		]);
	});

	it("accepts the configured handoff persisted fields as a compatible 1.2 field shape", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();

		expect(
			normalizeLessonFieldValues(lesson!, {
				[FIELD_SHAPE_VERSION_FIELD_ID]: 3,
				selected_problem_index: 1,
				selected_problem_owner: "Startup operators",
				selected_problem_statement:
					"They lose action items after meetings and waste time rebuilding them.",
				pain_moment: "Right after meetings when the notes are still messy.",
				current_solution: "They clean up notes by hand.",
				reachability: "I know a few people like this already.",
			}),
		).toEqual({
			[FIELD_SHAPE_VERSION_FIELD_ID]: 3,
			selected_problem_index: 1,
			selected_problem_owner: "Startup operators",
			selected_problem_statement:
				"They lose action items after meetings and waste time rebuilding them.",
			pain_moment: "Right after meetings when the notes are still messy.",
			current_solution: "They clean up notes by hand.",
			reachability: "I know a few people like this already.",
		});
	});

	it("uses learner-facing preview labels for structured artifact output", () => {
		const lesson = getLessonById("1.1");
		expect(lesson).toBeTruthy();

		const preview = buildArtifactPreview(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			problem_1_who: "Startup operators",
			problem_1_pain:
				"They lose action items after meetings and waste time rebuilding them.",
		});

		expect(preview.fields).toEqual([
			["Problem 1: who", "Startup operators"],
			[
				"Problem 1: pain",
				"They lose action items after meetings and waste time rebuilding them.",
			],
		]);
	});

	it("carries the chosen problem into the 1.2 artifact preview", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();

		const preview = buildArtifactPreview(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 3,
			selected_problem_index: 1,
			selected_problem_owner: "Startup operators",
			selected_problem_statement:
				"They lose action items after meetings and waste time rebuilding them.",
			pain_moment: "Right after meetings when the notes are still messy.",
		});

		expect(preview.fields.slice(0, 3)).toEqual([
			["User", "Startup operators"],
			[
				"Chosen problem",
				"They lose action items after meetings and waste time rebuilding them.",
			],
			["Pain moment", "Right after meetings when the notes are still messy."],
		]);
		expect(preview.contextTitle).toBe("Current direction");
	});

	it("formats table artifact previews into readable summaries", () => {
		const lesson = getLessonById("4.4");
		expect(lesson).toBeTruthy();

		const preview = buildArtifactPreview(lesson!, {
			send_table: [
				["Ava", "Email", "Yes", "Asked for a demo"],
				["Leo", "DM", "No", "No reply yet"],
			],
		});

		expect(preview.fields).toEqual([
			[
				"Send Tracker",
				"2 rows: Person: Ava | Channel: Email | Sent?: Yes | Reply: Asked for a demo; Person: Leo | Channel: DM | Sent?: No | Reply: No reply yet",
			],
		]);
	});

	it("drops blank table rows before lesson state persistence", () => {
		const lesson = getLessonById("1.4");
		expect(lesson).toBeTruthy();

		expect(
			prepareFieldValuesForPersistence(lesson!, {
				research_table: [
					["", "", "", ""],
					["Notion", "Fast setup", "Weak export", "Speed"],
				],
			}),
		).toEqual({
			[FIELD_SHAPE_VERSION_FIELD_ID]: 1,
			research_table: [["Notion", "Fast setup", "Weak export", "Speed"]],
		});
	});
});
