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
		shell: "focus",
		workbench: "console_checklist",
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
			"Use focus mode. The real work happens in the editor and terminal, not in the lesson shell.",
		winCondition: "The starter is running locally and the setup notes are saved.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["agent_build_brief"],
		workbenchFields: [
			{
				id: "environment_ready",
				label: "Starter running locally",
				kind: "checklist",
				required: true,
				options: [
					"Open the starter or repo",
					"Install dependencies with the project package manager",
					"Run the app locally",
					"Note the key files and envs",
				],
			},
			{
				id: "environment_notes",
				label: "What files or envs matter here?",
				kind: "textarea",
				rows: 4,
				helpText:
					"Write the smallest useful orientation: package manager, entrypoints, env file, and anything blocking the local run.",
			},
		],
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
					"Open the starter or repo, install dependencies, run it locally, and note the few files and envs that matter.",
				timebox: "15 minutes",
				comeBackWith: "A working local environment and lean setup notes.",
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
				emptyState: "Build one screen or slice, then return here with the result.",
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
		shell: "focus",
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
			"Keep the core path moving. Add the smallest backend or data support the flow actually needs, then validate.",
		winCondition: "The core UX works locally from start to finish.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["core_flow_image", "agent_build_brief"],
		workbenchFields: [
			{
				id: "core_flow_status",
				label: "Core UX working locally",
				kind: "checklist",
				required: true,
				options: [
					"Build the next screens or steps one at a time",
					"Add only the missing data, auth, or backend support",
					"Validate the local path from start to finish",
				],
			},
		],
		content: {
			status: "draft",
			intro:
				"Move screen by screen. Add missing support only when the core path forces the issue.",
			lessonMeta: {
				runtimeLabel: "12-15 min",
				goal: "Turn the first slice into a usable local core experience.",
				purpose:
					"This lesson is the build loop: implement, extend carefully, and validate before chasing polish.",
			},
			actionCard: {
				jobNow:
					"Keep building the core path screen by screen. Add only the data or auth support the flow actually needs, then validate it locally.",
				timebox: "30-45 minutes",
				comeBackWith: "The core UX working locally.",
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
		shell: "focus",
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
			"Not every bug matters equally. Fix the blockers, log the rest, and protect momentum.",
		winCondition: "The blocker log is captured and the core UX is marked stable.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["core_flow_working_locally"],
		workbenchFields: [
			{
				id: "blocker_table",
				label: "Blocker log",
				kind: "table",
				required: true,
				columns: [
					{
						id: "blocker",
						label: "Blocker",
						kind: "text",
						placeholder: "What is breaking?",
						width: "compact",
					},
					{
						id: "cause",
						label: "Root cause",
						kind: "text",
						placeholder: "What actually caused it?",
					},
					{
						id: "fixTried",
						label: "What you tried",
						kind: "text",
						placeholder: "Logs, screenshot, Playwright, or provider fix",
					},
					{
						id: "resolved",
						label: "Resolved?",
						kind: "select",
						options: ["Yes", "No"],
						placeholder: "Select one",
						width: "compact",
					},
				],
			},
			{
				id: "app_stable",
				label: "Core UX stable",
				kind: "toggle",
				required: true,
			},
		],
		content: {
			status: "draft",
			intro:
				"Use evidence when you debug. Logs, screenshots, and Playwright beat guessing every time.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Fix blocker issues without falling into a rewrite spiral.",
				purpose:
					"This lesson protects momentum by separating blocker bugs from everything that can wait.",
			},
			actionCard: {
				jobNow:
					"Fix the blocker issues in the core UX. Use logs, screenshots, and Playwright where they help, then mark the local path stable.",
				timebox: "20 minutes",
				comeBackWith: "A stable core UX and a logged fix trail.",
			},
			coach: createPendingLessonCoach({
				title: "Debug the Core UX",
				resources: WORKSHEET_03_RESOURCES,
			}),
			workbench: {
				prompt:
					"Use evidence to debug and stop once the blockers are gone.",
				teachingPoints: [
					"Use logs first when the error already tells you what broke.",
					"Use screenshots when the UI looks wrong or the failure is visual.",
					"Use Playwright to reproduce the core path and catch the last rough edges.",
				],
				emptyState: "Log the blocker issues, then fix only the ones that block the core path.",
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
		shell: "split",
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
		coachMode: "docked",
		objectiveTitle: "BUILD 3.6 — Lock the Local Build",
		checklist: [
			"Confirm what works now",
			"Log what is intentionally unfinished",
			"Save the local handoff",
		],
		fieldShapeVersion: 2,
		helperText:
			"Ship is next. Capture the real local milestone before you change context.",
		winCondition: "The local build handoff is saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: [
			"agent_build_brief",
			"working_local_environment",
			"core_flow_working_locally",
			"blocker_log",
		],
		workbenchFields: [
			{
				id: "working_now",
				label: "What is working now?",
				kind: "textarea",
				required: true,
				rows: 4,
			},
			{
				id: "not_built_yet",
				label: "What is intentionally unfinished?",
				kind: "textarea",
				required: true,
				rows: 4,
			},
			{
				id: "local_url_or_repo",
				label: "Local URL or repo reference",
				kind: "text",
				required: true,
			},
		],
		content: {
			status: "draft",
			intro:
				"Lock the local milestone before you move into Ship. The handoff should be honest, clear, and small enough to act on.",
			lessonMeta: {
				runtimeLabel: "4-6 min",
				goal: "Capture the stable local build and what still needs to wait.",
				purpose:
					"This is the handoff from local implementation into deployment, sending, and feedback.",
			},
			actionCard: {
				jobNow:
					"Write down what works now, what is intentionally unfinished, and where the current local build lives.",
				timebox: "10 minutes",
				comeBackWith: "A clean local build handoff into Ship.",
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
				emptyState:
					"Capture the local milestone before you move into Ship.",
			},
		},
	},
] satisfies LessonConfig[];
