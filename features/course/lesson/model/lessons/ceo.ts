import { createPendingLessonCoach } from "../content-helpers";
import { splitPanelDefaults, type LessonConfig } from "../contracts";
import { createVideoLesson } from "../video-lesson-factory";

export const ceoLessons = [
	{
		id: "1.3",
		slug: "01-03-start-with-the-problem",
		order: 2,
		block: "CEO",
		title: "Start With the Problem",
		shortTitle: "Problem",
		shell: "split",
		availableLayoutModes: ["focus"],
		workbench: "guided_form",
		artifact: {
			key: "candidate_problems",
			label: "3 Candidate Problems",
			type: "mixed",
			required: true,
		},
		prevLessonId: "1.2",
		nextLessonId: "1.4",
		unlocks: { lessons: ["1.4"] },
		coachMode: "docked",
		coachVideoPlacement: "workbench",
		workbenchMediaLayout: "split",
		objectiveTitle: "CEO 1.3 — Start With the Problem",
		checklist: [
			"Watch the lesson",
			"Capture 3 candidate problems",
			"Keep each problem grounded in a real person and recurring pain",
		],
		helperText:
			"Start with the pain, not the product idea. Draft three candidate problems before narrowing anything down.",
		winCondition: "Three grounded candidate problems are captured.",
		panelDefaults: splitPanelDefaults,
		requireReadyVideoForCompletion: true,
		workbenchSections: [
			{
				id: "problem_candidate_1",
				eyebrow: "Candidate 1",
				title: "First problem candidate",
				instruction:
					"Name who has the problem and what keeps going wrong for them.",
				layout: "stack",
				fieldIds: [
					"problem_1_who",
					"problem_1_pain",
					"problem_1_frequency",
					"problem_1_severity",
				],
				completionLabel: "Candidate 1 drafted",
			},
			{
				id: "problem_candidate_2",
				eyebrow: "Candidate 2",
				title: "Second problem candidate",
				instruction:
					"Try a different person or a sharper version of the pain so you are comparing real options.",
				layout: "stack",
				fieldIds: [
					"problem_2_who",
					"problem_2_pain",
					"problem_2_frequency",
					"problem_2_severity",
				],
				completionLabel: "Candidate 2 drafted",
			},
			{
				id: "problem_candidate_3",
				eyebrow: "Candidate 3",
				title: "Third problem candidate",
				instruction:
					"Push for the most concrete, recurring pain you can actually recognize in the wild.",
				layout: "stack",
				fieldIds: [
					"problem_3_who",
					"problem_3_pain",
					"problem_3_frequency",
					"problem_3_severity",
				],
				completionLabel: "Candidate 3 drafted",
			},
		],
		workbenchFields: [
			{
				id: "problem_1_who",
				label: "Who has this problem?",
				kind: "text",
				required: true,
				placeholder: "A real person or group, not a broad market label.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 1 owner",
			},
			{
				id: "problem_1_pain",
				label: "What recurring pain do they keep running into?",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"Describe the moment that keeps going wrong in their life or work.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 1 pain",
			},
			{
				id: "problem_1_frequency",
				label: "How frequent is this problem?",
				kind: "radio_group",
				required: true,
				options: ["Hourly", "Daily", "Weekly", "Monthly"],
				artifactPreviewLabel: "Problem 1 frequency",
			},
			{
				id: "problem_1_severity",
				label: "How painful is the problem?",
				kind: "select",
				required: true,
				options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
				artifactPreviewLabel: "Problem 1 pain score",
			},
			{
				id: "problem_2_who",
				label: "Who has this problem?",
				kind: "text",
				required: true,
				placeholder: "A second candidate person or group.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 2 owner",
			},
			{
				id: "problem_2_pain",
				label: "What recurring pain do they keep running into?",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"Describe a different problem worth comparing against the first one.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 2 pain",
			},
			{
				id: "problem_2_frequency",
				label: "How frequent is this problem?",
				kind: "radio_group",
				required: true,
				options: ["Hourly", "Daily", "Weekly", "Monthly"],
				artifactPreviewLabel: "Problem 2 frequency",
			},
			{
				id: "problem_2_severity",
				label: "How painful is the problem?",
				kind: "select",
				required: true,
				options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
				artifactPreviewLabel: "Problem 2 pain score",
			},
			{
				id: "problem_3_who",
				label: "Who has this problem?",
				kind: "text",
				required: true,
				placeholder: "A third candidate person or group.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 3 owner",
			},
			{
				id: "problem_3_pain",
				label: "What recurring pain do they keep running into?",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"Describe the third problem clearly enough to compare it with the others.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 3 pain",
			},
			{
				id: "problem_3_frequency",
				label: "How frequent is this problem?",
				kind: "radio_group",
				required: true,
				options: ["Hourly", "Daily", "Weekly", "Monthly"],
				artifactPreviewLabel: "Problem 3 frequency",
			},
			{
				id: "problem_3_severity",
				label: "How painful is the problem?",
				kind: "select",
				required: true,
				options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
				artifactPreviewLabel: "Problem 3 pain score",
			},
		],
		content: {
			status: "draft",
			intro:
				"Start with the problem, not the solution. Watch the lesson, then write three candidate pains that are grounded enough to test.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Generate three grounded candidate problems before you narrow.",
				purpose:
					"Force the sprint to begin from real pain instead of drifting into feature ideas too early.",
			},
			actionCard: {
				jobNow: "Capture three candidate problems while the lesson is fresh.",
				timebox: "10 minutes",
				comeBackWith:
					"Three candidate problems that are specific enough to compare.",
			},
			coach: createPendingLessonCoach({
				title: "Start With the Problem",
				resources: [],
			}),
			workbench: {
				prompt:
					"Draft three candidate problems before deciding which direction is worth carrying forward.",
				teachingPoints: [
					"Name a real person or group, not a market.",
					"Describe the recurring pain, not the product idea.",
					"Keep each candidate concrete enough that the person would recognize it immediately.",
				],
				emptyState:
					"Draft three candidate problems before deciding which direction is worth carrying forward.",
			},
		},
	},
	{
		id: "1.4",
		slug: "01-04-pick-one-user",
		order: 3,
		block: "CEO",
		title: "Pick One User",
		shortTitle: "User",
		shell: "split",
		availableLayoutModes: ["focus"],
		workbench: "guided_form",
		artifact: {
			key: "user_statement",
			label: "User Statement",
			type: "mixed",
			required: true,
		},
		prevLessonId: "1.3",
		nextLessonId: "1.5",
		unlocks: { lessons: ["1.5"] },
		coachMode: "docked",
		coachVideoPlacement: "workbench",
		workbenchMediaLayout: "split",
		objectiveTitle: "CEO 1.4 — Pick One User",
		checklist: [
			"Watch the lesson",
			"Commit to one of the three problems",
			"Write the user details that make the choice testable this week",
		],
		handoff: {
			mode: "select_candidate_problem",
			sourceArtifactKey: "candidate_problems",
			selectionFieldId: "selected_problem_index",
			options: [
				{
					index: 1,
					ownerSourceFieldId: "problem_1_who",
					statementSourceFieldId: "problem_1_pain",
				},
				{
					index: 2,
					ownerSourceFieldId: "problem_2_who",
					statementSourceFieldId: "problem_2_pain",
				},
				{
					index: 3,
					ownerSourceFieldId: "problem_3_who",
					statementSourceFieldId: "problem_3_pain",
				},
			],
			persistedFields: [
				{
					targetFieldId: "selected_problem_owner",
					source: "owner",
					previewLabel: "Chosen user",
				},
				{
					targetFieldId: "selected_problem_statement",
					source: "statement",
					previewLabel: "Chosen problem",
				},
			],
		},
		helperText:
			"Commit to the one user-problem pair you can actually test this week.",
		winCondition:
			"One problem is selected and backed by concrete user details.",
		panelDefaults: splitPanelDefaults,
		requireReadyVideoForCompletion: true,
		workbenchSections: [
			{
				id: "user_details",
				eyebrow: "Pressure-test the choice",
				title: "Make the user specific enough to build for",
				instruction:
					"Use the chosen problem, then describe the exact moment, current workaround, and how you can reach them this week.",
				layout: "stack",
				fieldIds: ["pain_moment", "current_solution", "reachability"],
				blockedByFieldIds: ["selected_problem_index"],
				completionLabel: "User details captured",
			},
		],
		workbenchFields: [
			{
				id: "pain_moment",
				label: "What exact moment makes this painful?",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"Describe the moment this problem becomes impossible to ignore.",
				inputWidth: "wide",
				artifactPreviewLabel: "Pain moment",
			},
			{
				id: "current_solution",
				label: "How do they handle it today?",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"Describe the workaround or messy process they already use today.",
				inputWidth: "wide",
				artifactPreviewLabel: "Current workaround",
			},
			{
				id: "reachability",
				label: "How can you reach them this week?",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"Explain the real path you have to show this to them this week.",
				inputWidth: "wide",
				artifactPreviewLabel: "Reach this week",
			},
		],
		content: {
			status: "draft",
			intro:
				"Pick one of the three problems from the last screen, then make the user concrete enough that you could actually test the direction this week.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Commit to one user-problem pair and make it testable.",
				purpose:
					"Reduce strategic drift by choosing one real user and pressure-testing whether you can get in front of them quickly.",
			},
			actionCard: {
				jobNow: "Choose the user-problem pair you can test fastest.",
				timebox: "10 minutes",
				comeBackWith:
					"One chosen user with a pain moment, workaround, and reach path.",
			},
			coach: createPendingLessonCoach({
				title: "Pick One User",
				resources: [],
			}),
			workbench: {
				prompt:
					"Choose one of the three problems from 1.3, then pressure-test whether it is the fastest real user to build for.",
				teachingPoints: [
					"Pick the one user-problem pair you can reach quickly.",
					"Describe the exact moment this becomes painful for them.",
					"Capture the workaround and the path to show this to them this week.",
				],
				emptyState:
					"Choose one of the three problems from 1.3, then pressure-test whether it is the fastest real user to build for.",
			},
		},
	},
	{
		id: "1.5",
		slug: "01-05-define-the-outcome",
		order: 4,
		block: "CEO",
		title: "Define the Outcome",
		shortTitle: "Outcome",
		shell: "split",
		availableLayoutModes: ["focus"],
		workbench: "guided_form",
		artifact: {
			key: "outcome_statement",
			label: "Outcome statement",
			type: "mixed",
			required: true,
		},
		prevLessonId: "1.4",
		nextLessonId: "1.6",
		unlocks: { lessons: ["1.6"] },
		coachMode: "docked",
		coachVideoPlacement: "workbench",
		workbenchMediaLayout: "split",
		objectiveTitle: "CEO 1.5 — Define the Outcome",
		checklist: [
			"Watch the lesson",
			"State the promised outcome in user terms",
			"Make success observable and name the pain removed",
		],
		helperText:
			"Lock one outcome you can pressure-test in research—not a feature list.",
		winCondition: "Outcome, observable proof, and user difference are saved.",
		panelDefaults: splitPanelDefaults,
		requireReadyVideoForCompletion: true,
		workbenchSections: [
			{
				id: "outcome_statement",
				eyebrow: "Outcome",
				title: "Define the outcome in user terms",
				instruction:
					"Write what changes for the user after the product works—not what the product contains.",
				layout: "stack",
				fieldIds: ["outcome", "success_looks_like", "difference_for_user"],
				completionLabel: "Outcome statement saved",
			},
		],
		workbenchFields: [
			{
				id: "outcome",
				label: "Promised outcome",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"One sentence: the changed condition for the user when this works.",
				inputWidth: "wide",
				artifactPreviewLabel: "Promised outcome",
			},
			{
				id: "success_looks_like",
				label: "Observable proof",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"What can the user do or finish that proves this outcome is real?",
				inputWidth: "wide",
				artifactPreviewLabel: "Success looks like",
			},
			{
				id: "difference_for_user",
				label: "Pain removed",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					"What becomes easier or stops hurting for them when this works?",
				inputWidth: "wide",
				artifactPreviewLabel: "Difference for user",
			},
		],
		content: {
			status: "draft",
			intro:
				"Turn your direction into one user-centered outcome you can test in the next lesson—not a feature inventory.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Define one outcome stated as the user’s changed state.",
				purpose:
					"Keep research and scope decisions anchored to a clear user win instead of drifting into app ideas.",
			},
			actionCard: {
				jobNow:
					"Write the outcome, what success looks like, and what pain goes away.",
				timebox: "10 minutes",
				comeBackWith:
					"Three lines you could read to a user and they would nod.",
			},
			coach: createPendingLessonCoach({
				title: "Define the Outcome",
				resources: [],
			}),
			workbench: {
				prompt:
					"State the promised outcome, observable proof, and pain removed—in user language, not product features.",
				teachingPoints: [
					"Outcome is the user’s changed state, not a list of features.",
					"Success should be something you could observe or verify.",
					"Name what gets easier or stops hurting for them.",
				],
				emptyState:
					"State the promised outcome, observable proof, and pain removed—in user language, not product features.",
			},
		},
	},
	createVideoLesson({
		id: "1.6",
		slug: "01-06-light-research-not-a-thesis",
		order: 5,
		block: "CEO",
		title: "Light Research, Not a Thesis",
		shortTitle: "Research",
		prevLessonId: "1.5",
		nextLessonId: "1.7",
		pinnedArtifacts: ["user_statement", "outcome_statement"],
		coachResources: [
			{
				id: "light_research_prompt",
				label: "Light research prompt",
				kind: "copy_prompt",
				promptTemplateId: "competitor_research",
				body: "Copy this into your AI tool to scan alternatives fast—anchored to your chosen user and outcome, not a thesis.",
				copySuccessToastMessage:
					"Copied the research prompt. Go paste it in your favorite model.",
			},
		],
	}),
	createVideoLesson({
		id: "1.7",
		slug: "01-07-scope-hammer",
		order: 6,
		block: "CEO",
		title: "Scope Hammer",
		shortTitle: "Scope",
		prevLessonId: "1.6",
		nextLessonId: "1.8",
		pinnedArtifacts: ["user_statement", "outcome_statement"],
		artifact: {
			key: "scope_boundary",
			label: "Scope boundary",
			type: "mixed",
			required: true,
		},
		objectiveTitle: "CEO 1.7 — Scope boundary locked",
		winCondition: "Video watched and v1 scope captured (in / out / rationale).",
		checklist: [
			"Watch the scope walkthrough",
			"List what stays in v1",
			"List what is explicitly out (for now)",
			"Write one line on why this scope is shippable",
		],
		intro:
			"Watch the walkthrough, then lock a v1 scope your next block can design against—tight enough to ship, honest about what you are not building yet.",
		teachingPoints: [
			"In-scope items should be buildable as one coherent first version.",
			"Out-of-scope is a promise to your future self—not a backlog dump.",
			"Rationale ties scope to the user and outcome you already chose.",
		],
		actionJobNow:
			"Watch Scope Hammer, then capture in-scope, out-of-scope, and rationale.",
		actionTimebox: "15–20 minutes",
		actionComeBackWith:
			"A scope boundary you could hand to Design without another strategy meeting.",
		workbenchPrompt:
			"Capture what ships in v1, what waits, and why this cut is the right one.",
		workbenchEmptyState:
			"Add at least one real line in each list and a short rationale.",
		coachResources: [
			{
				id: "scope_boundary_prompt",
				label: "Scope boundary prompt",
				kind: "copy_prompt",
				promptTemplateId: "scope_boundary",
				body: "Copy into your AI tool to pressure-test v1 scope against your user and outcome.",
			},
		],
		promptImport: {
			promptTemplateId: "scope_boundary",
			inScopeFieldId: "in_scope",
			outOfScopeFieldId: "out_of_scope",
			rationaleFieldId: "v1_rationale",
		},
		workbenchFields: [
			{
				id: "in_scope",
				label: "In v1 (keep)",
				kind: "board",
				required: true,
				rows: 6,
				placeholder: "One item per line",
				helpText:
					"What a first version actually includes—concrete enough to design screens for.",
			},
			{
				id: "out_of_scope",
				label: "Out of v1 (cut)",
				kind: "board",
				required: true,
				rows: 6,
				placeholder: "One item per line",
				helpText:
					"What you are not building yet—so the team does not drift mid-design.",
			},
			{
				id: "v1_rationale",
				label: "Why this scope",
				kind: "textarea",
				required: true,
				rows: 5,
				placeholder:
					"One or two sentences tying scope to your user and outcome.",
			},
		],
	}),
	createVideoLesson({
		id: "1.8",
		slug: "01-08-ceo-wrap-up",
		order: 7,
		block: "CEO",
		title: "CEO Wrap-Up",
		shortTitle: "Wrap-Up",
		prevLessonId: "1.7",
		nextLessonId: "1.9",
		workbenchFields: [
			{
				id: "ceo_wrap_carry_forward",
				label: "What you're carrying into Design",
				kind: "textarea",
				rows: 4,
				placeholder:
					"Framing, scope, or one commitment you want to keep—optional.",
				helpText:
					"Optional. Nothing here is required to finish this lesson or unlock the next step.",
			},
			{
				id: "ceo_wrap_risk_watch",
				label: "One risk to watch",
				kind: "textarea",
				rows: 3,
				placeholder: "What might derail the next block? Optional.",
			},
		],
	}),
	createVideoLesson({
		id: "1.9",
		slug: "01-09-ceo-skills",
		order: 8,
		block: "CEO",
		title: "CEO Skills",
		shortTitle: "Skills",
		prevLessonId: "1.8",
		nextLessonId: "2.0",
		unlockBlocks: ["DESIGN"],
		intro:
			"Use the skills overview as the final CEO bridge, then move into the first live Design lesson.",
		teachingPoints: [
			"Treat this as the closing bridge out of CEO.",
			"Carry the framing into Design instead of reopening strategy.",
			"Move directly into the Design block after this lesson.",
		],
	}),
] satisfies LessonConfig[];
