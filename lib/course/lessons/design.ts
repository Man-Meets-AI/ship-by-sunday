import { createPendingLessonCoach } from "../content-helpers";
import {
	focusPanelDefaults,
	splitPanelDefaults,
	type LessonConfig,
} from "../contracts";
import {
	WORKSHEET_02_RESOURCES,
	WORKSHEET_02_STORYBOARD_TEMPLATE_DOWNLOAD,
	WORKSHEET_02_TEMPLATE_DOWNLOAD,
} from "../resources";

export const designLessons = [
	{
		id: "2.1",
		slug: "02-01-find-references-first",
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
		unlocks: { lessons: ["2.2"] },
		coachMode: "docked",
		objectiveTitle: "DESIGN 2.1 — Find References First",
		checklist: [
			"Add 5–10 references",
			"Save what you like",
			"Tag patterns you want to reuse",
		],
		helperText:
			"Collect references before you open Figma for real design work.",
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
		content: {
			status: "draft",
			intro: "Do not design from a blank brain.",
			lessonMeta: {
				runtimeLabel: "6-8 min",
				goal: "Stop them from inventing from a blank brain.",
				purpose:
					"Use reference gathering to reduce randomness and raise taste quickly.",
			},
			actionCard: {
				jobNow: "Gather 3-5 references close to your desired flow or look.",
				timebox: "10 minutes",
				comeBackWith: "A mini inspiration board.",
			},
			coach: createPendingLessonCoach({
				title: "Find References First",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt: "Do not design from a blank brain.",
				teachingPoints: [
					"Show where you actually look: Mobbin, Spotted in Prod, SaaS sites, apps, whatever you really use.",
					"Capture both UX flow and visual tone.",
					"Tell them what to notice: layout, hierarchy, motion, trust cues.",
				],
				emptyState: "Do not design from a blank brain.",
			},
		},
	},
	{
		id: "2.2",
		slug: "02-02-sketch-before-software",
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
		unlocks: { lessons: ["2.3"] },
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
		content: {
			status: "draft",
			intro:
				"Paper is still one of the fastest ways to make an app less abstract.",
			lessonMeta: {
				runtimeLabel: "7-9 min",
				goal: "Get them using paper to remove ambiguity fast.",
				purpose:
					"Sketching is speed. It forces decisions before the build starts lying to you.",
			},
			actionCard: {
				jobNow: "Sketch the core screens of your app on paper.",
				timebox: "15 minutes",
				comeBackWith: "Rough paper sketches of the main screens.",
			},
			coach: createPendingLessonCoach({
				title: "Sketch Before Software",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt:
					"Paper is still one of the fastest ways to make an app less abstract.",
				teachingPoints: [
					"Show boxes, arrows, rough controls, labels.",
					"Use one core flow and sketch only the important screens.",
					"If stuck, use a 6-up exercise and make six ugly variants fast.",
				],
				emptyState:
					"Paper is still one of the fastest ways to make an app less abstract.",
				...WORKSHEET_02_TEMPLATE_DOWNLOAD,
			},
		},
	},
	{
		id: "2.3",
		slug: "02-03-storyboard-the-journey",
		order: 10,
		block: "DESIGN",
		title: "Storyboard the Journey",
		shortTitle: "Storyboard",
		shell: "focus",
		availableLayoutModes: ["focus"],
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
		unlocks: { lessons: ["2.4"] },
		coachMode: "pip",
		objectiveTitle: "DESIGN 2.3 — Storyboard the Journey",
		checklist: [
			"Map 5–7 frames in order",
			"Use paper, tablet, or Excalidraw",
			"Upload one clean photo or export",
		],
		helperText:
			"Storyboard this offline on paper, a tablet, or Excalidraw. One clean image is enough.",
		winCondition:
			"A storyboard image is uploaded and ready for the Figma step.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["sketch_set"],
		workbenchFields: [
			{
				id: "storyboard_upload",
				label: "Upload storyboard image",
				kind: "image_upload",
				required: true,
				helpText:
					"A phone photo, tablet screenshot, or Excalidraw export is enough. Upload one clean image before moving into Figma.",
			},
		],
		content: {
			status: "draft",
			intro:
				"Storyboard the flow off-screen first. Paper, tablet, or Excalidraw is fine.",
			lessonMeta: {
				runtimeLabel: "6-8 min",
				goal: "Turn rough screens into one ordered user journey.",
				purpose:
					"This keeps the flow clear before they touch Figma or over-polish anything.",
			},
			actionCard: {
				jobNow:
					"Storyboard the user journey off-screen in 5-7 frames, then upload one clean image.",
				timebox: "15 minutes",
				comeBackWith: "One storyboard image that shows the journey in order.",
			},
			coach: createPendingLessonCoach({
				title: "Storyboard the Journey",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt:
					"Do this off-screen. Sequence the journey first, then bring back one clean image.",
				teachingPoints: [
					"Paper, tablet, or Excalidraw all count.",
					"Show the key screens or state changes in order, not polished UI.",
					"One photo or export is enough. Figma comes next.",
				],
				emptyState:
					"Do this off-screen. Sequence the journey first, then bring back one clean image.",
				...WORKSHEET_02_STORYBOARD_TEMPLATE_DOWNLOAD,
			},
		},
	},
	{
		id: "2.4",
		slug: "02-04-figma-basics-for-speed",
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
		unlocks: { lessons: ["2.5"] },
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
		content: {
			status: "draft",
			intro:
				"This is not Figma school. This is enough Figma to keep the sprint moving.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Remove friction around the tool itself.",
				purpose: "Teach only the basics required to survive the sprint.",
			},
			actionCard: {
				jobNow:
					"Open the provided Figma file and practice the core hotkeys until they feel less weird.",
				timebox: "5 minutes",
				comeBackWith: "Basic comfort moving around the file.",
			},
			coach: createPendingLessonCoach({
				title: "Figma Basics for Speed",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt:
					"This is not Figma school. This is enough Figma to keep the sprint moving.",
				teachingPoints: [
					"Show frames, move, duplicate, resize, align, and basic layout behavior.",
					"Demonstrate the hotkeys you actually want them to practice.",
					"Keep the file simple and repeatable.",
				],
				emptyState:
					"This is not Figma school. This is enough Figma to keep the sprint moving.",
			},
		},
	},
	{
		id: "2.5",
		slug: "02-05-turn-sketches-into-rough-screens",
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
		unlocks: { lessons: ["2.6"] },
		coachMode: "pip",
		externalTool: "figma",
		objectiveTitle: "DESIGN 2.5 — Turn Sketches Into Rough Screens",
		checklist: [
			"Build 3–5 rough screens",
			"Use sketches as the source",
			"Mark rough screens ready",
		],
		helperText: "The product hosts the lesson. Figma is the actual workbench.",
		winCondition:
			"The user marks rough screens complete and saves the Figma state.",
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
		content: {
			status: "draft",
			intro: "Your job is clarity, not beauty.",
			lessonMeta: {
				runtimeLabel: "10-12 min",
				goal: "Create buildable roughs, not polished comps.",
				purpose:
					"They need just enough fidelity that the build becomes translation instead of guesswork.",
			},
			actionCard: {
				jobNow: "Create rough versions of your main screens in Figma.",
				timebox: "20 minutes",
				comeBackWith: "Three to five rough screens.",
			},
			coach: createPendingLessonCoach({
				title: "Turn Sketches Into Rough Screens",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt: "Your job is clarity, not beauty.",
				teachingPoints: [
					"Build 3-5 key screens only.",
					"Place content, controls, hierarchy, and basic labels.",
					"Add small notes where something important needs explaining.",
				],
				emptyState: "Your job is clarity, not beauty.",
			},
		},
	},
	{
		id: "2.6",
		slug: "02-06-choose-a-visual-direction",
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
		unlocks: { lessons: ["2.7"] },
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
		content: {
			status: "draft",
			intro:
				"You do not need a full brand system. You need a coherent direction.",
			lessonMeta: {
				runtimeLabel: "5-7 min",
				goal: "Set a simple visual system for the build.",
				purpose: "Students need direction, not a giant brand package.",
			},
			actionCard: {
				jobNow: "Choose a visual direction and write 3 style rules.",
				timebox: "10 minutes",
				comeBackWith: "A simple visual direction.",
			},
			coach: createPendingLessonCoach({
				title: "Choose a Visual Direction",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt:
					"You do not need a full brand system. You need a coherent direction.",
				teachingPoints: [
					"Choose one type direction, one spacing feel, one UI vibe.",
					"Define 3 simple style rules.",
					"Tie those rules back to the references.",
				],
				emptyState:
					"You do not need a full brand system. You need a coherent direction.",
			},
		},
	},
	{
		id: "2.7",
		slug: "02-07-design-block-wrap-up",
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
		unlocks: { lessons: ["3.1"], blocks: ["BUILD"] },
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
		content: {
			status: "draft",
			intro:
				"When this block is done, building should feel like translation, not guessing.",
			lessonMeta: {
				runtimeLabel: "3-5 min",
				goal: "Lock the design spec before building begins.",
				purpose: "This is the handoff from concept to implementation.",
			},
			actionCard: {
				jobNow: "Complete Worksheet 02 fully.",
				timebox: "15 minutes",
				comeBackWith: "A finished build-ready design spec.",
			},
			coach: createPendingLessonCoach({
				title: "Design Block Wrap-Up",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt:
					"When this block is done, building should feel like translation, not guessing.",
				teachingPoints: [
					"Review the reference board, screen list, rough frames, and style rules.",
				],
				emptyState:
					"When this block is done, building should feel like translation, not guessing.",
			},
		},
	},
] satisfies LessonConfig[];
