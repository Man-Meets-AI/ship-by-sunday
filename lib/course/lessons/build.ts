import { createPendingLessonCoach } from "../content-helpers";
import {
	focusPanelDefaults,
	splitPanelDefaults,
	type LessonConfig,
	type LessonExampleContent,
	type LessonResourceContent,
} from "../contracts";
import { WORKSHEET_03_RESOURCES } from "../resources";

const BUILD_GUIDE_IMAGE_BASE = "/course/build-guide-images";

const BUILD_TOOLING_RESOURCES: LessonResourceContent[] = [
	{
		id: "build-figma-mcp-guide",
		label: "Figma MCP setup guide",
		href: "https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server",
		kind: "external",
	},
	{
		id: "build-playwright-guide",
		label: "Playwright MCP docs",
		href: "https://playwright.dev/",
		kind: "external",
	},
];

const BUILD_PROVIDER_RESOURCES: LessonResourceContent[] = [
	{
		id: "build-convex-clerk-auth",
		label: "Convex + Clerk auth setup",
		href: "https://docs.convex.dev/auth/clerk",
		kind: "external",
	},
	{
		id: "build-clerk-convex-integration",
		label: "Clerk integration docs",
		href: "https://clerk.com/docs/integration/convex",
		kind: "external",
	},
	{
		id: "build-stripe-llm",
		label: "Stripe AI integration guide",
		href: "https://docs.stripe.com/building-with-llms",
		kind: "external",
	},
];

const BUILD_TROUBLESHOOTING_RESOURCES: LessonResourceContent[] = [
	{
		id: "build-auth-debug",
		label: "Convex auth debug guide",
		href: "https://docs.convex.dev/auth/debug",
		kind: "external",
	},
];

function withBuildWorksheetResources(
	extraResources: LessonResourceContent[] = [],
) {
	return [...WORKSHEET_03_RESOURCES, ...extraResources];
}

function buildCoach(
	title: string,
	examples: LessonExampleContent[],
	extraResources: LessonResourceContent[] = [],
) {
	return createPendingLessonCoach({
		title,
		examples,
		resources: withBuildWorksheetResources(extraResources),
	});
}

function guideImage(fileName: string) {
	return `${BUILD_GUIDE_IMAGE_BASE}/${fileName}`;
}

export const buildLessons = [
	{
		id: "3.1",
		slug: "03-01-lock-build-path-and-scope",
		order: 15,
		block: "BUILD",
		title: "Lock Build Path and Scope",
		shortTitle: "Scope",
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
		objectiveTitle: "BUILD 3.1 — Lock Build Path and Scope",
		checklist: [
			"Choose your starting path",
			"Name the first slice",
			"Define done for the first slice",
		],
		fieldShapeVersion: 3,
		helperText:
			"Lock one path, one slice, and one clear done condition before coding.",
		winCondition: "The build path, first slice, and done condition are locked.",
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
					"One screen or one workflow only. Keep it small enough to ship and verify quickly.",
				placeholder:
					"Example: User can create an account and reach the Mission page.",
			},
			{
				id: "definition_of_done",
				label: "Definition of done",
				kind: "textarea",
				required: true,
				rows: 4,
				helpText:
					"Describe the visible user outcome that proves this slice is complete.",
				placeholder:
					"Example: New user signs up, lands on Mission, and sees Day 1 checklist without errors.",
			},
		],
		content: {
			status: "draft",
			intro:
				"Lock your build path and first shippable slice. Make three decisions, then generate a build-ready prompt.",
			lessonMeta: {
				runtimeLabel: "7-9 min",
				goal: "Create one controlled implementation brief.",
				purpose:
					"Prevent scope drift and force a concrete first move in Build.",
			},
			actionCard: {
				jobNow:
					"Choose a path, name one narrow slice, and define done before generating your build prompt.",
				timebox: "10 minutes",
				comeBackWith: "A generated Build Prompt + Starting Path artifact.",
			},
			coach: buildCoach(
				"Lock Build Path and Scope",
				[
					{
						id: "scope-path-visual",
						title: "Path and scope framing",
						body: "Lock the path first, then lock one slice and one done condition.",
						imageSrc: guideImage("image1.png"),
						imageAlt: "Prompt and setup snippet from the Build guide",
						imageCaption: "Use one controlled prompt, not a wide open request.",
					},
					{
						id: "build-loop-framing",
						title: "Build loop overview",
						body: "The loop works when scope is narrow and decisions are explicit.",
						imageSrc: guideImage("image20.png"),
						imageAlt: "Build process screenshot with setup context",
						imageCaption:
							"You are preparing execution constraints before implementation starts.",
					},
				],
				BUILD_TOOLING_RESOURCES,
			),
			workbench: {
				prompt:
					"Choose your path, lock one slice, define done, then generate your build brief.",
				teachingPoints: [
					"Choose template vs custom path before touching implementation details.",
					"Treat your first slice like a checkpoint, not a prototype of the whole app.",
					"Leave cleanup and expansion for later lessons.",
				],
				emptyState:
					"Choose a path and define your first slice to generate your build kickoff prompt.",
			},
		},
	},
	{
		id: "3.2",
		slug: "03-02-map-the-repo-and-starter",
		order: 16,
		block: "BUILD",
		title: "Map the Repo and Starter",
		shortTitle: "Repo",
		shell: "focus",
		availableLayoutModes: ["focus"],
		workbench: "external_workspace",
		artifact: {
			key: "repo_orientation_ready",
			label: "Repo Orientation Notes",
			type: "checklist",
			required: true,
			dependsOn: ["agent_build_brief"],
		},
		nextLessonId: "3.3",
		prevLessonId: "3.1",
		unlocks: { lessons: ["3.3"] },
		coachMode: "pip",
		coachVideoPlacement: "workbench",
		externalTool: "code",
		objectiveTitle: "BUILD 3.2 — Map the Repo and Starter",
		checklist: [
			"Review the walkthrough, then open the repo locally.",
			"Confirm package manager and startup command.",
			"Map env files and the first route/screen for your slice.",
		],
		fieldShapeVersion: 3,
		requireReadyVideoForCompletion: true,
		helperText:
			"Watch first, then capture enough repo evidence that the next Build steps stay grounded in real files.",
		winCondition:
			"Repo orientation is captured with startup command, env locations, and first slice entrypoint.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["agent_build_brief"],
		workbenchFields: [
			{
				id: "repo_orientation_checklist",
				label: "Repo orientation checklist",
				kind: "checklist",
				required: true,
				options: [
					"Opened the codebase and confirmed the package manager.",
					"Confirmed the local startup command runs the app.",
					"Located env files and the first route/screen for my slice.",
				],
				taskLabel: "Complete the repo orientation checklist",
			},
			{
				id: "startup_command",
				label: "Startup command",
				kind: "text",
				required: true,
				placeholder: "pnpm run dev:web",
				helpText:
					"Save the exact command you will use to boot local development.",
				taskLabel: "Save the startup command",
			},
			{
				id: "repo_map_notes",
				label: "Env files + first slice entrypoint",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder:
					".env.local for keys, app/lesson/[lessonId]/page.tsx for lesson route entry...",
				helpText:
					"List the key env file paths and where your first implementation slice should land.",
				taskLabel: "Save env and entrypoint notes",
			},
		],
		content: {
			status: "draft",
			intro:
				"Before wiring providers, map the repo and capture the key paths. This keeps every next prompt anchored in the real codebase.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Understand the minimum repo layout needed for Build.",
				purpose:
					"Reduce random prompting by anchoring around real files and scripts.",
			},
			actionCard: {
				jobNow:
					"Watch the walkthrough, run the repo once, then capture startup command + env and entrypoint notes.",
				timebox: "8-10 minutes",
				comeBackWith:
					"A saved repo-orientation artifact with concrete file paths and commands.",
			},
			coach: buildCoach("Map the Repo and Starter", [
				{
					id: "repo-lay-of-land",
					title: "Lay of the land",
					body: "Know your package manager, startup command, and key folders before adding new complexity.",
					imageSrc: guideImage("image20.png"),
					imageAlt: "Repository setup screenshot",
					imageCaption: "Start with orientation, not implementation.",
				},
				{
					id: "important-files",
					title: "Important files first",
					body: "Focus on env files, app entry points, and package scripts.",
					imageSrc: guideImage("image15.png"),
					imageAlt: "Important setup panel from Build guide",
					imageCaption:
						"Most implementation blockers come from missing setup context.",
				},
			]),
			workbench: {
				prompt:
					"Map the few files that matter first, then move to tooling and integrations.",
				teachingPoints: [
					"Find the command that starts the local app successfully.",
					"Find the env files and where provider keys will go.",
					"Find the first route/screen where your slice will land.",
				],
				emptyState:
					"Use this lesson as your repo orientation pass before tool and provider setup.",
			},
		},
	},
	{
		id: "3.3",
		slug: "03-03-install-mcps-and-skills",
		order: 17,
		block: "BUILD",
		title: "Install MCPs and Skills",
		shortTitle: "Tools",
		shell: "focus",
		workbench: "guided_form",
		artifact: {
			key: "tooling_stack_ready",
			label: "Tooling Stack Ready",
			type: "checklist",
			required: true,
			dependsOn: ["repo_orientation_ready"],
		},
		nextLessonId: "3.4",
		prevLessonId: "3.2",
		unlocks: { lessons: ["3.4"] },
		coachMode: "pip",
		objectiveTitle: "BUILD 3.3 — Install MCPs and Skills",
		checklist: [
			"Install Figma MCP",
			"Install Playwright MCP",
			"Install provider skills for Convex, Clerk, and Stripe",
		],
		fieldShapeVersion: 3,
		helperText:
			"Set up the tooling stack before provider wiring so implementation and debugging stay fast.",
		winCondition: "The Build tooling stack is installed and confirmed.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["repo_orientation_ready"],
		workbenchFields: [
			{
				id: "figma_mcp_ready",
				label: "Figma MCP installed",
				kind: "toggle",
				required: true,
				taskLabel: "Confirm Figma MCP setup",
			},
			{
				id: "playwright_mcp_ready",
				label: "Playwright MCP installed",
				kind: "toggle",
				required: true,
				taskLabel: "Confirm Playwright MCP setup",
			},
			{
				id: "provider_skills_ready",
				label: "Convex, Clerk, and Stripe skills available",
				kind: "toggle",
				required: true,
				taskLabel: "Confirm provider skills",
			},
			{
				id: "tooling_notes",
				label: "Tooling notes",
				kind: "textarea",
				rows: 3,
				helpText:
					"Capture anything custom in your local setup so future prompts stay consistent.",
			},
		],
		content: {
			status: "draft",
			intro:
				"You are setting up the execution stack: design handoff, browser validation, and provider-specific guidance.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Install the tools used for implementation and QA loops.",
				purpose:
					"Build momentum comes from reliable tooling and provider context.",
			},
			actionCard: {
				jobNow:
					"Install MCPs, confirm provider skills, and capture any local setup caveats.",
				timebox: "15 minutes",
				comeBackWith: "Tooling stack confirmed and ready for provider wiring.",
			},
			coach: buildCoach(
				"Install MCPs and Skills",
				[
					{
						id: "tooling-figma-playwright",
						title: "Why these MCPs",
						body: "Figma MCP accelerates design translation. Playwright validates behavior without endless manual clicking.",
						imageSrc: guideImage("image8.png"),
						imageAlt: "MCP setup example from Build guide",
						imageCaption:
							"Set up design and browser tooling before deeper implementation.",
					},
					{
						id: "provider-skill-stack",
						title: "Provider skill stack",
						body: "Install provider-specific skill guidance so auth, billing, and database prompts stay precise.",
						imageSrc: guideImage("image22.png"),
						imageAlt: "Provider integration setup screenshot",
						imageCaption:
							"Provider-specific instructions prevent expensive misconfigurations.",
					},
				],
				[...BUILD_TOOLING_RESOURCES, ...BUILD_PROVIDER_RESOURCES],
			),
			workbench: {
				prompt:
					"Lock your tooling stack now so implementation and QA stay predictable.",
				teachingPoints: [
					"Treat tooling setup as part of Build, not optional prep.",
					"Use provider-specific guidance when wiring auth, payments, and DB.",
					"Capture setup notes once so future prompts stay consistent.",
				],
				emptyState:
					"Confirm MCP and provider-skill setup before wiring integrations.",
			},
		},
	},
	{
		id: "3.4",
		slug: "03-04-wire-db-auth-and-payments",
		order: 18,
		block: "BUILD",
		title: "Wire DB, Auth, and Payments",
		shortTitle: "Integrations",
		shell: "focus",
		workbench: "external_workspace",
		artifact: {
			key: "integration_setup_complete",
			label: "Integration Setup Complete",
			type: "brief",
			required: true,
			dependsOn: ["tooling_stack_ready"],
		},
		nextLessonId: "3.5",
		prevLessonId: "3.3",
		unlocks: { lessons: ["3.5"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.4 — Wire DB, Auth, and Payments",
		checklist: [
			"Set environment variables",
			"Wire Clerk + Convex JWT template",
			"Create product + price + webhook path",
			"Validate integration flow in local test mode",
		],
		fieldShapeVersion: 3,
		helperText:
			"Run setup in one sequence, then capture evidence so the integration stack is reproducible.",
		winCondition:
			"Database, authentication, and payment integrations are connected and verified in local test mode.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["tooling_stack_ready", "agent_build_brief"],
		workbenchFields: [
			{
				id: "integration_checkpoints",
				label: "Integration checkpoints",
				kind: "checklist",
				required: true,
				options: [
					"Set environment variables",
					"Wire Clerk + Convex JWT template",
					"Create product + price + webhook path",
					"Validate integration flow in local test mode",
				],
				taskLabel: "Complete integration checkpoints",
			},
			{
				id: "integration_verification_log",
				label: "Verification log",
				kind: "textarea",
				required: true,
				rows: 6,
				helpText:
					"Document concrete evidence for each checkpoint: endpoint paths, dashboard object IDs, commands run, and the local flow result.",
				placeholder:
					"- Env keys: ...\n- JWT template: ...\n- Stripe objects: ...\n- Webhook + local validation: ...",
				taskLabel: "Capture verification evidence",
			},
			{
				id: "integration_notes",
				label: "Follow-up notes (optional)",
				kind: "textarea",
				rows: 3,
				helpText:
					"Optional: capture anything you still need to clean up before the next Build lesson.",
			},
		],
		content: {
			status: "draft",
			intro:
				"This is the infrastructure pass: auth, database, and payments need to be wired before true product testing.",
			lessonMeta: {
				runtimeLabel: "12-16 min",
				goal: "Connect provider systems into one working local stack.",
				purpose:
					"Ship cannot happen without stable auth, data, and payment wiring.",
			},
			actionCard: {
				jobNow:
					"Complete provider wiring in sequence and log proof for each checkpoint before moving on.",
				timebox: "25 minutes",
				comeBackWith: "A connected local stack with verification notes.",
			},
			coach: buildCoach(
				"Wire DB, Auth, and Payments",
				[
					{
						id: "integration-sequence",
						title: "Integration sequence",
						body: "Run provider setup in a fixed sequence: env keys, auth template, Stripe objects, webhook wiring.",
						imageSrc: guideImage("image1.png"),
						imageAlt: "Integration setup prompt screenshot",
						imageCaption:
							"The sequence matters. Keep it consistent across retries.",
					},
					{
						id: "clerk-convex-template",
						title: "Clerk + Convex template detail",
						body: "The Clerk JWT template must remain named exactly `convex`, with issuer matching your Clerk frontend domain.",
						imageSrc: guideImage("image22.png"),
						imageAlt: "Clerk JWT template setup screenshot",
						imageCaption:
							"Template naming and issuer alignment are common failure points.",
					},
				],
				BUILD_PROVIDER_RESOURCES,
			),
			workbench: {
				prompt:
					"Treat provider wiring like a checklist, not an open-ended debug session.",
				teachingPoints: [
					"Do env and auth setup before Stripe webhook testing.",
					"Use exact provider settings to avoid hidden auth mismatches.",
					"Capture setup notes so you can reproduce the configuration quickly.",
				],
				emptyState:
					"Use the objective checklist while wiring provider integrations in your code workspace.",
			},
		},
	},
	{
		id: "3.5",
		slug: "03-05-switch-to-sandbox-and-boot-local",
		order: 19,
		block: "BUILD",
		title: "Switch to Sandbox and Boot Local",
		shortTitle: "Sandbox",
		shell: "watch",
		workbench: "external_workspace",
		artifact: {
			key: "working_local_environment",
			label: "Working Local Environment",
			type: "checklist",
			required: true,
			dependsOn: ["integration_setup_complete"],
		},
		nextLessonId: "3.6",
		prevLessonId: "3.4",
		unlocks: { lessons: ["3.6"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.5 — Switch to Sandbox and Boot Local",
		checklist: [
			"Move Stripe setup to sandbox mode",
			"Regenerate webhook secret in sandbox",
			"Boot local app and verify baseline path",
		],
		fieldShapeVersion: 3,
		helperText:
			"Move payment testing to sandbox before running local flow tests, then boot the app cleanly.",
		winCondition: "Sandbox mode is active and local baseline is running.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["integration_setup_complete"],
		workbenchFields: [],
		content: {
			status: "draft",
			intro:
				"Before implementation expands, lock safe testing mode and verify local runtime baseline.",
			lessonMeta: {
				runtimeLabel: "7-9 min",
				goal: "Avoid live-charge mistakes and confirm the local app runs cleanly.",
				purpose:
					"Keep all Build testing in safe payment mode with a stable local baseline.",
			},
			actionCard: {
				jobNow:
					"Switch to sandbox/test keys, refresh webhook credentials, and run the app locally.",
				timebox: "15 minutes",
				comeBackWith: "A safe and stable local test environment.",
			},
			coach: buildCoach("Switch to Sandbox and Boot Local", [
				{
					id: "sandbox-switch",
					title: "Sandbox switch",
					body: "Copy your setup into a sandbox context before testing checkout and entitlement flow.",
					imageSrc: guideImage("image14.png"),
					imageAlt: "Sandbox setup screenshot",
					imageCaption:
						"Never continue Build testing against live billing keys.",
				},
				{
					id: "sandbox-webhook-refresh",
					title: "Webhook refresh after sandbox switch",
					body: "Regenerate product/price and webhook values in sandbox so your local app uses test-mode events.",
					imageSrc: guideImage("image16.png"),
					imageAlt: "Webhook and payment setup screenshot",
					imageCaption:
						"Switching to sandbox requires a full webhook credential refresh.",
				},
				{
					id: "local-baseline-run",
					title: "Boot local baseline",
					body: "Confirm the app starts cleanly before opening the next implementation lesson.",
					imageSrc: guideImage("image21.png"),
					imageAlt: "Local app workflow screenshot",
					imageCaption:
						"Treat a clean local boot as a required Build checkpoint.",
				},
			]),
			workbench: {
				prompt:
					"Use sandbox keys and a clean local runtime before implementation expands.",
				teachingPoints: [
					"Sandbox mode is non-negotiable for payment testing.",
					"Regenerate webhook values after switching environments.",
					"Do not continue until local boot is stable.",
				],
				emptyState:
					"Complete sandbox switch and local boot before moving into AI plan execution.",
			},
		},
	},
	{
		id: "3.6",
		slug: "03-06-read-and-execute-ai-plans",
		order: 20,
		block: "BUILD",
		title: "Read and Execute AI Plans",
		shortTitle: "Plan",
		shell: "focus",
		workbench: "guided_form",
		artifact: {
			key: "execution_plan_review",
			label: "Execution Plan Review",
			type: "brief",
			required: true,
			dependsOn: ["working_local_environment"],
		},
		nextLessonId: "3.7",
		prevLessonId: "3.5",
		unlocks: { lessons: ["3.7"] },
		coachMode: "pip",
		objectiveTitle: "BUILD 3.6 — Read and Execute AI Plans",
		checklist: [
			"Extract the actual implementation target",
			"Define execution phases",
			"Document known risks and edge cases",
			"Set plan execution rules",
		],
		fieldShapeVersion: 3,
		helperText:
			"Do not blindly run giant plans. Distill them into an execution brief you can control.",
		winCondition: "The plan is translated into a practical execution brief.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["working_local_environment", "agent_build_brief"],
		workbenchFields: [
			{
				id: "plan_goal",
				label: "Execution goal",
				kind: "text",
				required: true,
				helpText:
					"State the one concrete result this plan should produce in the next implementation pass.",
			},
			{
				id: "plan_phases",
				label: "Execution phases",
				kind: "textarea",
				required: true,
				rows: 4,
				helpText: "List the implementation phases in practical order.",
			},
			{
				id: "plan_risks",
				label: "Known risks and edge cases",
				kind: "textarea",
				required: true,
				rows: 3,
			},
			{
				id: "plan_rules",
				label: "Execution rules",
				kind: "textarea",
				required: true,
				rows: 3,
				helpText:
					"Capture stop conditions and anti-sprawl rules for the next coding pass.",
			},
		],
		content: {
			status: "draft",
			intro:
				"Large AI plans are useful only if you can compress them into actionable execution decisions.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Translate a large plan into a practical implementation brief.",
				purpose:
					"Protect momentum by reducing giant plan output into controlled execution steps.",
			},
			actionCard: {
				jobNow:
					"Review the generated plan, extract the actionable path, and define execution rules before implementation.",
				timebox: "15 minutes",
				comeBackWith: "A compressed execution brief you can run safely.",
			},
			coach: buildCoach("Read and Execute AI Plans", [
				{
					id: "plan-output-example",
					title: "Plan output can be huge",
					body: "Your job is to compress it into concrete execution phases, not to execute every sentence.",
					imageSrc: guideImage("image3.png"),
					imageAlt: "Large plan output screenshot",
					imageCaption:
						"Distill large plan output into practical phases and checkpoints.",
				},
				{
					id: "plan-readback-example",
					title: "Read back, then decide",
					body: "Skim for intent, isolate critical changes, and run implementation in phases.",
					imageSrc: guideImage("image19.png"),
					imageAlt: "Plan review screenshot",
					imageCaption: "Translate plan text into execution checkpoints.",
				},
			]),
			workbench: {
				prompt:
					"Large plan output is raw material. Your execution brief is the real deliverable.",
				teachingPoints: [
					"Extract the concrete objective before touching implementation.",
					"Organize plan work into small, sequential phases.",
					"Define stop conditions to avoid accidental scope expansion.",
				],
				emptyState:
					"Convert plan output into a practical execution brief before the first slice pass.",
			},
		},
	},
	{
		id: "3.7",
		slug: "03-07-implement-the-first-slice",
		order: 21,
		block: "BUILD",
		title: "Implement the First Slice",
		shortTitle: "First Slice",
		shell: "focus",
		workbench: "external_workspace",
		artifact: {
			key: "first_implemented_slice",
			label: "First Slice Implemented",
			type: "mixed",
			required: true,
			dependsOn: ["execution_plan_review"],
		},
		nextLessonId: "3.8",
		prevLessonId: "3.6",
		unlocks: { lessons: ["3.8"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.7 — Implement the First Slice",
		checklist: [
			"Use the saved build prompt",
			"Implement one slice only",
			"Capture what shipped",
		],
		fieldShapeVersion: 3,
		helperText:
			"Implement one slice and stop at done condition. Do not expand scope in this lesson.",
		winCondition: "The first slice is shipped and documented.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: [
			"execution_plan_review",
			"agent_build_brief",
			"design_spec",
		],
		workbenchFields: [
			{
				id: "slice_status",
				label: "First slice implemented",
				kind: "toggle",
				required: true,
			},
			{
				id: "slice_notes",
				label: "What shipped in this slice?",
				kind: "textarea",
				required: true,
				rows: 4,
				helpText:
					"Summarize the route, interaction, or component that now works.",
			},
		],
		content: {
			status: "draft",
			intro:
				"This is the first visible implementation checkpoint. One slice shipped beats an unbounded Build session.",
			lessonMeta: {
				runtimeLabel: "9-12 min",
				goal: "Ship one concrete slice from the execution brief.",
				purpose:
					"Establish implementation momentum with a controlled first outcome.",
			},
			actionCard: {
				jobNow:
					"Implement one slice from your saved brief, then document exactly what shipped.",
				timebox: "20 minutes",
				comeBackWith: "A shipped first slice and implementation notes.",
			},
			coach: buildCoach("Implement the First Slice", [
				{
					id: "first-slice-implementation",
					title: "Screen-by-screen implementation",
					body: "Start from one screen or narrow flow and verify behavior before expanding.",
					imageSrc: guideImage("image21.png"),
					imageAlt: "Implementation workflow screenshot",
					imageCaption:
						"One implemented slice creates the baseline for the core UX pass.",
				},
				{
					id: "support-minimum-only",
					title: "Add minimum support only",
					body: "If you hit missing model support, add only what this slice needs and move on.",
					imageSrc: guideImage("image12.png"),
					imageAlt: "Core UX implementation screenshot",
					imageCaption:
						"Do not broaden architecture just because the agent suggests it.",
				},
			]),
			workbench: {
				prompt:
					"Ship one slice, document it, and stop before the work expands.",
				teachingPoints: [
					"Use your execution brief as the source of truth.",
					"Add minimum backend/model support only when blocked.",
					"Document what shipped before moving to core UX expansion.",
				],
				emptyState:
					"Implement one slice in code, then capture what shipped in the notes field.",
			},
		},
	},
	{
		id: "3.8",
		slug: "03-08-build-the-core-ux-end-to-end",
		order: 22,
		block: "BUILD",
		title: "Build the Core UX End-to-End",
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
		nextLessonId: "3.9",
		prevLessonId: "3.7",
		unlocks: { lessons: ["3.9"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.8 — Build the Core UX End-to-End",
		checklist: [
			"Expand from first slice to full core path",
			"Validate each step locally",
			"Defer polish and extras",
		],
		fieldShapeVersion: 3,
		helperText:
			"Keep extending the core path screen by screen until the end-to-end local flow works.",
		winCondition: "The core UX path works locally from start to finish.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["first_implemented_slice", "design_spec"],
		workbenchFields: [],
		content: {
			status: "draft",
			intro:
				"Now extend the first slice into a full core experience. Focus on usable flow, not visual perfection.",
			lessonMeta: {
				runtimeLabel: "12-16 min",
				goal: "Get the core path working locally end-to-end.",
				purpose:
					"Establish a real local product baseline before deep debugging.",
			},
			actionCard: {
				jobNow:
					"Build the core UX path screen by screen and verify each step locally.",
				timebox: "30-45 minutes",
				comeBackWith: "A local end-to-end core UX flow.",
			},
			coach: buildCoach("Build the Core UX End-to-End", [
				{
					id: "core-ux-build-pass",
					title: "Core UX pass",
					body: "Expand the first slice into the full user path while preserving flow clarity.",
					imageSrc: guideImage("image12.png"),
					imageAlt: "Core UX build screenshot",
					imageCaption:
						"Ship the full core path before adding polish and optional flows.",
				},
				{
					id: "pixel-perfect-warning",
					title: "Do not chase pixel-perfect yet",
					body: "The goal is functional clarity and speed. Polish can be staged after stability.",
					imageSrc: guideImage("image18.png"),
					imageAlt: "Workflow screenshot showing iterative build process",
					imageCaption: "Functioning flow now, refinement later.",
				},
			]),
			workbench: {
				prompt:
					"Build the full core path and verify behavior, then defer polish by design.",
				teachingPoints: [
					"Treat each screen as a mini pass with local validation.",
					"Keep the user journey coherent from start to finish.",
					"Capture polish ideas, but do not block completion on them.",
				],
				emptyState:
					"Use the watch pass as your blueprint for end-to-end core UX implementation.",
			},
		},
	},
	{
		id: "3.9",
		slug: "03-09-debug-and-stabilize-without-spiraling",
		order: 23,
		block: "BUILD",
		title: "Debug and Stabilize Without Spiraling",
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
		nextLessonId: "3.10",
		prevLessonId: "3.8",
		unlocks: { lessons: ["3.10"] },
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.9 — Debug and Stabilize Without Spiraling",
		checklist: [
			"Capture blockers with evidence",
			"Run plan -> implement -> browser-test loop",
			"Fix blockers only",
			"Stabilize core UX baseline",
		],
		fieldShapeVersion: 3,
		helperText:
			"Stabilize the core path with evidence-driven debugging, not exploratory rewrites.",
		winCondition:
			"Blockers are logged and the core UX is stable enough for Ship.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["core_flow_working_locally"],
		workbenchFields: [],
		content: {
			status: "draft",
			intro:
				"Debugging is now a control loop: capture evidence, run one fix cycle, retest, and move forward.",
			lessonMeta: {
				runtimeLabel: "10-14 min",
				goal: "Stabilize core UX without losing momentum.",
				purpose:
					"Protect delivery speed by separating blocker fixes from optional refactors.",
			},
			actionCard: {
				jobNow:
					"Run blocker-first debugging loops and log what was fixed vs deferred.",
				timebox: "25 minutes",
				comeBackWith: "A stable core UX and blocker log context for Ship.",
			},
			coach: buildCoach(
				"Debug and Stabilize Without Spiraling",
				[
					{
						id: "debug-evidence-loop",
						title: "Evidence-first debug loop",
						body: "Use logs and screenshots first, then ask for one fix pass and retest immediately.",
						imageSrc: guideImage("image10.png"),
						imageAlt: "Debugging screenshot with logs",
						imageCaption: "Evidence quality determines fix quality.",
					},
					{
						id: "feature-loop",
						title: "Feature loop",
						body: "Plan -> implement -> test in browser. Repeat only on blockers.",
						imageSrc: guideImage("image4.png"),
						imageAlt: "Feature loop diagram",
						imageCaption:
							"Keep one loop per blocker and avoid rewrite spirals.",
					},
					{
						id: "parallel-safe",
						title: "Parallel safely",
						body: "Parallel agents are fine only when file ownership is disjoint.",
						imageSrc: guideImage("image5.png"),
						imageAlt: "Parallel agent workflow screenshot",
						imageCaption:
							"Parallelize by file ownership, not by random task splitting.",
					},
					{
						id: "common-failure-handling",
						title: "Common failures",
						body: "If app state goes stale, restart services. If entitlements or login fail, re-check auth/payment wiring first.",
						imageSrc: guideImage("image17.png"),
						imageAlt: "Entitlement troubleshooting screenshot",
						imageCaption:
							"Fix blockers that break user flow before touching non-critical cleanup.",
					},
				],
				BUILD_TROUBLESHOOTING_RESOURCES,
			),
			workbench: {
				prompt:
					"Fix only what blocks the core path, and log everything needed for the final handoff.",
				teachingPoints: [
					"Create one blocker log entry per reproducible issue.",
					"Use evidence-first prompting to reduce random fix attempts.",
					"Schedule refactor/cleanup separately from blocker stabilization.",
				],
				emptyState:
					"Use this watch pass to stabilize the core UX and prepare a clean handoff into Ship.",
			},
		},
	},
	{
		id: "3.10",
		slug: "03-10-finalize-build-handoff-and-unlock-ship",
		order: 24,
		block: "BUILD",
		title: "Finalize Build Handoff and Unlock Ship",
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
				"core_flow_working_locally",
				"blocker_log",
			],
		},
		nextLessonId: "4.1",
		prevLessonId: "3.9",
		unlocks: { lessons: ["4.1"], blocks: ["SHIP"] },
		coachMode: "pip",
		objectiveTitle: "BUILD 3.10 — Finalize Build Handoff and Unlock Ship",
		checklist: [
			"Carry build plan forward",
			"Carry local baseline forward",
			"Carry stable core path forward",
			"Carry blocker context forward",
			"Unlock Ship",
		],
		fieldShapeVersion: 3,
		helperText:
			"Build block complete. Lock the factual handoff and move into Ship with clear constraints.",
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
				"You now have a working local baseline, a stable core path, and blocker context. Enter Ship from proof, not assumption.",
			nextStepLabel: "SHIP 4.1 — Ship the Core, Not the Fantasy",
			skills: [
				"Scope control",
				"Tooling setup",
				"Provider wiring",
				"Slice implementation",
				"Evidence-driven debugging",
			],
			artifactReadyCopy:
				"Ship now receives the real local baseline, working path, and blocker constraints.",
			readyStateCopy: "Build block complete. Lock the handoff and unlock Ship.",
			completionCtaLabel: "Unlock Ship",
			celebrationEyebrow: "Build block complete",
			celebrationTitle: "Ship unlocked",
		},
		content: {
			status: "draft",
			intro:
				"Use this wrap-up to capture what is true today: what works, what is stable, and what is intentionally deferred.",
			lessonMeta: {
				runtimeLabel: "4-6 min",
				goal: "Assemble a factual Build handoff for Ship.",
				purpose:
					"This handoff keeps Ship execution grounded in verified implementation state.",
			},
			actionCard: {
				jobNow:
					"Review the Build summary, verify each section is factual, then unlock Ship.",
				timebox: "3 minutes",
				comeBackWith: "A clean and factual handoff into Ship.",
			},
			coach: buildCoach("Finalize Build Handoff and Unlock Ship", [
				{
					id: "handoff-summary-example",
					title: "Handoff quality",
					body: "Document what actually works now, what is stable, and what is intentionally deferred.",
					imageSrc: guideImage("image3.png"),
					imageAlt: "Build handoff planning screenshot",
					imageCaption: "Ship quality depends on handoff quality.",
				},
				{
					id: "handoff-constraints-example",
					title: "Constraint clarity",
					body: "Make unresolved constraints explicit so Ship scope stays focused.",
					imageSrc: guideImage("image19.png"),
					imageAlt: "Plan summary screenshot",
					imageCaption:
						"Clear constraints prevent Ship from re-entering Build chaos.",
				},
			]),
			workbench: {
				prompt: "Assemble a factual Build summary so Ship starts with clarity.",
				teachingPoints: [
					"Carry verified outcomes, not aspirational scope.",
					"List unresolved constraints explicitly.",
					"Unlock Ship only when the core path is stable enough to deploy and test.",
				],
				emptyState:
					"Assemble your Build handoff and unlock Ship from this summary.",
			},
		},
	},
] satisfies LessonConfig[];
