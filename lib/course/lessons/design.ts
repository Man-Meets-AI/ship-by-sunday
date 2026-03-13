import { createPendingLessonCoach } from "../content-helpers";
import { focusPanelDefaults, type LessonConfig } from "../contracts";
import {
	DESIGN_SPEC_TEMPLATE_DOWNLOAD,
	DESIGN_SPEC_TEMPLATE_RESOURCES,
	STORYBOARD_TEMPLATE_DOWNLOAD,
	STORYBOARD_TEMPLATE_RESOURCES,
} from "../resources";

export const designLessons = [
	{
		id: "2.1",
		slug: "02-01-find-references-first",
		order: 8,
		block: "DESIGN",
		title: "Find References First",
		shortTitle: "References",
		shell: "watch",
		workbench: "reference_gallery",
		artifact: {
			key: "reference_board",
			label: "Reference Direction",
			type: "text",
			required: true,
			dependsOn: ["product_brief"],
		},
		nextLessonId: "2.2",
		prevLessonId: "1.7",
		unlocks: { lessons: ["2.2"] },
		coachMode: "docked",
		objectiveTitle: "DESIGN 2.1 — Find References First",
		checklist: ["Watch the walkthrough", "Move into sketching"],
		helperText:
			"Watch the walkthrough, then move into sketching without getting stuck organizing references in the app.",
		winCondition:
			"The walkthrough is complete and the student is ready to sketch.",
		panelDefaults: {
			...focusPanelDefaults,
			resources: "collapsed",
		},
		pinnedArtifacts: ["product_brief"],
		workbenchFields: [],
		content: {
			status: "draft",
			intro:
				"Watch the walkthrough, get the taste calibration, then move straight into sketching.",
			lessonMeta: {
				runtimeLabel: "4-6 min",
				goal: "Calm the student down before they start sketching.",
				purpose:
					"Set the visual bar for the Design block without adding another in-product step before they draw.",
			},
			actionCard: {
				jobNow:
					"Watch the lesson, grab the core principle, and go sketch while the direction is fresh.",
				timebox: "5 minutes",
				comeBackWith: "Enough clarity to start sketching without freezing.",
			},
			coach: createPendingLessonCoach({
				title: "Find References First",
				resources: [],
			}),
			workbench: {
				prompt: "Watch the walkthrough, then move immediately into sketching.",
				teachingPoints: [
					"Do not stall out collecting a huge moodboard.",
					"Borrow the taste cues that matter, then keep moving.",
					"Sketching is the next real step.",
				],
				emptyState:
					"Watch the lesson, then move into sketching while the direction is still clear.",
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
		shell: "focus",
		workbench: "sketch_upload",
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
			"Upload at least one clear photo",
			"Move on once the sketch set is saved",
		],
		helperText: "Sketch 3-5 rough screens, upload clear photos, then move on.",
		winCondition: "A sketch set is uploaded.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["product_brief"],
		workbenchFields: [
			{
				id: "sketch_upload",
				label: "Upload sketch set",
				kind: "image_uploads",
				required: true,
				minItems: 1,
				taskLabel: "Upload at least one sketch photo",
				helpText:
					"One clear set is enough. The point is to make the app concrete before software gets involved.",
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
				jobNow:
					"Sketch 3-5 rough screens, upload clear photos, and keep moving.",
				timebox: "15 minutes",
				comeBackWith: "A saved sketch set you can carry into storyboarding.",
			},
			coach: createPendingLessonCoach({
				title: "Sketch Before Software",
				resources: DESIGN_SPEC_TEMPLATE_RESOURCES,
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
				...DESIGN_SPEC_TEMPLATE_DOWNLOAD,
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
			"Use the printable PDF, FigJam, or plain paper",
			"Upload one clean photo or screenshot",
		],
		helperText:
			"Use the printable PDF, the FigJam template, or plain paper. Five to seven hand-drawn rectangles is enough if the sequence is clear.",
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
					"A phone photo of hand-drawn boxes, a FigJam or tablet screenshot, or an Excalidraw export is enough. Upload one clean image before moving into Figma.",
			},
		],
		content: {
			status: "draft",
			intro:
				"Storyboard the flow off-screen first. Use the printable PDF, the FigJam template, or just draw 5-7 rectangles on paper.",
			lessonMeta: {
				runtimeLabel: "6-8 min",
				goal: "Turn rough screens into one ordered user journey.",
				purpose:
					"This keeps the flow clear before they touch Figma. Sequence and clarity matter more than polished UI.",
			},
			actionCard: {
				jobNow:
					"Use the printable PDF, the FigJam template, or plain paper to storyboard the user journey in 5-7 frames, then upload one clean image.",
				timebox: "15 minutes",
				comeBackWith: "One storyboard image that shows the journey in order.",
			},
			coach: createPendingLessonCoach({
				title: "Storyboard the Journey",
				resources: STORYBOARD_TEMPLATE_RESOURCES,
			}),
			workbench: {
				prompt:
					"Do this off-screen. Use the printable PDF, the FigJam template, or plain paper, then bring back one clean image.",
				teachingPoints: [
					"Printable PDF, FigJam, or hand-drawn rectangles all count.",
					"Show the key screens or state changes in order. Sequence beats polished UI.",
					"One photo or screenshot is enough. Figma comes next.",
				],
				emptyState:
					"Do this off-screen. Use the printable PDF, the FigJam template, or plain paper, then bring back one clean image.",
				...STORYBOARD_TEMPLATE_DOWNLOAD,
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
		shell: "watch",
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
		helperText: "Watch the walkthrough, then move into the Figma file.",
		winCondition:
			"The walkthrough is complete and the learner is ready for Figma.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["sketch_set", "storyboard_image"],
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
				resources: DESIGN_SPEC_TEMPLATE_RESOURCES,
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
		shell: "watch",
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
		helperText:
			"Watch the walkthrough, then build the rough screens in your Figma file.",
		winCondition:
			"The walkthrough is complete and the learner is ready to rough out the screens in Figma.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["sketch_set", "storyboard_image", "figma_file_ready"],
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
				jobNow:
					"Watch the walkthrough, then turn the sketches into 3-5 rough screens in Figma.",
				timebox: "10-12 minutes",
				comeBackWith: "A clear plan for the first rough screens to build.",
			},
			coach: createPendingLessonCoach({
				title: "Turn Sketches Into Rough Screens",
				resources: DESIGN_SPEC_TEMPLATE_RESOURCES,
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
		shell: "watch",
		workbench: "visual_direction",
		artifact: {
			key: "visual_direction",
			label: "Visual Direction Walkthrough",
			type: "text",
			required: true,
			dependsOn: ["rough_screens"],
		},
		nextLessonId: "3.1",
		prevLessonId: "2.5",
		unlocks: { lessons: ["3.1"], blocks: ["BUILD"] },
		coachMode: "docked",
		objectiveTitle: "DESIGN 2.6 — Choose a Visual Direction",
		checklist: ["Watch the walkthrough", "Move straight into Build"],
		helperText:
			"Watch the walkthrough, lock the visual bar in your head, then move straight into Build.",
		panelDefaults: focusPanelDefaults,
		pinnedArtifacts: ["rough_screens"],
		workbenchFields: [],
		winCondition:
			"The walkthrough is complete and the student is ready to start Build.",
		content: {
			status: "draft",
			intro:
				"Watch the walkthrough, set the visual bar, then move straight into Build.",
			lessonMeta: {
				runtimeLabel: "4-6 min",
				goal: "Set the visual bar without adding another in-product task.",
				purpose:
					"Keep momentum high while making the founder's visual call legible before Build.",
			},
			actionCard: {
				jobNow:
					"Watch the lesson, absorb the visual standard, then move straight into Build.",
				timebox: "5 minutes",
				comeBackWith:
					"Enough clarity to carry the Design block directly into Build.",
			},
			coach: createPendingLessonCoach({
				title: "Choose a Visual Direction",
				resources: [],
			}),
			workbench: {
				prompt:
					"Watch the walkthrough, then carry that visual direction straight into Build.",
				teachingPoints: [
					"Do not turn this into another homework step.",
					"Use the video to calibrate the visual standard.",
					"Move into Build while the direction is still fresh.",
				],
				emptyState: "Watch the walkthrough, then move directly into Build.",
			},
		},
	},
] satisfies LessonConfig[];
