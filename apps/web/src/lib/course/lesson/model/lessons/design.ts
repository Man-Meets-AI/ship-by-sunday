import type { LessonSourceConfig } from "../contracts";
import { createVideoLesson } from "../video-lesson-factory";

const CORE_FLOW_BRAND_HAVE = "I already have a Figma or Canva brand file";
const CORE_FLOW_BRAND_NEED = "I need to create a brand guide first";

export const designLessons = [
	createVideoLesson({
		id: "2.0",
		slug: "02-00-design-references",
		order: 9,
		block: "DESIGN",
		title: "Design References",
		shortTitle: "References",
		prevLessonId: "1.9",
		nextLessonId: "2.1",
		intro:
			"Start the Design block with the live reference lesson from Bunny, then move straight into the core flow remap.",
		teachingPoints: [
			"Use this to frame how to collect design references.",
			"Do not stall in a giant moodboard loop.",
			"Keep moving into the next live design lesson.",
		],
	}),
	createVideoLesson({
		id: "2.1",
		slug: "02-01-map-the-core-flow",
		order: 10,
		block: "DESIGN",
		title: "Map the Core Flow",
		shortTitle: "Core flow",
		workbench: "core_flow_sketch",
		prevLessonId: "2.0",
		nextLessonId: "2.2",
		fieldShapeVersion: 4,
		pinnedArtifacts: ["user_statement", "outcome_statement"],
		artifact: {
			key: "core_flow_sketch_state",
			label: "Core flow sketch",
			type: "mixed",
			required: false,
		},
		objectiveTitle: "DESIGN 2.1 — Core flow sketched",
		winCondition:
			"Builder brief filled, execution checklist done, named screens written, brand path chosen, video watched.",
		helperText:
			"Fast Crazy Eights rep: one builder flow to an aha moment—sketch, don’t polish.",
		checklist: [
			"Watch the core flow lesson",
			"Run the 2-minute Crazy Eights pass",
			"Fill the builder brief",
			"Name screens for your chosen flow",
		],
		intro:
			"Sketch one core flow that reaches an aha quickly: brand context, Connect GPT, ideas, light brand tweaks, generate from a template. Stay rough.",
		teachingPoints: [
			"Speed beats fidelity—eight boxes, pick one flow.",
			"Assume ChatGPT for the connect step; keep the screen list concrete.",
			"Don’t hunt templates; pick one target and move on.",
		],
		actionJobNow:
			"Fill the brief, run the timer, sketch eight ideas, then lock one left-to-right flow.",
		actionTimebox: "15–25 minutes",
		actionComeBackWith:
			"A named screen list and a photo-ready sketch of the winning flow.",
		workbenchPrompt:
			"Use the tabs: brief, sketch, named screens, resources. One strong pause for sketching is enough.",
		workbenchEmptyState:
			"Start on the Brief tab, then Sketch for Crazy Eights.",
		workbenchFields: [
			{
				id: "core_problem",
				label: "Problem being solved",
				kind: "text",
				required: true,
				placeholder: "What pain or job are you removing?",
				inputWidth: "wide",
			},
			{
				id: "core_audience",
				label: "Who it’s for",
				kind: "text",
				required: true,
				placeholder: "Specific user or role",
				inputWidth: "wide",
			},
			{
				id: "core_transformation",
				label: "How it changes them",
				kind: "text",
				required: true,
				placeholder: "Before → after in one short phrase",
				inputWidth: "wide",
			},
			{
				id: "core_desired_outcome",
				label: "Desired outcome",
				kind: "text",
				required: true,
				placeholder: "What “done” looks like for the user",
				inputWidth: "wide",
			},
			{
				id: "core_must_have_features",
				label: "Must-have features (for this flow)",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder: "Bullets are fine—only what this flow needs",
				inputWidth: "wide",
			},
			{
				id: "core_execution_checklist",
				label: "Execution checklist",
				kind: "checklist",
				required: true,
				options: [
					"Start 2-minute timer",
					"Sketch 8 ideas (Crazy Eights)",
					"Pick one idea",
					"Redraw the best flow left to right",
				],
			},
			{
				id: "core_sketch_notes",
				label: "Sketch notes",
				kind: "textarea",
				required: false,
				rows: 3,
				placeholder: "Optional: arrows, stick figures, labels",
				inputWidth: "wide",
			},
			{
				id: "core_named_screens",
				label: "Your screen list (in order)",
				kind: "textarea",
				required: true,
				rows: 5,
				placeholder:
					"e.g. Connect GPT → Brand Profile → Ideas for Posts → Brand Settings → Generate from Template",
				inputWidth: "wide",
				helpText:
					"Use the names you’ll actually ship; mirror the reference list if it fits.",
			},
			{
				id: "core_brand_path",
				label: "Brand assets",
				kind: "radio_group",
				required: true,
				options: [CORE_FLOW_BRAND_HAVE, CORE_FLOW_BRAND_NEED],
			},
			{
				id: "core_brand_guide_notes",
				label: "Brand guide notes (optional)",
				kind: "textarea",
				required: false,
				rows: 4,
				placeholder: "Paste bullets from your meta-prompt run",
				inputWidth: "wide",
			},
		],
	}),
	createVideoLesson({
		id: "2.2",
		slug: "02-02-find-references-first",
		order: 11,
		block: "DESIGN",
		title: "Find References First",
		shortTitle: "Find References",
		prevLessonId: "2.1",
		nextLessonId: "3.0",
		unlockBlocks: ["BUILD"],
		intro:
			"Use the filmed references lesson as the final live Design step before the Build block starts.",
		teachingPoints: [
			"Pull the strongest patterns only.",
			"Stop once the direction is clear enough to build.",
			"Move directly into the Build kickoff after this lesson.",
		],
	}),
] satisfies LessonSourceConfig[];
