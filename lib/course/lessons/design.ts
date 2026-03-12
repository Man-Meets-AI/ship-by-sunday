import { createPendingLessonCoach } from "../content-helpers";
import {
	focusPanelDefaults,
	splitPanelDefaults,
	type LessonConfig,
} from "../contracts";
import {
	DESIGN_REFERENCE_RESOURCES,
	WORKSHEET_02_RESOURCES,
	WORKSHEET_02_STORYBOARD_RESOURCES,
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
		workbench: "reference_gallery",
		artifact: {
			key: "reference_board",
			label: "Reference Gallery",
			type: "images",
			required: true,
			dependsOn: ["product_brief"],
		},
		nextLessonId: "2.2",
		prevLessonId: "1.7",
		unlocks: { lessons: ["2.2"] },
		coachMode: "docked",
		fieldShapeVersion: 2,
		objectiveTitle: "DESIGN 2.1 — Find References First",
		checklist: [
			"Save at least 3 references",
			"Aim for 5–10 total references",
			"Keep only the styles you want to borrow",
		],
		helperText:
			"Collect reference images before you open Figma so your first design pass starts from real taste instead of guesses.",
		winCondition: "At least 3 reference images are saved.",
		panelDefaults: {
			...splitPanelDefaults,
			resources: "open",
		},
		pinnedArtifacts: ["product_brief"],
		workbenchFields: [
			{
				id: "reference_gallery",
				label: "Reference Gallery",
				kind: "reference_gallery",
				required: true,
				minItems: 3,
				taskLabel: "Save at least 3 references",
				artifactPreviewLabel: "Reference Gallery",
				helpText:
					"Drag in screenshots, paste clipboard images, or add direct image URLs. Inspiration site links belong in Coach Resources.",
			},
		],
		content: {
			status: "draft",
			intro:
				"Do not design from a blank brain. Save the styles you want to borrow first.",
			lessonMeta: {
				runtimeLabel: "6-8 min",
				goal: "Stop them from inventing from a blank brain.",
				purpose:
					"Use visual references to reduce randomness, sharpen taste, and make later design choices faster.",
			},
			actionCard: {
				jobNow:
					"Save at least 3 references that feel close to the product style or flow you want.",
				timebox: "10 minutes",
				comeBackWith: "A mini gallery of references you want to borrow from.",
			},
			coach: createPendingLessonCoach({
				title: "Find References First",
				resources: DESIGN_REFERENCE_RESOURCES,
			}),
			workbench: {
				prompt:
					"Save references you want to borrow from before you make your own screens.",
				teachingPoints: [
					"Look for references that are close to your desired flow, hierarchy, motion, or trust cues.",
					"Keep only the images that reflect the product taste you actually want to borrow.",
					"Use Coach Resources for inspiration sites, then bring the saved screenshots back here.",
				],
				emptyState:
					"Save reference images here first, then use them later to shape your rough screens and visual direction.",
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
		pinnedArtifacts: ["product_brief", "reference_board"],
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
				resources: WORKSHEET_02_STORYBOARD_RESOURCES,
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
		pinnedArtifacts: ["reference_board", "sketch_set", "storyboard_image"],
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
		workbench: "visual_direction",
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
		coachVideoPlacement: "workbench",
		objectiveTitle: "DESIGN 2.6 — Choose a Visual Direction",
		checklist: [
			"Review the references",
			"Write the direction note",
			"Save visualguide.md",
		],
		helperText:
			"Turn your saved references into one practical visual guide before Build starts.",
		panelDefaults: splitPanelDefaults,
		fieldShapeVersion: 2,
		pinnedArtifacts: ["reference_board", "rough_screens"],
		promptImport: {
			promptTemplateId: "visual_direction_guide",
			markdownFieldId: "visual_guide_markdown",
		},
		workbenchFields: [
			{
				id: "visual_direction_notes",
				label: "Visual direction note",
				kind: "textarea",
				required: true,
				rows: 5,
				placeholder:
					"Name the visual shifts you want the guide to push: hierarchy, type feel, surfaces, contrast, spacing, trust cues, interaction tone, and what to avoid.",
				artifactPreviewLabel: "Direction note",
				taskLabel: "Write the direction note",
			},
			{
				id: "visual_guide_markdown",
				label: "Saved visualguide.md",
				kind: "textarea",
				required: true,
				rows: 14,
				placeholder:
					"Paste the returned visualguide.md markdown here after you run the prompt in your coding agent.",
				artifactPreviewLabel: "visualguide.md",
				taskLabel: "Save visualguide.md",
			},
		],
		winCondition: "A saved direction note and visualguide.md are ready.",
		content: {
			status: "draft",
			intro:
				"You do not need a giant brand package. You need one coherent visual guide the build can follow.",
			lessonMeta: {
				runtimeLabel: "5-7 min",
				goal: "Turn your references into a build-ready visual direction.",
				purpose:
					"Students need one sharp guide file, not another blank design exercise.",
			},
			actionCard: {
				jobNow:
					"Review the references, write the direction note, then save `visualguide.md` back into the lesson.",
				timebox: "10 minutes",
				comeBackWith: "A saved `visualguide.md`.",
			},
			coach: createPendingLessonCoach({
				title: "Choose a Visual Direction",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt:
					"You are translating saved references into one practical visual guide for the build.",
				teachingPoints: [
					"Review the references before you ask an agent to generate anything.",
					"Write the visual shifts you want in plain English, not vague taste words.",
					"Save the returned `visualguide.md` so the Design wrap-up can carry it forward.",
				],
				emptyState:
					"You do not need a full brand system. You need one guide file the build can actually follow.",
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
			"Lock the reference direction",
			"Carry the sketches into the handoff",
			"Lock the storyboard flow",
			"Carry the rough screens into Build",
			"Save visualguide.md for Build",
			"Lock the design spec",
		],
		helperText: "Design block complete. Lock the spec and unlock Build.",
		winCondition: "The design spec is assembled and locked.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: [
			"reference_board",
			"sketch_set",
			"storyboard_image",
			"rough_screens",
			"visual_direction",
		],
		briefAssembler: {
			variant: "stage_unlock",
			preset: "design",
			heroEyebrow: "Design block complete",
			heroTitle: "Build unlocked",
			heroBody:
				"You now have the reference direction, screen plan, flow, and visual guide Build needs. Open the next block and translate instead of guessing.",
			nextStepLabel: "BUILD 3.1 — Build From the Brief",
			skills: [
				"Flow sequencing",
				"Screen planning",
				"Hierarchy",
				"Visual direction",
				"Handoff clarity",
			],
			artifactReadyCopy:
				"Build now has the screens, flow, and visual direction it needs.",
			readyStateCopy: "Design block complete. Lock the spec and unlock Build.",
			completionCtaLabel: "Unlock Build",
			celebrationEyebrow: "Design block complete",
			celebrationTitle: "Build unlocked",
		},
		content: {
			status: "draft",
			intro:
				"You are not walking into Build blind. The screens, flow, and visual direction are already locked, so the next block starts from control.",
			lessonMeta: {
				runtimeLabel: "3-5 min",
				goal: "Lock the design spec before building begins.",
				purpose: "This is the handoff from concept to implementation.",
			},
			actionCard: {
				jobNow:
					"Take a fast build-handoff pass, confirm the spec reads cleanly, then unlock Build.",
				timebox: "2 minutes",
				comeBackWith: "A locked design spec and a clear jump into Build.",
			},
			coach: createPendingLessonCoach({
				title: "Design Block Wrap-Up",
				resources: WORKSHEET_02_RESOURCES,
			}),
			workbench: {
				prompt: "Build should now feel like translation, not guessing.",
				teachingPoints: [
					"Check that Build now has a reference direction, a screen plan, a locked flow, and a saved visual guide.",
					"The job here is confidence: Build should start from a real handoff, not from vibes.",
				],
				emptyState: "Build should now feel like translation, not guessing.",
			},
		},
	},
] satisfies LessonConfig[];
