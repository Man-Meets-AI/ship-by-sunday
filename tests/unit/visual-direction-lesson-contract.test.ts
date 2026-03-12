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

	it("keeps 2.7 brief previews concise when visual direction is pinned", () => {
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
			["Reference gallery", "Reference Gallery: 4 saved references"],
			[
				"Visual direction",
				"Direction note: Quiet, editorial, and sharp with tighter spacing and stronger contrast. • visualguide.md: Visual Guide",
			],
		]);
	});
});
