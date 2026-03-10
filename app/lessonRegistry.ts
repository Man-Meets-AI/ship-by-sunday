export type BlockId = "CEO" | "DESIGN" | "BUILD" | "SHIP";

export type ShellType = "split" | "focus" | "mission";

export type WorkbenchType =
	| "guided_form"
	| "score_table"
	| "collector_board"
	| "capture_upload"
	| "scope_split"
	| "brief_assembler"
	| "console_checklist"
	| "tracker_log"
	| "external_workspace";

export type CoachMode = "docked" | "pip";

export type ExternalTool = "figma" | "code" | "deploy" | "recording";

export type UploadFieldValue = {
	kind: "upload";
	status: "empty" | "selected" | "stored";
	fileName?: string;
	mimeType?: string;
	size?: number;
	url?: string;
};

export type CoachVideoContent = {
	status: "pending" | "ready";
	title?: string;
	url?: string;
	posterUrl?: string;
	durationLabel?: string;
};

export type CoachTranscriptContent = {
	status: "empty" | "ready";
	body?: string;
};

export type CoachExampleContent = {
	id: string;
	title: string;
	body: string;
	artifactKeys?: string[];
};

export type CoachResourceContent = {
	id: string;
	label: string;
	href: string;
	kind: "download" | "external" | "internal";
};

export type LessonCoachContent = {
	video?: CoachVideoContent;
	transcript?: CoachTranscriptContent;
	examples?: CoachExampleContent[];
	resources?: CoachResourceContent[];
};

export type PanelDefaultState = {
	objective: "open" | "collapsed";
	coach: "docked" | "minimized" | "pip";
	transcript: "open" | "collapsed";
	examples: "open" | "collapsed";
	resources: "open" | "collapsed";
};

export type ArtifactType =
	| "text"
	| "table"
	| "board"
	| "image"
	| "images"
	| "video"
	| "checklist"
	| "brief"
	| "link"
	| "mixed";

export type ArtifactContract = {
	key: string;
	label: string;
	type: ArtifactType;
	required: boolean;
	sourceLessonId?: string;
	dependsOn?: string[];
};

export type WorkbenchField = {
	id: string;
	label: string;
	kind:
	| "text"
	| "textarea"
	| "url"
	| "number"
	| "toggle"
	| "select"
	| "image_upload"
	| "video_upload"
	| "table"
	| "board"
	| "checklist"
	| "readonly";
	required?: boolean;
	placeholder?: string;
	helpText?: string;
	options?: string[];
	rows?: number;
	linkedArtifactKey?: string;
};

export type LessonConfig = {
	id: string;
	order: number;
	block: BlockId;
	title: string;
	shortTitle: string;
	shell: ShellType;
	workbench: WorkbenchType;
	artifact: ArtifactContract;
	nextLessonId?: string;
	prevLessonId?: string;
	unlocks?: string[];
	coachMode: CoachMode;
	externalTool?: ExternalTool;
	objectiveTitle: string;
	checklist: string[];
	helperText?: string;
	winCondition: string;
	panelDefaults: PanelDefaultState;
	pinnedArtifacts?: string[];
	workbenchFields?: WorkbenchField[];
	coachContent?: LessonCoachContent;
	notes?: string[];
};

export type BlockConfig = {
	id: BlockId;
	label: string;
	order: number;
	startsLocked: boolean;
};

export const blocks: BlockConfig[] = [
	{ id: "CEO", label: "CEO", order: 1, startsLocked: false },
	{ id: "DESIGN", label: "DESIGN", order: 2, startsLocked: true },
	{ id: "BUILD", label: "BUILD", order: 3, startsLocked: true },
	{ id: "SHIP", label: "SHIP", order: 4, startsLocked: true },
];

export const splitPanelDefaults: PanelDefaultState = {
	objective: "open",
	coach: "docked",
	transcript: "collapsed",
	examples: "collapsed",
	resources: "collapsed",
};

export const focusPanelDefaults: PanelDefaultState = {
	objective: "collapsed",
	coach: "pip",
	transcript: "collapsed",
	examples: "collapsed",
	resources: "collapsed",
};

export const missionPanelDefaults: PanelDefaultState = {
	objective: "collapsed",
	coach: "minimized",
	transcript: "collapsed",
	examples: "collapsed",
	resources: "collapsed",
};

export const lessonRegistry: LessonConfig[] = [
	{
		id: "0.0",
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
		unlocks: ["1.1"],
		coachMode: "docked",
		objectiveTitle: "Mission Overview",
		checklist: [
			"Understand the 4-block sprint",
			"See the lesson path",
			"Start the CEO block",
		],
		helperText: "This is navigation and orientation, not a graded lesson.",
		winCondition: "User understands the path and launches the first CEO lesson.",
		panelDefaults: missionPanelDefaults,
		notes: [
			"Use this as the home / dashboard screen.",
			"Do not treat builder roles as the primary progression model.",
		],
	},
	{
		id: "1.1",
		order: 1,
		block: "CEO",
		title: "Start With the Problem",
		shortTitle: "Problem",
		shell: "split",
		workbench: "guided_form",
		artifact: {
			key: "candidate_problems",
			label: "3 Candidate Problems",
			type: "text",
			required: true,
		},
		nextLessonId: "1.2",
		prevLessonId: "0.0",
		unlocks: ["1.2"],
		coachMode: "docked",
		objectiveTitle: "CEO 1.1 — Start With the Problem",
		checklist: [
			"Write 3 real problems",
			"Name who has each problem",
			"Keep them grounded in life or work",
		],
		helperText: "Do not rank them here. Generate candidates first.",
		winCondition: "Three candidate problems are saved.",
		panelDefaults: splitPanelDefaults,
		workbenchFields: [
			{
				id: "problem_1",
				label: "Problem 1",
				kind: "textarea",
				required: true,
				rows: 3,
			},
			{
				id: "problem_2",
				label: "Problem 2",
				kind: "textarea",
				required: true,
				rows: 3,
			},
			{
				id: "problem_3",
				label: "Problem 3",
				kind: "textarea",
				required: true,
				rows: 3,
			},
		],
	},
	{
		id: "1.2",
		order: 2,
		block: "CEO",
		title: "Pick One User",
		shortTitle: "User",
		shell: "split",
		workbench: "guided_form",
		artifact: {
			key: "user_statement",
			label: "User Statement",
			type: "text",
			required: true,
			dependsOn: ["candidate_problems"],
		},
		nextLessonId: "1.3",
		prevLessonId: "1.1",
		unlocks: ["1.3"],
		coachMode: "docked",
		objectiveTitle: "CEO 1.2 — Pick One User",
		checklist: [
			"Carry forward one chosen problem",
			"Name one specific user",
			"Describe when the problem hits",
			"Confirm you can reach them this week",
		],
		helperText: "Specific beats broad. Reachable beats aspirational.",
		winCondition: "One clear user statement is saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["candidate_problems"],
		workbenchFields: [
			{
				id: "chosen_problem",
				label: "Chosen Problem",
				kind: "readonly",
				linkedArtifactKey: "candidate_problems",
			},
			{
				id: "user_type",
				label: "This app is for...",
				kind: "text",
				required: true,
				placeholder: "A narrow, specific user",
			},
			{
				id: "pain_moment",
				label: "When this problem hits...",
				kind: "textarea",
				required: true,
				rows: 3,
			},
			{
				id: "current_solution",
				label: "How they solve it today",
				kind: "textarea",
				required: true,
				rows: 3,
			},
			{
				id: "reachability",
				label: "Why I can reach them this week",
				kind: "textarea",
				required: true,
				rows: 2,
			},
		],
	},
	{
		id: "1.3",
		order: 3,
		block: "CEO",
		title: "Define the Outcome",
		shortTitle: "Outcome",
		shell: "split",
		workbench: "guided_form",
		artifact: {
			key: "outcome_statement",
			label: "Outcome Statement",
			type: "text",
			required: true,
			dependsOn: ["user_statement"],
		},
		nextLessonId: "1.4",
		prevLessonId: "1.2",
		unlocks: ["1.4"],
		coachMode: "docked",
		objectiveTitle: "CEO 1.3 — Define the Outcome",
		checklist: [
			"Use the chosen user",
			"Write one clear user-facing outcome",
			"Keep it observable",
		],
		helperText: "Describe what gets better for the user, not what the app contains.",
		winCondition: "One clear outcome statement is saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["candidate_problems", "user_statement"],
		workbenchFields: [
			{
				id: "outcome",
				label: "One clear user-facing outcome statement",
				kind: "text",
				required: true,
			},
			{
				id: "success_looks_like",
				label: "Success looks like...",
				kind: "textarea",
				required: true,
				rows: 3,
			},
			{
				id: "difference_for_user",
				label: "What will be different for the user?",
				kind: "textarea",
				required: true,
				rows: 3,
			},
		],
	},
	{
		id: "1.4",
		order: 4,
		block: "CEO",
		title: "Light Research, Not a Thesis",
		shortTitle: "Research",
		shell: "split",
		workbench: "score_table",
		artifact: {
			key: "research_notes",
			label: "Research Notes",
			type: "table",
			required: true,
			dependsOn: ["outcome_statement"],
		},
		nextLessonId: "1.5",
		prevLessonId: "1.3",
		unlocks: ["1.5"],
		coachMode: "docked",
		objectiveTitle: "CEO 1.4 — Light Research, Not a Thesis",
		checklist: [
			"Add 2–3 competitors or references",
			"Note what they do well",
			"Note what they do poorly",
			"Capture what users seem to care about",
		],
		helperText: "Collect signal fast. Do not turn this into a thesis project.",
		winCondition: "2–3 research entries and one summary insight are saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["candidate_problems", "user_statement", "outcome_statement"],
		workbenchFields: [
			{
				id: "research_table",
				label: "Research Table",
				kind: "table",
				required: true,
				helpText: "Columns: Competitor, Good, Poor, Users Care About",
			},
			{
				id: "research_summary",
				label: "Key pattern I noticed",
				kind: "textarea",
				required: true,
				rows: 3,
			},
		],
	},
	{
		id: "1.5",
		order: 5,
		block: "CEO",
		title: "Map the Core Flow",
		shortTitle: "Flow",
		shell: "split",
		workbench: "capture_upload",
		artifact: {
			key: "core_flow_image",
			label: "Core Flow Image",
			type: "image",
			required: true,
			dependsOn: ["user_statement", "outcome_statement"],
		},
		nextLessonId: "1.6",
		prevLessonId: "1.4",
		unlocks: ["1.6"],
		coachMode: "docked",
		objectiveTitle: "CEO 1.5 — Map the Core Flow",
		checklist: [
			"Draw the flow on paper or tablet",
			"Keep it to 5–7 steps",
			"Upload one clean image",
		],
		helperText: "Do not build a custom flow editor. Use template + upload.",
		winCondition: "A usable core-flow image is uploaded and saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["user_statement", "outcome_statement", "research_notes"],
		workbenchFields: [
			{
				id: "template_preview",
				label: "Template Preview",
				kind: "readonly",
			},
			{
				id: "flow_upload",
				label: "Upload Core Flow Image",
				kind: "image_upload",
				required: true,
			},
		],
	},
	{
		id: "1.6",
		order: 6,
		block: "CEO",
		title: "Scope Hammer",
		shortTitle: "Scope",
		shell: "split",
		workbench: "scope_split",
		artifact: {
			key: "scope_boundary",
			label: "Scope Boundary",
			type: "mixed",
			required: true,
			dependsOn: ["core_flow_image"],
		},
		nextLessonId: "1.7",
		prevLessonId: "1.5",
		unlocks: ["1.7"],
		coachMode: "docked",
		objectiveTitle: "CEO 1.6 — Scope Hammer",
		checklist: [
			"Define what stays in v1",
			"Define what is explicitly out of scope",
			"Write why this is enough for v1",
		],
		helperText: "Cut fantasy. Keep the smallest believable version.",
		winCondition: "In-scope list, out-of-scope list, and v1 rationale are saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["core_flow_image"],
		workbenchFields: [
			{
				id: "in_scope",
				label: "In Scope Features",
				kind: "board",
				required: true,
			},
			{
				id: "out_of_scope",
				label: "Out of Scope Features",
				kind: "board",
				required: true,
			},
			{
				id: "v1_rationale",
				label: "Why this is enough for v1",
				kind: "textarea",
				required: true,
				rows: 3,
			},
		],
	},
	{
		id: "1.7",
		order: 7,
		block: "CEO",
		title: "CEO Wrap-Up",
		shortTitle: "Brief",
		shell: "split",
		workbench: "brief_assembler",
		artifact: {
			key: "product_brief",
			label: "Product Brief",
			type: "brief",
			required: true,
			dependsOn: [
				"candidate_problems",
				"user_statement",
				"outcome_statement",
				"research_notes",
				"core_flow_image",
				"scope_boundary",
			],
		},
		nextLessonId: "2.1",
		prevLessonId: "1.6",
		unlocks: ["2.1", "DESIGN_BLOCK"],
		coachMode: "docked",
		objectiveTitle: "CEO 1.7 — CEO Wrap-Up",
		checklist: [
			"Review all CEO outputs",
			"Confirm the product brief",
			"Lock the artifact",
		],
		helperText: "This is the handoff artifact into Design.",
		winCondition: "The product brief is assembled and locked.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: [
			"candidate_problems",
			"user_statement",
			"outcome_statement",
			"research_notes",
			"core_flow_image",
			"scope_boundary",
		],
	},
	{
		id: "2.1",
		order: 8,
		block: "DESIGN",
		title: "Find References First",
		shortTitle: "References",
		shell: "split",
		workbench: "collector_board",
		artifact: {
			key: "reference_board",
			label: "Reference Board",
			type: "board",
			required: true,
			dependsOn: ["product_brief"],
		},
		nextLessonId: "2.2",
		prevLessonId: "1.7",
		unlocks: ["2.2"],
		coachMode: "docked",
		objectiveTitle: "DESIGN 2.1 — Find References First",
		checklist: [
			"Add 5–10 references",
			"Save what you like",
			"Tag patterns you want to reuse",
		],
		helperText: "Collect references before you open Figma for real design work.",
		winCondition: "A usable reference board is saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["product_brief"],
		workbenchFields: [
			{
				id: "reference_input",
				label: "Paste a link or add an image",
				kind: "url",
			},
			{
				id: "reference_board",
				label: "Reference Board",
				kind: "board",
				required: true,
			},
			{
				id: "reference_patterns",
				label: "What patterns keep repeating?",
				kind: "textarea",
				required: true,
				rows: 3,
			},
		],
	},
	{
		id: "2.2",
		order: 9,
		block: "DESIGN",
		title: "Sketch Before Software",
		shortTitle: "Sketch",
		shell: "split",
		workbench: "capture_upload",
		artifact: {
			key: "sketch_set",
			label: "Sketch Set",
			type: "images",
			required: true,
			dependsOn: ["reference_board"],
		},
		nextLessonId: "2.3",
		prevLessonId: "2.1",
		unlocks: ["2.3"],
		coachMode: "docked",
		objectiveTitle: "DESIGN 2.2 — Sketch Before Software",
		checklist: [
			"Draw 3–5 rough screens",
			"Keep them ugly",
			"Upload the sketches",
		],
		helperText: "Use upload, not an in-app sketch editor.",
		winCondition: "A sketch set is uploaded.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["product_brief", "reference_board"],
		workbenchFields: [
			{
				id: "sketch_upload",
				label: "Upload Sketches",
				kind: "image_upload",
				required: true,
			},
		],
	},
	{
		id: "2.3",
		order: 10,
		block: "DESIGN",
		title: "Storyboard the Journey",
		shortTitle: "Storyboard",
		shell: "split",
		workbench: "capture_upload",
		artifact: {
			key: "storyboard_image",
			label: "Storyboard Image",
			type: "image",
			required: true,
			dependsOn: ["sketch_set"],
		},
		nextLessonId: "2.4",
		prevLessonId: "2.2",
		unlocks: ["2.4"],
		coachMode: "docked",
		objectiveTitle: "DESIGN 2.3 — Storyboard the Journey",
		checklist: [
			"Draw 5–7 frames",
			"Show the user moving through the experience",
			"Upload one clean storyboard",
		],
		helperText: "This should capture the journey, not polish.",
		winCondition: "A storyboard image is uploaded.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["sketch_set"],
		workbenchFields: [
			{
				id: "storyboard_upload",
				label: "Upload Storyboard",
				kind: "image_upload",
				required: true,
			},
		],
	},
	{
		id: "2.4",
		order: 11,
		block: "DESIGN",
		title: "Figma Basics for Speed",
		shortTitle: "Figma",
		shell: "focus",
		workbench: "external_workspace",
		artifact: {
			key: "figma_file_ready",
			label: "Figma File Ready",
			type: "link",
			required: true,
			dependsOn: ["storyboard_image"],
		},
		nextLessonId: "2.5",
		prevLessonId: "2.3",
		unlocks: ["2.5"],
		coachMode: "pip",
		externalTool: "figma",
		objectiveTitle: "DESIGN 2.4 — Figma Basics for Speed",
		checklist: [
			"Open the file",
			"Learn the minimum controls",
			"Confirm the file is ready",
		],
		helperText: "Use focus mode. The real work is in Figma.",
		winCondition: "User launches and confirms the Figma workspace.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["reference_board", "sketch_set", "storyboard_image"],
		workbenchFields: [
			{
				id: "figma_url",
				label: "Figma File URL",
				kind: "url",
				required: true,
			},
		],
	},
	{
		id: "2.5",
		order: 12,
		block: "DESIGN",
		title: "Turn Sketches Into Rough Screens",
		shortTitle: "Rough Screens",
		shell: "focus",
		workbench: "external_workspace",
		artifact: {
			key: "rough_screens",
			label: "3–5 Rough Screens",
			type: "mixed",
			required: true,
			dependsOn: ["figma_file_ready"],
		},
		nextLessonId: "2.6",
		prevLessonId: "2.4",
		unlocks: ["2.6"],
		coachMode: "pip",
		externalTool: "figma",
		objectiveTitle: "DESIGN 2.5 — Turn Sketches Into Rough Screens",
		checklist: [
			"Build 3–5 rough screens",
			"Use sketches as the source",
			"Mark rough screens ready",
		],
		helperText: "The product hosts the lesson. Figma is the actual workbench.",
		winCondition: "The user marks rough screens complete and saves the Figma state.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["sketch_set", "storyboard_image", "figma_file_ready"],
		workbenchFields: [
			{
				id: "rough_screen_status",
				label: "Rough screens ready",
				kind: "toggle",
				required: true,
			},
			{
				id: "rough_screen_notes",
				label: "What is in the rough screens?",
				kind: "textarea",
				rows: 3,
			},
		],
	},
	{
		id: "2.6",
		order: 13,
		block: "DESIGN",
		title: "Choose a Visual Direction",
		shortTitle: "Direction",
		shell: "split",
		workbench: "guided_form",
		artifact: {
			key: "visual_direction",
			label: "Visual Direction",
			type: "text",
			required: true,
			dependsOn: ["rough_screens"],
		},
		nextLessonId: "2.7",
		prevLessonId: "2.5",
		unlocks: ["2.7"],
		coachMode: "docked",
		objectiveTitle: "DESIGN 2.6 — Choose a Visual Direction",
		checklist: [
			"Pick a direction",
			"Write 3 style rules",
			"Name what to avoid",
		],
		helperText: "Make the visual rules explicit before Build starts.",
		winCondition: "Three style rules and one avoid-rule are saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["reference_board", "rough_screens"],
		workbenchFields: [
			{
				id: "style_rule_1",
				label: "Style Rule 1",
				kind: "text",
				required: true,
			},
			{
				id: "style_rule_2",
				label: "Style Rule 2",
				kind: "text",
				required: true,
			},
			{
				id: "style_rule_3",
				label: "Style Rule 3",
				kind: "text",
				required: true,
			},
			{
				id: "avoid_rule",
				label: "Avoid...",
				kind: "text",
				required: true,
			},
		],
	},
	{
		id: "2.7",
		order: 14,
		block: "DESIGN",
		title: "Design Wrap-Up",
		shortTitle: "Spec",
		shell: "split",
		workbench: "brief_assembler",
		artifact: {
			key: "design_spec",
			label: "Design Spec",
			type: "brief",
			required: true,
			dependsOn: [
				"reference_board",
				"sketch_set",
				"storyboard_image",
				"figma_file_ready",
				"rough_screens",
				"visual_direction",
			],
		},
		nextLessonId: "3.1",
		prevLessonId: "2.6",
		unlocks: ["3.1", "BUILD_BLOCK"],
		coachMode: "docked",
		objectiveTitle: "DESIGN 2.7 — Design Wrap-Up",
		checklist: [
			"Review references",
			"Review sketches",
			"Review storyboard",
			"Review visual direction",
			"Lock the design spec",
		],
		helperText: "This is the handoff artifact into Build.",
		winCondition: "The design spec is assembled and locked.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: [
			"reference_board",
			"sketch_set",
			"storyboard_image",
			"rough_screens",
			"visual_direction",
		],
	},
	{
		id: "3.1",
		order: 15,
		block: "BUILD",
		title: "Build From the Brief",
		shortTitle: "Build Brief",
		shell: "split",
		workbench: "brief_assembler",
		artifact: {
			key: "agent_build_brief",
			label: "Agent Build Brief",
			type: "brief",
			required: true,
			dependsOn: ["product_brief", "design_spec"],
		},
		nextLessonId: "3.2",
		prevLessonId: "2.7",
		unlocks: ["3.2"],
		coachMode: "docked",
		objectiveTitle: "BUILD 3.1 — Build From the Brief",
		checklist: [
			"Pull in the product brief",
			"Pull in the design spec",
			"Define the first slice",
			"Confirm definition of done",
		],
		helperText: "Turn the product and design work into one build-ready brief.",
		winCondition: "The agent build brief is saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["product_brief", "design_spec"],
		workbenchFields: [
			{
				id: "first_slice",
				label: "First screen or slice to build",
				kind: "text",
				required: true,
			},
			{
				id: "definition_of_done",
				label: "Definition of done",
				kind: "textarea",
				required: true,
				rows: 4,
			},
		],
	},
	{
		id: "3.2",
		order: 16,
		block: "BUILD",
		title: "Set Up the Environment",
		shortTitle: "Environment",
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
		unlocks: ["3.3"],
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.2 — Set Up the Environment",
		checklist: [
			"Open the starter or repo",
			"Install dependencies",
			"Run the app locally",
			"Capture confirmation",
		],
		helperText: "Use focus mode. The actual work happens in the editor and terminal.",
		winCondition: "The local environment is running and confirmed.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["agent_build_brief"],
		workbenchFields: [
			{
				id: "environment_ready",
				label: "Environment ready",
				kind: "checklist",
				required: true,
			},
			{
				id: "environment_notes",
				label: "Environment notes",
				kind: "textarea",
				rows: 3,
			},
		],
	},
	{
		id: "3.3",
		order: 17,
		block: "BUILD",
		title: "Brief the Agent Correctly",
		shortTitle: "Agent",
		shell: "focus",
		workbench: "external_workspace",
		artifact: {
			key: "first_implemented_slice",
			label: "First Implemented Slice",
			type: "mixed",
			required: true,
			dependsOn: ["working_local_environment"],
		},
		nextLessonId: "3.4",
		prevLessonId: "3.2",
		unlocks: ["3.4"],
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.3 — Brief the Agent Correctly",
		checklist: [
			"Use the build brief",
			"Implement the first slice",
			"Capture the result",
		],
		helperText: "Keep the prompt brief and the code workspace visible together.",
		winCondition: "The first implemented slice is saved or confirmed.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["agent_build_brief", "design_spec"],
		workbenchFields: [
			{
				id: "slice_status",
				label: "First slice implemented",
				kind: "toggle",
				required: true,
			},
			{
				id: "slice_notes",
				label: "What got built?",
				kind: "textarea",
				rows: 3,
			},
		],
	},
	{
		id: "3.4",
		order: 18,
		block: "BUILD",
		title: "Build the Core Flow",
		shortTitle: "Core Build",
		shell: "focus",
		workbench: "external_workspace",
		artifact: {
			key: "core_flow_working_locally",
			label: "Core Flow Working Locally",
			type: "mixed",
			required: true,
			dependsOn: ["first_implemented_slice"],
		},
		nextLessonId: "3.5",
		prevLessonId: "3.3",
		unlocks: ["3.5"],
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.4 — Build the Core Flow",
		checklist: [
			"Implement the core path",
			"Verify each step works",
			"Mark the flow as working locally",
		],
		helperText: "Keep the product focused on progress and artifacts, not pretending to be the IDE.",
		winCondition: "The core flow works locally from start to finish.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["core_flow_image", "agent_build_brief"],
		workbenchFields: [
			{
				id: "core_flow_status",
				label: "Core flow working locally",
				kind: "checklist",
				required: true,
			},
		],
	},
	{
		id: "3.5",
		order: 19,
		block: "BUILD",
		title: "Debug Without Spiraling",
		shortTitle: "Debug",
		shell: "focus",
		workbench: "tracker_log",
		artifact: {
			key: "blocker_log",
			label: "Blocker Log + Working App",
			type: "table",
			required: true,
			dependsOn: ["core_flow_working_locally"],
		},
		nextLessonId: "3.6",
		prevLessonId: "3.4",
		unlocks: ["3.6"],
		coachMode: "pip",
		externalTool: "code",
		objectiveTitle: "BUILD 3.5 — Debug Without Spiraling",
		checklist: [
			"Log blockers",
			"Log what caused them",
			"Log what you tried",
			"Mark the app stable",
		],
		helperText: "The tracker supports the code work. It is not the code work.",
		winCondition: "At least one blocker entry and a stable-app confirmation are saved.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["core_flow_working_locally"],
		workbenchFields: [
			{
				id: "blocker_table",
				label: "Blocker Log",
				kind: "table",
				required: true,
			},
			{
				id: "app_stable",
				label: "App stable",
				kind: "toggle",
				required: true,
			},
		],
	},
	{
		id: "3.6",
		order: 20,
		block: "BUILD",
		title: "Build Wrap-Up",
		shortTitle: "Build Wrap",
		shell: "split",
		workbench: "brief_assembler",
		artifact: {
			key: "build_summary",
			label: "Build Summary",
			type: "brief",
			required: true,
			dependsOn: ["agent_build_brief", "working_local_environment", "blocker_log"],
		},
		nextLessonId: "4.1",
		prevLessonId: "3.5",
		unlocks: ["4.1", "SHIP_BLOCK"],
		coachMode: "docked",
		objectiveTitle: "BUILD 3.6 — Build Wrap-Up",
		checklist: [
			"Confirm local app",
			"Confirm core flow",
			"Capture blockers",
			"Save the build handoff",
		],
		helperText: "This is the handoff artifact into Ship.",
		winCondition: "The build summary is assembled and saved.",
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
				label: "What is not built yet?",
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
	},
	{
		id: "4.1",
		order: 21,
		block: "SHIP",
		title: "Ship the Core, Not the Fantasy",
		shortTitle: "Ship Core",
		shell: "split",
		workbench: "console_checklist",
		artifact: {
			key: "ship_checklist",
			label: "Ship Checklist",
			type: "checklist",
			required: true,
			dependsOn: ["build_summary"],
		},
		nextLessonId: "4.2",
		prevLessonId: "3.6",
		unlocks: ["4.2"],
		coachMode: "docked",
		objectiveTitle: "SHIP 4.1 — Ship the Core, Not the Fantasy",
		checklist: [
			"Remove nonessential work",
			"Confirm one clear path",
			"Prepare to deploy",
		],
		helperText: "Only the core path has to ship.",
		winCondition: "The ship checklist is complete.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["build_summary"],
		workbenchFields: [
			{
				id: "ship_ready_checklist",
				label: "Ship Checklist",
				kind: "checklist",
				required: true,
			},
			{
				id: "last_cut",
				label: "Any last thing to cut?",
				kind: "text",
			},
		],
	},
	{
		id: "4.2",
		order: 22,
		block: "SHIP",
		title: "Deploy the App",
		shortTitle: "Deploy",
		shell: "focus",
		workbench: "external_workspace",
		artifact: {
			key: "live_url",
			label: "Live URL",
			type: "link",
			required: true,
			dependsOn: ["ship_checklist"],
		},
		nextLessonId: "4.3",
		prevLessonId: "4.1",
		unlocks: ["4.3"],
		coachMode: "pip",
		externalTool: "deploy",
		objectiveTitle: "SHIP 4.2 — Deploy the App",
		checklist: [
			"Open the deploy platform",
			"Complete the deploy",
			"Save the live URL",
			"Verify it is live",
		],
		helperText: "Use focus mode. The actual work is in the deploy tool.",
		winCondition: "A verified live URL is saved.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["ship_checklist"],
		workbenchFields: [
			{
				id: "live_url",
				label: "Live URL",
				kind: "url",
				required: true,
			},
			{
				id: "live_verified",
				label: "Live verified",
				kind: "toggle",
				required: true,
			},
		],
	},
	{
		id: "4.3",
		order: 23,
		block: "SHIP",
		title: "Record a Simple Demo",
		shortTitle: "Demo",
		shell: "split",
		workbench: "capture_upload",
		artifact: {
			key: "demo_clip",
			label: "Demo Clip",
			type: "video",
			required: true,
			dependsOn: ["live_url"],
		},
		nextLessonId: "4.4",
		prevLessonId: "4.2",
		unlocks: ["4.4"],
		coachMode: "docked",
		externalTool: "recording",
		objectiveTitle: "SHIP 4.3 — Record a Simple Demo",
		checklist: [
			"Record a 30–60 second clip",
			"Show the problem and solution",
			"Upload the clip",
		],
		helperText: "Use upload rather than building a recorder into the product first.",
		winCondition: "A demo clip is uploaded.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["live_url"],
		workbenchFields: [
			{
				id: "demo_upload",
				label: "Upload Demo Clip",
				kind: "video_upload",
				required: true,
			},
		],
	},
	{
		id: "4.4",
		order: 24,
		block: "SHIP",
		title: "Send It to Real Humans",
		shortTitle: "Send",
		shell: "split",
		workbench: "tracker_log",
		artifact: {
			key: "send_log",
			label: "Send Log",
			type: "table",
			required: true,
			dependsOn: ["demo_clip"],
		},
		nextLessonId: "4.5",
		prevLessonId: "4.3",
		unlocks: ["4.5"],
		coachMode: "docked",
		objectiveTitle: "SHIP 4.4 — Send It to Real Humans",
		checklist: [
			"Make 5 sends",
			"Log who got it",
			"Capture replies",
		],
		helperText: "This is a real send tracker, not a motivational screen.",
		winCondition: "Five sends are logged.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["live_url", "demo_clip"],
		workbenchFields: [
			{
				id: "send_table",
				label: "Send Tracker",
				kind: "table",
				required: true,
			},
		],
	},
	{
		id: "4.5",
		order: 25,
		block: "SHIP",
		title: "Capture Feedback and Plan Version Two",
		shortTitle: "Feedback",
		shell: "split",
		workbench: "tracker_log",
		artifact: {
			key: "feedback_log",
			label: "Feedback Log + V2 Priorities",
			type: "mixed",
			required: true,
			dependsOn: ["send_log"],
		},
		nextLessonId: "4.6",
		prevLessonId: "4.4",
		unlocks: ["4.6"],
		coachMode: "docked",
		objectiveTitle: "SHIP 4.5 — Capture Feedback and Plan Version Two",
		checklist: [
			"Add feedback",
			"Group patterns",
			"Name the top 3 v2 items",
		],
		helperText: "Capture raw signal, then force prioritization.",
		winCondition: "Feedback entries and top 3 v2 priorities are saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["send_log"],
		workbenchFields: [
			{
				id: "feedback_table",
				label: "Feedback Log",
				kind: "table",
				required: true,
			},
			{
				id: "v2_priority_1",
				label: "Top V2 Priority 1",
				kind: "text",
				required: true,
			},
			{
				id: "v2_priority_2",
				label: "Top V2 Priority 2",
				kind: "text",
				required: true,
			},
			{
				id: "v2_priority_3",
				label: "Top V2 Priority 3",
				kind: "text",
				required: true,
			},
		],
	},
	{
		id: "4.6",
		order: 26,
		block: "SHIP",
		title: "Final Wrap",
		shortTitle: "Final",
		shell: "split",
		workbench: "brief_assembler",
		artifact: {
			key: "final_mission_record",
			label: "Final Mission Record",
			type: "brief",
			required: true,
			dependsOn: ["live_url", "demo_clip", "send_log", "feedback_log"],
		},
		prevLessonId: "4.5",
		coachMode: "docked",
		objectiveTitle: "SHIP 4.6 — Final Wrap",
		checklist: [
			"Confirm live URL",
			"Confirm demo clip",
			"Confirm sends",
			"Confirm feedback log",
			"Complete the sprint",
		],
		helperText: "This is the final mission record, not another planning artifact.",
		winCondition: "The mission record is assembled and the sprint is marked complete.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["live_url", "demo_clip", "send_log", "feedback_log"],
		workbenchFields: [
			{
				id: "shipped_reflection",
				label: "What did I ship?",
				kind: "textarea",
				required: true,
				rows: 4,
			},
			{
				id: "next_reflection",
				label: "What is next?",
				kind: "textarea",
				required: true,
				rows: 4,
			},
		],
	},
];

export const lessonIndex = Object.fromEntries(
	lessonRegistry.map((lesson) => [lesson.id, lesson])
) as Record<string, LessonConfig>;

export function getLesson(id: string): LessonConfig | undefined {
	return lessonIndex[id];
}

export function getLessonsByBlock(block: BlockId): LessonConfig[] {
	return lessonRegistry.filter((lesson) => lesson.block === block);
}

export function getNextLesson(id: string): LessonConfig | undefined {
	const lesson = getLesson(id);
	return lesson?.nextLessonId ? getLesson(lesson.nextLessonId) : undefined;
}

export function getPreviousLesson(id: string): LessonConfig | undefined {
	const lesson = getLesson(id);
	return lesson?.prevLessonId ? getLesson(lesson.prevLessonId) : undefined;
}

export function getProgressTotal(): number {
	return lessonRegistry.filter((lesson) => lesson.id !== "0.0").length;
}

export function getArtifactDependencies(id: string): string[] {
	return getLesson(id)?.artifact.dependsOn ?? [];
}

export function canEnterLesson(
	id: string,
	completedArtifactKeys: string[]
): boolean {
	const lesson = getLesson(id);
	if (!lesson) return false;
	const deps = lesson.artifact.dependsOn ?? [];
	return deps.every((dep) => completedArtifactKeys.includes(dep));
}

export function getDefaultShellForLesson(id: string): ShellType | undefined {
	return getLesson(id)?.shell;
}

export function getDefaultCoachModeForLesson(id: string): CoachMode | undefined {
	return getLesson(id)?.coachMode;
}
