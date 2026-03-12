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
		[FIELD_SHAPE_VERSION_FIELD_ID]: 4,
		flow_actors: ["Startup operators"],
		flow_steps: [
			["Startup operators", "Paste notes"],
			["Startup operators", "Generate summary"],
			["Startup operators", "Review action items"],
			["Startup operators", "Share next steps"],
			["Startup operators", "Close the loop"],
		],
		flow_ending: "They leave with a clean action summary in minutes.",
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

	it("requires 1.5 to save the generated map image before completion", () => {
		const lesson = getLessonById("1.5");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 4,
			flow_actors: ["Startup operators"],
			flow_steps: [
				["Startup operators", "Paste notes"],
				["Startup operators", "Generate summary"],
				["Startup operators", "Review"],
				["Startup operators", "Share"],
				["Startup operators", "Close the loop"],
			],
			flow_ending: "They leave with a clean action summary in minutes.",
		});

		expect(issues.map((issue) => issue.label)).toContain(
			"Save current map image",
		);
	});

	it("requires 1.5 to fill 5-7 complete steps", () => {
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
			__core_flow_image_upload: {
				kind: "upload",
				status: "stored",
				storageId: "core-flow-image",
			},
		});

		expect(issues.map((issue) => issue.label)).toContain("Map 5-7 steps");
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

	it("keeps the private 1.5 saved-image field out of artifact previews", () => {
		const lesson = getLessonById("1.5");
		expect(lesson).toBeTruthy();

		const preview = buildArtifactPreview(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 4,
			flow_actors: ["Startup operators"],
			flow_steps: [
				["Startup operators", "Paste notes"],
				["Startup operators", "Generate summary"],
				["Startup operators", "Review"],
				["Startup operators", "Share"],
				["Startup operators", "Close the loop"],
			],
			flow_ending: "They leave with a clean action summary in minutes.",
			__core_flow_image_upload: {
				kind: "upload",
				status: "stored",
				storageId: "core-flow-image",
			},
		});

		expect(preview.fields.map(([label]) => label)).toEqual([
			"Actors",
			"Flow steps",
			"Value moment",
		]);
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
			"Who",
			"Outcome",
			"Evidence",
			"Flow",
			"Scope",
		]);
		expect(preview.fieldValues.research_signal_count).toBe(3);
		expect(preview.fieldValues.flow_step_count).toBe(5);
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
		]);
		expect(tasks.every((task) => task.status === "complete")).toBe(true);
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

	it("composes no-field brief assembler lessons from their pinned artifacts", () => {
		const lesson = getLessonById("2.7");
		expect(lesson).toBeTruthy();

		const preview = buildResolvedArtifactPreview(lesson!, {}, [
			{
				artifactKey: "reference_board",
				artifactLabel: "Reference Gallery",
				contextTitle: "Reference gallery",
				artifactType: "images",
				lessonId: "2.1",
				lessonTitle: "Find References First",
				fieldValues: {
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
				},
				fields: [
					[
						"Reference Gallery",
						createReferenceGalleryValue([
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
					],
				],
			},
			{
				artifactKey: "visual_direction",
				artifactLabel: "Visual Direction",
				contextTitle: "Visual direction",
				artifactType: "text",
				lessonId: "2.6",
				lessonTitle: "Choose a Visual Direction",
				fieldValues: { visual_direction: "Quiet, editorial, and sharp" },
				fields: [["Visual Direction", "Quiet, editorial, and sharp"]],
			},
		]);

		expect(preview.fields).toEqual([
			["Reference gallery", "Reference Gallery: 4 saved references"],
			["Visual direction", "Visual Direction: Quiet, editorial, and sharp"],
		]);
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
