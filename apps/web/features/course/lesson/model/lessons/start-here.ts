import { createPendingLessonCoach } from "../content-helpers";
import type { LessonSourceConfig } from "../contracts";
import { missionPanelDefaults, splitPanelDefaults } from "../contracts";
import { START_HERE_RESOURCES } from "../resources";

const INTRO_READINESS_CHECKLIST_OPTIONS = [
	"See the 4-block path",
	"Define the thing you are here to ship",
	"Commit to doing reps instead of just watching",
] as const;

export const startHereLessons = [
	{
		id: "1.0",
		slug: "01-00-mission-map",
		order: 0,
		block: "CEO",
		title: "Mission Map",
		shortTitle: "Mission",
		shell: "mission",
		workbench: "brief_assembler",
		artifact: {
			key: "mission_state",
			label: "Mission State",
			type: "mixed",
			required: false,
		},
		nextLessonId: "1.1",
		unlocks: { lessons: ["1.1"] },
		coachMode: "docked",
		objectiveTitle: "Mission Overview",
		checklist: [
			"Understand the 4-block sprint",
			"See the lesson path",
			"Start with Welcome",
		],
		helperText: "This is navigation and orientation, not a graded lesson.",
		winCondition: "User understands the path and launches Start Here.",
		panelDefaults: missionPanelDefaults,
		notes: [
			"Use this as the home / dashboard screen.",
			"Do not treat builder roles as the primary progression model.",
		],
		content: {
			status: "ready",
			intro: "See the 4-block sprint, your active level, and where to start.",
			lessonMeta: {
				runtimeLabel: "2-3 min",
				goal: "Orient the student before the sprint starts.",
				purpose:
					"This screen is navigation and context, not a real sprint step.",
			},
			actionCard: {
				jobNow: "Open Welcome and start the first real lesson.",
				timebox: "2 minutes",
				comeBackWith: "A clear view of the 4-block sprint.",
			},
			coach: createPendingLessonCoach({
				title: "Mission Map",
				resources: START_HERE_RESOURCES,
			}),
			workbench: {
				prompt: "See the full sprint before you begin.",
				teachingPoints: [
					"Understand the 4-block sprint.",
					"See the lesson path.",
					"Start with Welcome.",
				],
				emptyState: "See the full sprint before you begin.",
			},
		},
	},
	{
		id: "1.1",
		slug: "01-01-welcome-to-ship-by-sunday",
		order: 0.1,
		block: "CEO",
		title: "Welcome",
		shortTitle: "Welcome",
		shell: "split",
		availableLayoutModes: ["focus"],
		workbench: "guided_form",
		artifact: {
			key: "weekend_shipping_goal",
			label: "Ship by Sunday app brief",
			type: "brief",
			required: true,
		},
		nextLessonId: "1.2",
		prevLessonId: "1.0",
		unlocks: { lessons: ["1.2"] },
		coachMode: "docked",
		coachVideoPlacement: "workbench",
		workbenchMediaLayout: "split",
		objectiveTitle: "Weekend app brief + readiness",
		checklist: [...INTRO_READINESS_CHECKLIST_OPTIONS],
		helperText:
			"Orientation plus a tiny written brief. Keep scope believable for one weekend.",
		winCondition: "App brief and readiness checklist are saved.",
		panelDefaults: splitPanelDefaults,
		workbenchSections: [
			{
				id: "app_brief",
				eyebrow: "Brief",
				title: "Ship by Sunday app brief",
				instruction:
					"Name the product, the problem, and why shipping this weekend matters. If it needs a roadmap to explain, it is too big for this sprint.",
				layout: "stack",
				fieldIds: ["app_idea", "problem_to_solve", "why_ship_now"],
				completionLabel: "Brief captured",
			},
			{
				id: "readiness",
				eyebrow: "Commit",
				title: "Readiness",
				instruction:
					"Check each line only if you mean it—this gates the lesson.",
				layout: "stack",
				fieldIds: ["intro_readiness_checklist"],
				completionLabel: "Readiness confirmed",
			},
		],
		workbenchFields: [
			{
				id: "app_idea",
				label: "What are you building?",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder:
					"One product or slice of a product you can ship by Sunday.",
				inputWidth: "wide",
				artifactPreviewLabel: "Building",
			},
			{
				id: "problem_to_solve",
				label: "What problem does it solve?",
				kind: "text",
				required: true,
				placeholder: "The recurring headache for a specific user.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem",
			},
			{
				id: "why_ship_now",
				label: "Why is this worth shipping by Sunday?",
				kind: "text",
				required: true,
				placeholder: "Why this weekend—not someday.",
				inputWidth: "wide",
				artifactPreviewLabel: "Why now",
			},
			{
				id: "intro_readiness_checklist",
				label: "Readiness checklist",
				kind: "checklist",
				required: true,
				options: [...INTRO_READINESS_CHECKLIST_OPTIONS],
				artifactPreviewLabel: "Readiness",
			},
		],
		content: {
			status: "draft",
			intro:
				"You work through lessons in order and leave with a brief, a build, and a live URL—not a backlog of unwatched videos.",
			lessonMeta: {
				runtimeLabel: "4-6 min",
				goal: "Orient fast, then lock a weekend-sized brief.",
				purpose:
					"Show how the sprint is structured (lessons, software layer, tools), where Product Strategy / UX / Coding show up, and how tooling fits—without drowning in vendor drama.",
			},
			actionCard: {
				jobNow: "Keep the setup docs and starter repo one click away.",
				timebox: "5 minutes",
				comeBackWith: "Docs and repo ready in your workspace.",
			},
			coach: createPendingLessonCoach({
				title: "Welcome",
				resources: START_HERE_RESOURCES,
			}),
			workbench: {
				prompt:
					"Skim orientation, then write a brief small enough to finish this weekend.",
				teachingPoints: [
					"Sprint = CEO → Design → Build → Ship, each with concrete outputs.",
					"Product Trinity = Strategy (what/why), UX (clarity to build), Coding (implementation reps).",
					"Rule: complete the work in each lesson before moving on.",
				],
				emptyState:
					"Skim orientation, then write a brief small enough to finish this weekend.",
			},
		},
	},
	{
		id: "1.2",
		slug: "01-02-how-the-sprint-works",
		order: 0.2,
		block: "CEO",
		title: "How the Sprint Works",
		shortTitle: "Sprint",
		shell: "split",
		availableLayoutModes: ["focus"],
		workbench: "roadmap_overview",
		artifact: {
			key: "sprint_setup_state",
			label: "Sprint Setup State",
			type: "checklist",
			required: true,
		},
		nextLessonId: "1.3",
		prevLessonId: "1.1",
		unlocks: { lessons: ["1.3"] },
		coachMode: "docked",
		coachVideoPlacement: "workbench",
		workbenchMediaLayout: "split",
		objectiveTitle: "Start Here 1.2 — How the Sprint Works",
		checklist: [
			"I have reviewed the sprint map and understand what comes next",
		],
		objectiveMode: "manual",
		helperText:
			"Lightweight orientation: know where you are, what you will produce, and the next lesson.",
		winCondition: "Sprint map reviewed and next step is clear.",
		panelDefaults: splitPanelDefaults,
		content: {
			status: "draft",
			intro:
				"See how CEO, Design, Build, and Ship fit together and what you will produce before you build.",
			lessonMeta: {
				runtimeLabel: "5-7 min",
				goal: "Show the sequence and remove uncertainty.",
				purpose:
					"Give them the map before the climb. They should understand why each block exists and what breaks if they rush it.",
			},
			actionCard: {
				jobNow:
					"Watch the video, scan the sprint path, then continue to the next lesson.",
				timebox: "5 minutes",
				comeBackWith:
					"A clear sense of where you are and what lesson to open next.",
			},
			coach: createPendingLessonCoach({
				title: "How the Sprint Works",
				resources: START_HERE_RESOURCES,
			}),
			workbench: {
				prompt:
					"CEO, then Design, then Build, then Ship—each block answers a different question.",
				teachingPoints: [
					"CEO Block = choose the problem, user, outcome, flow, and scope.",
					"Design Block = make the product concrete enough to build.",
					"Build Block = use AI to implement the core product without spiraling.",
					"Ship Block = deploy, share, and gather first feedback.",
				],
				emptyState:
					"CEO, then Design, then Build, then Ship—each block answers a different question.",
			},
		},
	},
] satisfies LessonSourceConfig[];
