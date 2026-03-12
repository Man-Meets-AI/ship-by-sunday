import {
	buildArtifactPreview,
	buildResolvedArtifactPreview,
	createReferenceGalleryValue,
	FIELD_SHAPE_VERSION_FIELD_ID,
	getLessonById,
	getObjectiveTasks,
	isLessonFieldShapeCompatible,
} from "@/lib/course";

describe("visual direction lesson contract", () => {
	it("reconfigures lesson 2.6 around the dedicated visual-direction workflow", () => {
		const lesson = getLessonById("2.6");
		expect(lesson).toBeTruthy();

		expect(lesson?.workbench).toBe("visual_direction");
		expect(lesson?.coachVideoPlacement).toBe("workbench");
		expect(lesson?.fieldShapeVersion).toBe(2);
		expect(lesson?.promptImport).toEqual({
			promptTemplateId: "visual_direction_guide",
			markdownFieldId: "visual_guide_markdown",
		});
		expect(lesson?.workbenchFields?.map((field) => field.id)).toEqual([
			"visual_direction_notes",
			"visual_guide_markdown",
		]);
		expect(getObjectiveTasks(lesson!, {}).map((task) => task.label)).toEqual([
			"Write the direction note",
			"Save visualguide.md",
		]);
	});

	it("turns lesson 2.7 into a design stage-unlock handoff for Build", () => {
		const lesson = getLessonById("2.7");
		expect(lesson).toBeTruthy();

		expect(lesson?.briefAssembler).toMatchObject({
			variant: "stage_unlock",
			preset: "design",
			heroEyebrow: "Design block complete",
			heroTitle: "Build unlocked",
			nextStepLabel: "BUILD 3.1 — Build From the Brief",
			completionCtaLabel: "Unlock Build",
		});
	});

	it("treats the old style-rule draft shape as incompatible", () => {
		const lesson = getLessonById("2.6");
		expect(lesson).toBeTruthy();

		expect(
			isLessonFieldShapeCompatible(lesson!, {
				style_rule_1: "Quiet typography",
				style_rule_2: "Dense spacing",
				style_rule_3: "Sharp cards",
				avoid_rule: "Soft gradients",
			}),
		).toBe(false);
	});

	it("summarizes visual-direction artifacts without dumping the saved markdown", () => {
		const lesson = getLessonById("2.6");
		expect(lesson).toBeTruthy();

		const preview = buildArtifactPreview(lesson!, {
			[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
			visual_direction_notes:
				"Push the references toward a sharper editorial layout with tighter spacing and stronger contrast.",
			visual_guide_markdown: `# Visual Guide
## Overall Direction
Keep the interface sharp and editorial.

## Typography Direction
Use one confident display face with a dense supporting sans.`,
		});

		expect(preview.fields).toEqual([
			[
				"Direction note",
				"Push the references toward a sharper editorial layout with tighter spacing and stronger contrast.",
			],
			["visualguide.md", "Visual Guide"],
		]);
		expect(preview.fieldValues.visual_guide_markdown).toContain(
			"## Typography Direction",
		);
	});

	it("keeps 2.7 build-unlock previews curated when Design artifacts are pinned", () => {
		const lesson = getLessonById("2.7");
		expect(lesson).toBeTruthy();

		const preview = buildResolvedArtifactPreview(lesson!, {}, [
			{
				artifactKey: "reference_board",
				artifactLabel: "Reference Gallery",
				contextTitle: "Reference gallery",
				artifactType: "images",
				lessonId: "2.1",
				lessonTitle: "Find References First",
				fieldValues: {
					reference_gallery: createReferenceGalleryValue([
						{
							id: "remote-1",
							source: "remote_url",
							url: "https://images.example.com/ref-1.png",
						},
						{
							id: "remote-2",
							source: "remote_url",
							url: "https://images.example.com/ref-2.png",
						},
						{
							id: "remote-3",
							source: "remote_url",
							url: "https://images.example.com/ref-3.png",
						},
						{
							id: "remote-4",
							source: "remote_url",
							url: "https://images.example.com/ref-4.png",
						},
					]),
				},
				fields: [
					[
						"Reference Gallery",
						createReferenceGalleryValue([
							{
								id: "remote-1",
								source: "remote_url",
								url: "https://images.example.com/ref-1.png",
							},
							{
								id: "remote-2",
								source: "remote_url",
								url: "https://images.example.com/ref-2.png",
							},
							{
								id: "remote-3",
								source: "remote_url",
								url: "https://images.example.com/ref-3.png",
							},
							{
								id: "remote-4",
								source: "remote_url",
								url: "https://images.example.com/ref-4.png",
							},
						]),
					],
				],
			},
			{
				artifactKey: "sketch_set",
				artifactLabel: "Sketch Set",
				contextTitle: "Sketch set",
				artifactType: "images",
				lessonId: "2.2",
				lessonTitle: "Sketch Before Software",
				fieldValues: {
					sketch_upload: [
						{
							kind: "upload",
							status: "stored",
							storageId: "sketch-1",
							fileName: "screen-1.jpg",
							url: "https://example.com/sketch-1.jpg",
						},
					],
				},
				fields: [["Upload sketch set", "screen-1.jpg"]],
			},
			{
				artifactKey: "storyboard_image",
				artifactLabel: "Storyboard Image",
				contextTitle: "Storyboard image",
				artifactType: "image",
				lessonId: "2.3",
				lessonTitle: "Storyboard the Journey",
				fieldValues: {
					storyboard_upload: {
						kind: "upload",
						status: "stored",
						storageId: "storyboard-1",
						fileName: "storyboard.png",
						url: "https://example.com/storyboard.png",
					},
				},
				fields: [["Upload storyboard image", "storyboard.png"]],
			},
			{
				artifactKey: "rough_screens",
				artifactLabel: "3–5 Rough Screens",
				contextTitle: "3–5 rough screens",
				artifactType: "mixed",
				lessonId: "2.5",
				lessonTitle: "Turn Sketches Into Rough Screens",
				fieldValues: {},
				fields: [],
			},
			{
				artifactKey: "visual_direction",
				artifactLabel: "Visual Direction",
				contextTitle: "Visual direction",
				artifactType: "text",
				lessonId: "2.6",
				lessonTitle: "Choose a Visual Direction",
				fieldValues: {
					visual_direction_notes:
						"Quiet, editorial, and sharp with tighter spacing and stronger contrast.",
					visual_guide_markdown: `# Visual Guide
## Overall Direction
Keep the interface sharp and editorial.`,
				},
				fields: [
					[
						"Direction note",
						"Quiet, editorial, and sharp with tighter spacing and stronger contrast.",
					],
					["visualguide.md", "Visual Guide"],
				],
			},
		]);

		expect(preview.fields).toEqual([
			[
				"Reference direction",
				"4 saved references locked the patterns, hierarchy, and taste Build should borrow from.",
			],
			[
				"Screen plan",
				"The 3-5 rough screens are ready, so Build can start from a real screen plan instead of a blank editor.",
			],
			[
				"Flow sequence",
				"The storyboard already sequences the core user path, so the first implemented slice has a clear flow to follow.",
			],
			[
				"Visual direction",
				"Direction: Quiet, editorial, and sharp with tighter spacing and stronger contrast.\nVisual Guide is saved for implementation.",
			],
		]);
	});
});
