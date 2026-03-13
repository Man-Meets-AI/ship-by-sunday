import {
	buildArtifactPreview,
	buildResolvedArtifactPreview,
	createReferenceGalleryValue,
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

function getUserStatementArtifact() {
	const lesson = getLessonById("1.2");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		[FIELD_SHAPE_VERSION_FIELD_ID]: 3,
		selected_problem_index: 1,
		selected_problem_owner: "Startup operators",
		selected_problem_statement:
			"They lose action items after meetings and waste time rebuilding them.",
		pain_moment:
			"Right after team meetings when they need to share next steps fast.",
		current_solution:
			"Messy notes, memory, and a manual cleanup pass after the meeting.",
		reachability:
			"I already know a few operators who would try this this week.",
	});
}

function getOutcomeStatementArtifact() {
	const lesson = getLessonById("1.3");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		outcome:
			"Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
		success_looks_like:
			"They can paste notes, review a usable action summary, and share it without rebuilding everything by hand.",
		difference_for_user:
			"They stop losing decisions in messy notes and can close the loop while the meeting is still fresh.",
	});
}

function getResearchNotesArtifact() {
	const lesson = getLessonById("1.4");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		research_table: [
			["Notion", "Fast setup", "Weak export", "Speed"],
			["Coda", "Flexible docs", "Too much setup", "Customization"],
			["Tana", "Strong structure", "Steep learning curve", "Clean workflows"],
		],
		research_summary:
			"People care most about speed and clarity after the meeting, not giant knowledge-management features.",
	});
}

function getCoreFlowArtifact() {
	const lesson = getLessonById("1.5");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		[FIELD_SHAPE_VERSION_FIELD_ID]: 5,
		__core_flow_image_upload: {
			kind: "upload",
			status: "stored",
			storageId: "core-flow-image",
			url: "https://example.com/core-flow.png",
		},
	});
}

function getScopeBoundaryArtifact() {
	const lesson = getLessonById("1.6");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		in_scope: ["Paste notes", "Generate summary", "Share next steps"],
		out_of_scope: [
			"Team collaboration",
			"Project dashboards",
			"CRM sync",
			"Analytics",
		],
		v1_rationale:
			"If the operator can move from messy notes to a clean action summary fast, the first version did its job.",
	});
}

function getReferenceBoardArtifact() {
	const lesson = getLessonById("2.1");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
		reference_gallery: createReferenceGalleryValue([
			{
				id: "upload-1",
				source: "upload",
				storageId: "storage-1",
				url: "https://cdn.example.com/ref-1.png",
			},
			{
				id: "remote-1",
				source: "remote_url",
				url: "https://images.example.com/ref-2.png",
			},
			{
				id: "remote-2",
				source: "remote_url",
				url: "https://images.example.com/ref-3.png",
			},
			{
				id: "remote-3",
				source: "remote_url",
				url: "https://images.example.com/ref-4.png",
			},
		]),
	});
}

function getLegacyReferenceBoardArtifact() {
	const lesson = getLessonById("2.1");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		reference_board: [
			"https://images.example.com/ref-1.png",
			"Editorial onboarding flow",
			"https://images.example.com/ref-2.png",
		],
		reference_patterns: "Tight cards and dense hierarchy.",
	});
}

function getSketchSetArtifact() {
	const lesson = getLessonById("2.2");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		sketch_upload: [
			{
				kind: "upload",
				status: "stored",
				storageId: "sketch-1",
				fileName: "screen-1.jpg",
				url: "https://example.com/sketch-1.jpg",
			},
			{
				kind: "upload",
				status: "stored",
				storageId: "sketch-2",
				fileName: "screen-2.jpg",
				url: "https://example.com/sketch-2.jpg",
			},
		],
	});
}

function getLegacySketchSetArtifact() {
	const lesson = getLessonById("2.2");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		sketch_upload: {
			kind: "upload",
			status: "stored",
			storageId: "legacy-sketch-1",
			fileName: "legacy-screen-1.jpg",
			url: "https://example.com/legacy-screen-1.jpg",
		},
	});
}

function getStoryboardImageArtifact() {
	const lesson = getLessonById("2.3");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		storyboard_upload: {
			kind: "upload",
			status: "stored",
			storageId: "storyboard-1",
			fileName: "storyboard.png",
			url: "https://example.com/storyboard.png",
		},
	});
}

function getRoughScreensArtifact() {
	const lesson = getLessonById("2.5");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {});
}

function getVisualDirectionArtifact() {
	const lesson = getLessonById("2.6");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
		visual_direction_notes:
			"Quiet, editorial, and sharp with tighter spacing and stronger contrast.",
		visual_guide_markdown: `# Visual Guide
## Overall Direction
Keep the interface sharp and editorial.`,
	});
}

function getLegacyVisualDirectionArtifact() {
	const lesson = getLessonById("2.6");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		style_rule_1: "Quiet typography",
		style_rule_2: "Dense spacing",
		style_rule_3: "Sharp cards",
		avoid_rule: "Soft gradients",
	});
}

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

	it("configures lesson 2.4 as a watch-only lesson with no required in-product fields", () => {
		const lesson = getLessonById("2.4");
		const nextLesson = getLessonById("2.5");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson?.shell).toBe("watch");
		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(getObjectiveTasks(lesson!, {})).toEqual([]);
		expect(getCompletionIssues(lesson!, {})).toEqual([]);
		expect(nextLesson?.artifact.dependsOn).toContain("figma_file_ready");
	});

	it("configures lesson 2.5 as a watch-only lesson while keeping 2.6 gated on rough screens", () => {
		const lesson = getLessonById("2.5");
		const nextLesson = getLessonById("2.6");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson?.shell).toBe("watch");
		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(getObjectiveTasks(lesson!, {})).toEqual([]);
		expect(getCompletionIssues(lesson!, {})).toEqual([]);
		expect(nextLesson?.artifact.dependsOn).toContain("rough_screens");
	});

	it("configures lesson 3.2 as a focus-only orientation lesson with required evidence while keeping 3.3 gated on repo orientation", () => {
		const lesson = getLessonById("3.2");
		const nextLesson = getLessonById("3.3");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson).toMatchObject({
			shell: "focus",
			availableLayoutModes: ["focus"],
			workbench: "external_workspace",
			coachVideoPlacement: "workbench",
			fieldShapeVersion: 3,
		});
		expect((lesson?.workbenchFields ?? []).map((field) => field.id)).toEqual([
			"repo_orientation_checklist",
			"startup_command",
			"repo_map_notes",
		]);
		expect(getObjectiveTasks(lesson!, {}).length).toBeGreaterThan(0);
		expect(getCompletionIssues(lesson!, {}).length).toBeGreaterThan(0);
		expect(nextLesson?.artifact.dependsOn).toContain("repo_orientation_ready");
	});

	it("keeps Build lesson navigation chained from 3.1 through 3.10", () => {
		for (const [currentId, nextId] of [
			["3.1", "3.2"],
			["3.2", "3.3"],
			["3.3", "3.4"],
			["3.4", "3.5"],
			["3.5", "3.6"],
			["3.6", "3.7"],
			["3.7", "3.8"],
			["3.8", "3.9"],
			["3.9", "3.10"],
			["3.10", "4.1"],
		] as const) {
			expect(getLessonById(currentId)?.nextLessonId).toBe(nextId);
			expect(getLessonById(nextId)?.prevLessonId).toBe(currentId);
		}
	});

	it("keeps Build block lesson count at 10 in sequence order", () => {
		const buildLessonIds = lessonRegistry
			.filter((lesson) => lesson.block === "BUILD")
			.map((lesson) => lesson.id);

		expect(buildLessonIds).toEqual([
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
		]);
	});

	it("configures lesson 3.10 as a focus-only Ship-unlock wrap-up with a composed build summary", () => {
		const lesson = getLessonById("3.10");
		const nextLesson = getLessonById("4.1");
		expect(lesson).toBeTruthy();
		expect(nextLesson).toBeTruthy();

		expect(lesson).toMatchObject({
			shell: "focus",
			availableLayoutModes: ["focus"],
			workbench: "brief_assembler",
			fieldShapeVersion: 3,
		});
		expect(lesson?.workbenchFields ?? []).toEqual([]);
		expect(lesson?.briefAssembler).toMatchObject({
			variant: "stage_unlock",
			preset: "build",
			leadVideo: true,
			heroEyebrow: "Build block complete",
			heroTitle: "Ship unlocked",
			nextStepLabel: "SHIP 4.1 — Ship the Core, Not the Fantasy",
			completionCtaLabel: "Unlock Ship",
		});
		expect(nextLesson?.artifact.dependsOn).toContain("build_summary");
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

	it("requires 1.5 to upload a core flow photo before completion", () => {
		const lesson = getLessonById("1.5");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 5,
		});

		expect(issues.map((issue) => issue.label)).toContain(
			"Upload core flow photo",
		);
	});

	it("still requires the uploaded photo when legacy 1.5 structured fields exist without one", () => {
		const lesson = getLessonById("1.5");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 4,
			flow_actors: ["Startup operators"],
			flow_steps: [
				["Startup operators", "Paste notes"],
				["Startup operators", "Generate summary"],
				["Startup operators", ""],
			],
			flow_ending: "They leave with a clean action summary in minutes.",
		});

		expect(issues.map((issue) => issue.label)).toContain(
			"Upload core flow photo",
		);
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

	it("returns coaching-specific completion messages for lesson 1.1 fields", () => {
		const lesson = getLessonById("1.1");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			problem_1_who: "Startup operators",
		});

		expect(issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "problem_1_pain",
					message:
						"Candidate 1: describe the recurring pain they keep running into, not the product idea you want to build.",
				}),
				expect.objectContaining({
					id: "problem_2_who",
					message:
						"Candidate 2: name a real person or group, not a broad audience.",
				}),
			]),
		);
	});

	it("derives option-level generated tasks for console checklist lessons", () => {
		const lesson = getLessonById("4.1");
		expect(lesson).toBeTruthy();

		const tasks = getObjectiveTasks(lesson!, {
			ship_ready_checklist: [
				{ label: "Remove nonessential work", checked: true },
				{ label: "Confirm one clear path", checked: true },
				{ label: "Prepare to deploy", checked: false },
			],
		});

		expect(tasks.map((task) => task.label)).toEqual([
			"Remove nonessential work",
			"Confirm one clear path",
			"Prepare to deploy",
		]);
		expect(tasks.map((task) => task.status)).toEqual([
			"complete",
			"complete",
			"incomplete",
		]);
	});

	it("makes candidate selection the first required task on lesson 1.2", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();

		const tasks = getObjectiveTasks(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
		});

		expect(tasks[0]?.label).toBe("Commit to the user behind the problem");
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
			"Commit to the user behind the problem",
		);
		expect(
			issues.find((issue) => issue.id === "selected_problem_index")?.message,
		).toBe("Choose the one user-problem pair you can test fastest.");
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
		expect(preview.contextTitle).toBe("Our user");
	});

	it("uses a curated outcome title in the 1.3 artifact preview", () => {
		const lesson = getLessonById("1.3");
		expect(lesson).toBeTruthy();

		const preview = buildArtifactPreview(lesson!, {
			outcome:
				"Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
		});

		expect(preview.contextTitle).toBe("Outcome statement");
	});

	it("uses lesson-specific completion coaching on lesson 1.3", () => {
		const lesson = getLessonById("1.3");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			outcome:
				"AI app with dashboards and workflow features for meeting summaries.",
		});

		expect(
			issues.find((issue) => issue.id === "success_looks_like")?.message,
		).toBe("Show what the user can now do or finish when this works.");
		expect(
			issues.find((issue) => issue.id === "difference_for_user")?.message,
		).toBe("Describe what pain disappears or gets easier for them.");
	});

	it("keeps the private 1.5 saved-image field out of artifact previews", () => {
		const lesson = getLessonById("1.5");
		expect(lesson).toBeTruthy();

		const preview = buildArtifactPreview(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 5,
			__core_flow_image_upload: {
				kind: "upload",
				status: "stored",
				storageId: "core-flow-image",
			},
		});

		expect(preview.fields).toEqual([]);
	});

	it("composes a non-empty product brief from saved CEO artifacts", () => {
		const lesson = getLessonById("1.7");
		expect(lesson).toBeTruthy();

		const preview = buildResolvedArtifactPreview(lesson!, {}, [
			getUserStatementArtifact(),
			getOutcomeStatementArtifact(),
			getResearchNotesArtifact(),
			getCoreFlowArtifact(),
			getScopeBoundaryArtifact(),
		]);

		expect(preview.fields.map(([label]) => label)).toEqual([
			"Who Design Is For",
			"Outcome to Deliver",
			"Evidence to Preserve",
			"Core Flow to Keep",
			"What Not to Design Yet",
		]);
		expect(preview.fieldValues.research_signal_count).toBe(3);
		expect(preview.fieldValues.flow_step_count).toBe(1);
		expect(preview.fieldValues.scope_cut_count).toBe(4);
		expect(preview.fieldValues.flow_image_url).toBe(
			"https://example.com/core-flow.png",
		);
	});

	it("derives 1.7 progress tasks from the saved CEO block artifacts", () => {
		const lesson = getLessonById("1.7");
		expect(lesson).toBeTruthy();

		const pinnedArtifacts = [
			getUserStatementArtifact(),
			getOutcomeStatementArtifact(),
			getResearchNotesArtifact(),
			getCoreFlowArtifact(),
			getScopeBoundaryArtifact(),
		];
		const preview = buildResolvedArtifactPreview(lesson!, {}, pinnedArtifacts);
		const tasks = getObjectiveTasks(
			lesson!,
			{},
			{
				pinnedArtifacts,
				resolvedArtifactPreview: preview,
			},
		);

		expect(tasks.map((task) => task.label)).toEqual([
			"Lock the user and problem",
			"Lock the outcome",
			"Bring in real evidence",
			"Carry the core flow into Design",
			"Keep the v1 brutally small",
			"Assemble the product brief",
			"A designer could tell who this is for.",
			"The promised outcome is specific and visible.",
			"The v1 is still brutally small.",
		]);
		expect(tasks.slice(0, 6).every((task) => task.status === "complete")).toBe(
			true,
		);
		expect(tasks.slice(6).every((task) => task.status === "incomplete")).toBe(
			true,
		);
	});

	it("requires the 1.7 review checks before completion is allowed", () => {
		const lesson = getLessonById("1.7");
		expect(lesson).toBeTruthy();

		const pinnedArtifacts = [
			getUserStatementArtifact(),
			getOutcomeStatementArtifact(),
			getResearchNotesArtifact(),
			getCoreFlowArtifact(),
			getScopeBoundaryArtifact(),
		];
		const preview = buildResolvedArtifactPreview(lesson!, {}, pinnedArtifacts);

		expect(
			getCompletionIssues(lesson!, {}, {
				pinnedArtifacts,
				resolvedArtifactPreview: preview,
			}).map((issue) => issue.label),
		).toEqual([
			"A designer could tell who this is for.",
			"The promised outcome is specific and visible.",
			"The v1 is still brutally small.",
		]);

		expect(
			getCompletionIssues(
				lesson!,
				{
					brief_review_checks: [
						{
							label: "A designer could tell who this is for.",
							checked: true,
						},
						{
							label: "The promised outcome is specific and visible.",
							checked: true,
						},
						{
							label: "The v1 is still brutally small.",
							checked: true,
						},
					],
				},
				{
					pinnedArtifacts,
					resolvedArtifactPreview: preview,
				},
			),
		).toEqual([]);
	});

	it("requires at least 3 saved references to complete lesson 2.1", () => {
		const lesson = getLessonById("2.1");
		expect(lesson).toBeTruthy();

		const twoReferences = createReferenceGalleryValue([
			{
				id: "upload-1",
				source: "upload",
				storageId: "storage-1",
				fileName: "hero.png",
			},
			{
				id: "remote-1",
				source: "remote_url",
				url: "https://images.example.com/card.png",
			},
		]);
		const threeReferences = createReferenceGalleryValue([
			...twoReferences.items,
			{
				id: "remote-2",
				source: "remote_url",
				url: "https://images.example.com/nav.png",
			},
		]);

		expect(
			getCompletionIssues(lesson!, {
				[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
				reference_gallery: twoReferences,
			}),
		).toEqual([
			{
				id: "reference_gallery",
				label: "Save at least 3 references",
				kind: "field",
			},
		]);
		expect(
			getCompletionIssues(lesson!, {
				[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
				reference_gallery: threeReferences,
			}),
		).toEqual([]);
		expect(
			getWorkbenchSectionStates(lesson!, {
				[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
				reference_gallery: threeReferences,
			})[0]?.isComplete,
		).toBe(true);
	});

	it("adapts legacy 2.1 board rows into the current reference gallery contract", () => {
		const lesson = getLessonById("2.1");
		const wrapUpLesson = getLessonById("2.7");
		expect(lesson).toBeTruthy();
		expect(wrapUpLesson).toBeTruthy();

		const normalized = normalizeLessonFieldValues(lesson!, {
			reference_board: [
				"https://images.example.com/ref-1.png",
				"Editorial onboarding flow",
				" https://images.example.com/ref-2.png ",
				"",
			],
			reference_patterns: "Tight cards and dense hierarchy.",
		});
		const pinnedArtifacts = [
			getLegacyReferenceBoardArtifact(),
			getSketchSetArtifact(),
			getStoryboardImageArtifact(),
			getRoughScreensArtifact(),
			getVisualDirectionArtifact(),
		];

		expect(normalized).toMatchObject({
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			reference_gallery: {
				kind: "reference_gallery",
				items: [
					{
						id: "legacy-reference-1",
						source: "remote_url",
						url: "https://images.example.com/ref-1.png",
					},
					{
						id: "legacy-reference-2",
						source: "remote_url",
						fileName: "Editorial onboarding flow",
					},
					{
						id: "legacy-reference-3",
						source: "remote_url",
						url: "https://images.example.com/ref-2.png",
					},
				],
			},
		});
		expect(
			getObjectiveTasks(wrapUpLesson!, {}, { pinnedArtifacts }).find(
				(task) => task.id === "design-spec:references",
			)?.status,
		).toBe("complete");
	});

	it("adapts legacy 2.2 single uploads into the current sketch array contract", () => {
		const lesson = getLessonById("2.2");
		const wrapUpLesson = getLessonById("2.7");
		expect(lesson).toBeTruthy();
		expect(wrapUpLesson).toBeTruthy();

		const normalized = normalizeLessonFieldValues(lesson!, {
			sketch_upload: {
				kind: "upload",
				status: "stored",
				storageId: "legacy-sketch-1",
				fileName: "legacy-screen-1.jpg",
				url: "https://example.com/legacy-screen-1.jpg",
			},
		});
		const pinnedArtifacts = [
			getReferenceBoardArtifact(),
			getLegacySketchSetArtifact(),
			getStoryboardImageArtifact(),
			getRoughScreensArtifact(),
			getVisualDirectionArtifact(),
		];

		expect(normalized.sketch_upload).toEqual([
			expect.objectContaining({
				storageId: "legacy-sketch-1",
				fileName: "legacy-screen-1.jpg",
			}),
		]);
		expect(
			getObjectiveTasks(wrapUpLesson!, {}, { pinnedArtifacts }).find(
				(task) => task.id === "design-spec:sketches",
			)?.status,
		).toBe("complete");
	});

	it("adapts legacy 2.6 style rules into the current visual-direction contract", () => {
		const lesson = getLessonById("2.6");
		const wrapUpLesson = getLessonById("2.7");
		expect(lesson).toBeTruthy();
		expect(wrapUpLesson).toBeTruthy();

		const normalized = normalizeLessonFieldValues(lesson!, {
			style_rule_1: "Quiet typography",
			style_rule_2: "Dense spacing",
			style_rule_3: "Sharp cards",
			avoid_rule: "Soft gradients",
		});
		const pinnedArtifacts = [
			getReferenceBoardArtifact(),
			getSketchSetArtifact(),
			getStoryboardImageArtifact(),
			getRoughScreensArtifact(),
			getLegacyVisualDirectionArtifact(),
		];

		expect(normalized).toMatchObject({
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			visual_direction_notes:
				"Style rule 1: Quiet typography\nStyle rule 2: Dense spacing\nStyle rule 3: Sharp cards\nAvoid: Soft gradients",
			visual_guide_markdown: expect.stringContaining("## Avoid"),
		});
		expect(
			getObjectiveTasks(wrapUpLesson!, {}, { pinnedArtifacts }).find(
				(task) => task.id === "design-spec:visual-direction",
			)?.status,
		).toBe("complete");
	});

	it("composes 2.7 into a curated design spec from saved Design artifacts", () => {
		const lesson = getLessonById("2.7");
		expect(lesson).toBeTruthy();

		const preview = buildResolvedArtifactPreview(lesson!, {}, [
			getReferenceBoardArtifact(),
			getSketchSetArtifact(),
			getStoryboardImageArtifact(),
			getRoughScreensArtifact(),
			getVisualDirectionArtifact(),
		]);

		expect(preview.fields.map(([label]) => label)).toEqual([
			"Reference direction",
			"Screen plan",
			"Flow sequence",
			"Visual direction",
		]);
		expect(preview.fieldValues.reference_saved_count).toBe(4);
		expect(preview.fieldValues.sketch_uploaded_count).toBe(2);
		expect(preview.fieldValues.storyboard_locked_count).toBe(1);
		expect(preview.fieldValues.visual_guide_saved_count).toBe(1);
		expect(preview.fieldValues).not.toHaveProperty("rough_screen_notes");
		expect(preview.fields).toEqual([
			[
				"Reference direction",
				"4 saved references locked the patterns, hierarchy, and taste Build should borrow from.",
			],
			[
				"Screen plan",
				"The 3-5 rough screens are ready, so Build can start from a real screen plan instead of a blank editor.",
			],
			[
				"Flow sequence",
				"The storyboard already sequences the core user path, so the first implemented slice has a clear flow to follow.",
			],
			[
				"Visual direction",
				"Direction: Quiet, editorial, and sharp with tighter spacing and stronger contrast.\nVisual Guide is saved for implementation.",
			],
		]);
	});

	it("derives 2.7 progress tasks from the saved Design block artifacts", () => {
		const lesson = getLessonById("2.7");
		expect(lesson).toBeTruthy();

		const tasks = getObjectiveTasks(
			lesson!,
			{},
			{
				pinnedArtifacts: [
					getReferenceBoardArtifact(),
					getSketchSetArtifact(),
					getStoryboardImageArtifact(),
					getRoughScreensArtifact(),
					getVisualDirectionArtifact(),
				],
			},
		);

		expect(tasks.map((task) => task.label)).toEqual([
			"Lock the reference direction",
			"Carry the sketches into the handoff",
			"Lock the storyboard flow",
			"Carry the rough screens into Build",
			"Save visualguide.md for Build",
			"Assemble the design spec",
		]);
		expect(tasks.every((task) => task.status === "complete")).toBe(true);
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

	it("strips local preview urls before persisting a reference gallery", () => {
		const lesson = getLessonById("2.1");
		expect(lesson).toBeTruthy();

		expect(
			prepareFieldValuesForPersistence(lesson!, {
				reference_gallery: createReferenceGalleryValue([
					{
						id: "upload-1",
						source: "upload",
						fileName: "hero.png",
						mimeType: "image/png",
						size: 1024,
						storageId: "storage-1",
						previewUrl: "blob:http://localhost/hero",
					},
					{
						id: "remote-1",
						source: "remote_url",
						url: "https://images.example.com/ref.png",
					},
				]),
			}),
		).toEqual({
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			reference_gallery: {
				kind: "reference_gallery",
				items: [
					{
						id: "upload-1",
						source: "upload",
						fileName: "hero.png",
						mimeType: "image/png",
						size: 1024,
						storageId: "storage-1",
					},
					{
						id: "remote-1",
						source: "remote_url",
						url: "https://images.example.com/ref.png",
					},
				],
			},
		});
	});

	it("strips preview-only data from multi-image sketch uploads before persistence", () => {
		const lesson = getLessonById("2.2");
		expect(lesson).toBeTruthy();

		expect(
			prepareFieldValuesForPersistence(lesson!, {
				sketch_upload: [
					{
						kind: "upload",
						status: "stored",
						fileName: "screen-1.jpg",
						storageId: "sketch-1",
						previewUrl: "blob:http://localhost/sketch-1",
					},
					{
						kind: "upload",
						status: "stored",
						fileName: "screen-2.jpg",
						storageId: "sketch-2",
						url: "https://example.com/sketch-2.jpg",
						previewUrl: "blob:http://localhost/sketch-2",
					},
				],
			}),
		).toEqual({
			[FIELD_SHAPE_VERSION_FIELD_ID]: 1,
			sketch_upload: [
				{
					kind: "upload",
					status: "stored",
					fileName: "screen-1.jpg",
					mimeType: undefined,
					size: undefined,
					storageId: "sketch-1",
				},
				{
					kind: "upload",
					status: "stored",
					fileName: "screen-2.jpg",
					mimeType: undefined,
					size: undefined,
					storageId: "sketch-2",
				},
			],
		});
	});

	it("treats one stored sketch image as enough to complete lesson 2.2", () => {
		const lesson = getLessonById("2.2");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			sketch_upload: [
				{
					kind: "upload",
					status: "stored",
					fileName: "screen-1.jpg",
					storageId: "sketch-1",
				},
			],
		});

		expect(issues).toEqual([]);
	});
});
