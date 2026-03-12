import { createPendingLessonCoach } from "../content-helpers";
import {
	focusPanelDefaults,
	splitPanelDefaults,
	type LessonConfig,
} from "../contracts";
import { WORKSHEET_03_RESOURCES } from "../resources";

export const buildLessons = [
	{
		id: "3.1",
		slug: "03-01-generate-the-build-prompt",
		order: 15,
		block: "BUILD",
		title: "Generate the Build Prompt",
		shortTitle: "Prompt",
		shell: "split",
		workbench: "build_kickoff",
		artifact: {
			key: "agent_build_brief",
			label: "Build Prompt + Starting Path",
			type: "brief",
			required: true,
			dependsOn: ["product_brief", "design_spec"],
		},
		nextLessonId: "3.2",
		prevLessonId: "2.7",
		unlocks: { lessons: ["3.2"] },
		coachMode: "docked",
		objectiveTitle: "BUILD 3.1 — Generate the Build Prompt",
		checklist: [
			"Choose a starting path",
			"Lock the first slice",
			"Define done conditions",
		],
		fieldShapeVersion: 2,
		helperText:
			"Do not hand the agent a vibe. Hand it a starting path, a first slice, and a stop condition.",
		winCondition: "The build prompt and starting path are saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["product_brief", "design_spec"],
		workbenchFields: [
			{
				id: "build_path",
				label: "Starting path",
				kind: "select",
				required: true,
				options: ["Use template", "Custom path"],
				artifactPreviewLabel: "Starting path",
				taskLabel: "Choose a starting path",
			},
			{
				id: "first_slice",
				label: "First slice to build now",
				kind: "text",
				required: true,
				helpText:
					"Name the first screen or narrow workflow slice only. Keep it small enough to build and validate before the next lesson.",
			},
			{
				id: "definition_of_done",
				label: "Definition of done",
				kind: "textarea",
				required: true,
				rows: 4,
				helpText:
					"Write the visible outcome that tells you this first slice is working. Include what the student or user should be able to do after the build.",
			},
		],
		content: {
			status: "draft",
			intro:
				"Start with a path, a first slice, and a stop condition. Then let the agent build from that clarity.",
			lessonMeta: {
				runtimeLabel: "6-8 min",
				goal: "Generate one controlled implementation prompt instead of another vague build request.",
				purpose:
					"This lesson turns the brief and spec into a usable first move for the build.",
			},
			actionCard: {
				jobNow:
					"Choose your starting path, define the first slice, and copy the build prompt into your coding agent.",
				timebox: "10 minutes",
				comeBackWith: "A copyable build prompt and a clear first move.",
			},
			coach: createPendingLessonCoach({
				title: "Generate the Build Prompt",
				resources: WORKSHEET_03_RESOURCES,
			}),
			workbench: {
				prompt:
					"Use the brief and spec to control the build. One path. One slice. One stop condition.",
				teachingPoints: [
					"Choose whether you are starting from a shared template or your own repo before you touch the build.",
					"Know the few files and envs that matter instead of trying to understand the whole codebase at once.",
					"Use skills and MCPs when they help with provider setup, browser checks, or design handoff, not as a detour.",
					"Build screen by screen. Ask for one slice at a time instead of the whole app in one jump.",
					"If the slice needs backend or data-model support, add only the minimum required and keep moving.",
					"Use logs, screenshots, and Playwright when something breaks instead of guessing.",
					"Leave cleanup and refactors for later unless the mess is blocking the current slice.",
				],
				emptyState:
					"Choose a path, define the first slice, and the build prompt will appear here.",
			},
		},
	},
	{
		id: "3.2",
		slug: "03-02-get-the-starter-running",
		order: 16,
		block: "BUILD",
		title: "Get the Starter Running",
		shortTitle: "Starter",
		shell: "watch",
		workbench: "external_workspace",
		artifact: {
			key: "working_local_environment",
			label: "Working Local Environment",
			type: "checklist",
			required: true,
			dependsOn: ["agent_build_brief"],
		},
		nextLessonId: "3.3",
		prevLessonId: "3.1",
		unlocks: { lessons: ["3.3"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.2 — Get the Starter Running",
		checklist: [
			"Open the starter or repo",
			"Install dependencies",
			"Run the app locally",
			"Note the key files and envs",
		],
		fieldShapeVersion: 2,
		helperText:
			"Watch the walkthrough, then get the starter running in your editor and terminal.",
		winCondition:
			"The walkthrough is complete and the learner is ready to get the starter running locally.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["agent_build_brief"],
		workbenchFields: [],
		content: {
			status: "draft",
			intro:
				"Get one local success state first. You do not need to master the whole stack before you move.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Get the starter or repo running locally without wandering into setup theory.",
				purpose:
					"Students need one working local baseline and just enough stack literacy to prompt around it.",
			},
			actionCard: {
				jobNow:
					"Watch the walkthrough, then open the starter or repo and get it running locally in your editor.",
				timebox: "15 minutes",
				comeBackWith: "A clean local starting point for the next build lesson.",
			},
			coach: createPendingLessonCoach({
				title: "Get the Starter Running",
				resources: WORKSHEET_03_RESOURCES,
			}),
			workbench: {
				prompt:
					"Get to one clean local success state before you worry about anything else.",
				teachingPoints: [
					"Use the package manager the project already expects instead of forcing a different tool.",
					"Know what the env files do locally and remember those values move to Vercel later.",
					"Learn the few files the agent will keep asking about: package.json, the app entrypoints, Convex or backend files, and env files.",
					"Stop as soon as the app runs locally and you can explain the next file the agent should touch.",
				],
				emptyState: "Get the starter running locally before you move on.",
			},
		},
	},
	{
		id: "3.3",
		slug: "03-03-build-the-first-screen",
		order: 17,
		block: "BUILD",
		title: "Build the First Screen",
		shortTitle: "First Screen",
		shell: "focus",
		workbench: "external_workspace",
		artifact: {
			key: "first_implemented_slice",
			label: "First Screen Implemented",
			type: "mixed",
			required: true,
			dependsOn: ["working_local_environment"],
		},
		nextLessonId: "3.4",
		prevLessonId: "3.2",
		unlocks: { lessons: ["3.4"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.3 — Build the First Screen",
		checklist: [
			"Use the saved build prompt",
			"Implement one screen or slice",
			"Capture what shipped",
		],
		fieldShapeVersion: 2,
		helperText:
			"Keep the scope tight. This is where the build stops being theory and starts being visible.",
		winCondition: "The first screen is implemented and the result is captured.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["agent_build_brief", "design_spec"],
		workbenchFields: [
			{
				id: "slice_status",
				label: "First screen implemented",
				kind: "toggle",
				required: true,
			},
			{
				id: "slice_notes",
				label: "What shipped in the first slice?",
				kind: "textarea",
				rows: 4,
				helpText:
					"Summarize the screen, route, or interaction that now exists so the next lesson can build on a real baseline.",
			},
		],
		content: {
			status: "draft",
			intro:
				"One screen. One slice. One definition of done. That is enough for this lesson.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Turn the saved prompt into the first visible piece of the product.",
				purpose:
					"Students need proof that the build system works before they expand the scope.",
			},
			actionCard: {
				jobNow:
					"Use the saved prompt to implement only the first screen or narrow slice of the flow, then capture what shipped.",
				timebox: "20 minutes",
				comeBackWith: "The first visible slice implemented.",
			},
			coach: createPendingLessonCoach({
				title: "Build the First Screen",
				resources: WORKSHEET_03_RESOURCES,
			}),
			workbench: {
				prompt:
					"Use the prompt to ship one slice, then stop before the build starts sprawling.",
				teachingPoints: [
					"Start from the saved prompt and tighten it only if the agent drifts.",
					"Implement one screen or one narrow workflow slice, not the whole product.",
					"Capture the result before you decide what the next slice should be.",
				],
				emptyState:
					"Build one screen or slice, then return here with the result.",
			},
		},
	},
	{
		id: "3.4",
		slug: "03-04-build-the-core-ux",
		order: 18,
		block: "BUILD",
		title: "Build the Core UX",
		shortTitle: "Core UX",
		shell: "watch",
		workbench: "external_workspace",
		artifact: {
			key: "core_flow_working_locally",
			label: "Core UX Working Locally",
			type: "mixed",
			required: true,
			dependsOn: ["first_implemented_slice"],
		},
		nextLessonId: "3.5",
		prevLessonId: "3.3",
		unlocks: { lessons: ["3.5"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.4 — Build the Core UX",
		checklist: [
			"Build screen by screen",
			"Add only the missing support",
			"Validate the local path",
		],
		fieldShapeVersion: 2,
		helperText:
			"Watch the walkthrough, then keep building the core path in your editor until the local flow works end to end.",
		winCondition:
			"The walkthrough is complete and the learner is ready to keep building the core UX locally.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["core_flow_image", "agent_build_brief"],
		workbenchFields: [],
		content: {
			status: "draft",
			intro:
				"Watch the pass, then keep building screen by screen until the core path works locally from start to finish.",
			lessonMeta: {
				runtimeLabel: "12-15 min",
				goal: "Turn the first slice into a usable local core experience.",
				purpose:
					"This lesson is the build loop: implement, extend carefully, and validate before chasing polish.",
			},
			actionCard: {
				jobNow:
					"Watch the walkthrough, then keep building the core path screen by screen in your editor and validate it locally.",
				timebox: "30-45 minutes",
				comeBackWith: "A local core flow that works end to end.",
			},
			coach: createPendingLessonCoach({
				title: "Build the Core UX",
				resources: WORKSHEET_03_RESOURCES,
			}),
			workbench: {
				prompt:
					"Build the spine first, then prove it works before you chase extra scope.",
				teachingPoints: [
					"Treat each new screen as its own small implementation pass.",
					"If the flow needs new backend support, add the minimum required and keep going.",
					"Use local validation after each meaningful slice so bugs stay small.",
				],
				emptyState: "Build the core path one slice at a time.",
			},
		},
	},
	{
		id: "3.5",
		slug: "03-05-debug-the-core-ux",
		order: 19,
		block: "BUILD",
		title: "Debug the Core UX",
		shortTitle: "Debug",
		shell: "watch",
		workbench: "tracker_log",
		artifact: {
			key: "blocker_log",
			label: "Blocker Log + Stable Core UX",
			type: "table",
			required: true,
			dependsOn: ["core_flow_working_locally"],
		},
		nextLessonId: "3.6",
		prevLessonId: "3.4",
		unlocks: { lessons: ["3.6"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.5 — Debug the Core UX",
		checklist: [
			"Log the blocker issues",
			"Use logs, screenshots, and Playwright",
			"Fix only what blocks the path",
			"Mark the core UX stable",
		],
		fieldShapeVersion: 2,
		helperText:
			"Watch the debugging pass, then fix the blocker issues in your editor without turning the lesson into a rewrite spiral.",
		winCondition:
			"The walkthrough is complete and the learner is ready to stabilize the core UX locally.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["core_flow_working_locally"],
		workbenchFields: [],
		content: {
			status: "draft",
			intro:
				"Watch the pass, then debug with evidence so the core UX gets stable without dragging you into a rabbit hole.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Fix blocker issues without falling into a rewrite spiral.",
				purpose:
					"This lesson protects momentum by separating blocker bugs from everything that can wait.",
			},
			actionCard: {
				jobNow:
					"Watch the walkthrough, then fix the blocker issues in the core UX using logs, screenshots, and Playwright where they help.",
				timebox: "20 minutes",
				comeBackWith: "A stable local core UX.",
			},
			coach: createPendingLessonCoach({
				title: "Debug the Core UX",
				resources: WORKSHEET_03_RESOURCES,
			}),
			workbench: {
				prompt: "Use evidence to debug and stop once the blockers are gone.",
				teachingPoints: [
					"Use logs first when the error already tells you what broke.",
					"Use screenshots when the UI looks wrong or the failure is visual.",
					"Use Playwright to reproduce the core path and catch the last rough edges.",
				],
				emptyState:
					"Log the blocker issues, then fix only the ones that block the core path.",
			},
		},
	},
	{
		id: "3.6",
		slug: "03-06-lock-the-local-build",
		order: 20,
		block: "BUILD",
		title: "Lock the Local Build",
		shortTitle: "Handoff",
		shell: "focus",
		availableLayoutModes: ["focus"],
		workbench: "brief_assembler",
		artifact: {
			key: "build_summary",
			label: "Local Build Handoff",
			type: "brief",
			required: true,
			dependsOn: [
				"agent_build_brief",
				"working_local_environment",
				"blocker_log",
			],
		},
		nextLessonId: "4.1",
		prevLessonId: "3.5",
		unlocks: { lessons: ["4.1"], blocks: ["SHIP"] },
		coachMode: "pip",
		objectiveTitle: "BUILD 3.6 — Lock the Local Build",
		checklist: [
			"Carry the build plan forward",
			"Carry the working local baseline forward",
			"Carry the stable core path forward",
			"Unlock Ship",
		],
		fieldShapeVersion: 2,
		helperText:
			"Build block complete. Lock the real local handoff, then move into Ship from proof instead of guesswork.",
		winCondition: "The Build handoff is assembled and Ship is unlocked.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: [
			"agent_build_brief",
			"working_local_environment",
			"core_flow_working_locally",
			"blocker_log",
		],
		workbenchFields: [],
		briefAssembler: {
			variant: "stage_unlock",
			preset: "build",
			leadVideo: true,
			heroEyebrow: "Build block complete",
			heroTitle: "Ship unlocked",
			heroBody:
				"You now have a real local baseline, a built core path, and a blocker-first debug pass behind you. Move into Ship from proof, not from guesswork.",
			nextStepLabel: "SHIP 4.1 — Ship the Core, Not the Fantasy",
			skills: [
				"Prompt control",
				"Slice planning",
				"Local setup",
				"Core-flow implementation",
				"Blocker-first debugging",
			],
			artifactReadyCopy:
				"Ship now gets the current local baseline, the working path, and the real constraints that still matter.",
			readyStateCopy: "Build block complete. Lock the handoff and unlock Ship.",
			completionCtaLabel: "Unlock Ship",
			celebrationEyebrow: "Build block complete",
			celebrationTitle: "Ship unlocked",
		},
		content: {
			status: "draft",
			intro:
				"Take the quick victory lap, lock the real local milestone, and move into Ship with a clean handoff instead of another recap form.",
			lessonMeta: {
				runtimeLabel: "4-6 min",
				goal: "Capture the stable local build and what still needs to wait.",
				purpose:
					"This is the handoff from local implementation into deployment, sending, and feedback.",
			},
			actionCard: {
				jobNow:
					"Watch the wrap-up, review what Build now has, then unlock Ship with the current local handoff.",
				timebox: "2-3 minutes",
				comeBackWith: "A clean handoff into Ship.",
			},
			coach: createPendingLessonCoach({
				title: "Lock the Local Build",
				resources: WORKSHEET_03_RESOURCES,
			}),
			workbench: {
				prompt:
					"Capture the real local milestone before you switch into deployment mode.",
				teachingPoints: [
					"Name what actually works now instead of what you hope to finish later.",
					"Be explicit about what is unfinished so Ship stays focused on the core, not the fantasy backlog.",
					"Keep one clean local reference so you always know what build you are shipping next.",
				],
				emptyState: "Capture the local milestone before you move into Ship.",
			},
		},
	},
] satisfies LessonConfig[];
