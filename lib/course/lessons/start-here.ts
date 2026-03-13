import { createPendingLessonCoach } from "../content-helpers";
import type { LessonConfig } from "../contracts";
import { missionPanelDefaults, splitPanelDefaults } from "../contracts";
import { START_HERE_RESOURCES } from "../resources";

export const startHereLessons = [
	{
		id: "0.0",
		slug: "00-00-mission-map",
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
		nextLessonId: "0.1",
		unlocks: { lessons: ["0.1"] },
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
				purpose: "This screen is navigation and context, not a real sprint step.",
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
		id: "0.1",
		slug: "00-01-welcome-to-ship-by-sunday",
		order: 0.1,
		block: "CEO",
		title: "Welcome to Ship by Sunday",
		shortTitle: "Welcome",
		shell: "split",
		workbench: "guided_form",
		artifact: {
			key: "weekend_shipping_goal",
			label: "Weekend Shipping Goal",
			type: "text",
			required: true,
		},
		nextLessonId: "0.2",
		prevLessonId: "0.0",
		unlocks: { lessons: ["0.2"] },
		coachMode: "docked",
		coachVideoPlacement: "workbench",
		objectiveTitle: "Start Here 0.1 — Welcome to Ship by Sunday",
		checklist: [
			"See the 4-block path",
			"Define the thing you are here to ship",
			"Commit to doing reps instead of just watching",
		],
		helperText:
			"This is the orientation rep. Keep the goal small and concrete.",
		winCondition: "A concrete weekend shipping goal is saved.",
		panelDefaults: splitPanelDefaults,
		workbenchSections: [
			{
				id: "weekend_goal",
				eyebrow: "Set the target",
				title: "Define your weekend ship",
				instruction:
					"Write the smallest believable thing you want live by Sunday. If it needs a roadmap to explain it, it is too big for this sprint.",
				layout: "stack",
				fieldIds: ["weekend_goal"],
				completionLabel: "Weekend goal defined",
			},
		],
		workbenchFields: [
			{
				id: "weekend_goal",
				label: "What are you here to ship this weekend?",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder: "The smallest believable thing you want live by Sunday.",
				inputWidth: "wide",
				artifactPreviewLabel: "Weekend ship goal",
			},
		],
		content: {
			status: "draft",
			intro:
				"Welcome to Ship by Sunday. This is not designed to be watched. It is designed to be completed.",
			lessonMeta: {
				runtimeLabel: "4-6 min",
				goal: "Set the contract: this is for completion, not consumption.",
				purpose:
					"Reset the student's behavior. They need to feel guided, slightly challenged, and clear on what this weekend is actually for.",
			},
			actionCard: {
				jobNow:
					"Create a sprint folder and open the core materials you will use this weekend.",
				timebox: "10 minutes",
				comeBackWith: "A ready workspace with the core materials and tools open.",
			},
			coach: createPendingLessonCoach({
				title: "Welcome to Ship by Sunday",
				resources: START_HERE_RESOURCES,
			}),
			workbench: {
				prompt:
					"Welcome to Ship by Sunday. This is not designed to be watched. It is designed to be completed.",
				teachingPoints: [
					"What this sprint is: structured, on-demand, one focused weekend.",
					"What this sprint is not: a binge course, a bootcamp, a passive masterclass.",
					"What they leave with: brief, spec, build, live URL.",
					"The rule: do not skip ahead, do not hoard theory, do not wait to feel ready.",
				],
				emptyState:
					"Welcome to Ship by Sunday. This is not designed to be watched. It is designed to be completed.",
			},
		},
	},
	{
		id: "0.2",
		slug: "00-02-how-the-sprint-works",
		order: 0.2,
		block: "CEO",
		title: "How the Sprint Works",
		shortTitle: "Sprint",
		shell: "split",
		workbench: "roadmap_overview",
		artifact: {
			key: "sprint_setup_state",
			label: "Sprint Setup State",
			type: "checklist",
			required: true,
		},
		nextLessonId: "1.1",
		prevLessonId: "0.1",
		unlocks: { lessons: ["1.1"] },
		coachMode: "docked",
		objectiveTitle: "Start Here 0.2 — How the Sprint Works",
		checklist: ["Download Figma, VSCode", "Review the 4 Blocks"],
		objectiveMode: "manual",
		helperText:
			"Set up the sprint so the first block starts with zero confusion.",
		winCondition: "The sprint setup checklist is complete.",
		panelDefaults: splitPanelDefaults,
		content: {
			status: "draft",
			intro:
				"Each block solves a different problem, and each one sets up the next.",
			lessonMeta: {
				runtimeLabel: "5-7 min",
				goal: "Show the sequence and remove uncertainty.",
				purpose:
					"Give them the map before the climb. They should understand why each block exists and what breaks if they rush it.",
			},
			actionCard: {
				jobNow: "Skim the 4 blocks end to end.",
				timebox: "5 minutes",
				comeBackWith: "A clear sense of what gets produced in each block.",
			},
			coach: createPendingLessonCoach({
				title: "How the Sprint Works",
				resources: START_HERE_RESOURCES,
			}),
			workbench: {
				prompt:
					"Each block solves a different problem, and each one sets up the next.",
				teachingPoints: [
					"CEO Block = choose the problem, customer, and scope.",
					"Design Block = make the product concrete enough to build.",
					"Build Block = use AI to implement the core product without spiraling.",
					"Ship Block = deploy, share, and gather first feedback.",
				],
				emptyState:
					"Each block solves a different problem, and each one sets up the next.",
			},
		},
	},
] satisfies LessonConfig[];
