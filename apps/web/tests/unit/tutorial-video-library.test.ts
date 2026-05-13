import { describe, expect, it } from "vitest";

import { buildTutorialVideoLibrary } from "@/app/(protected)/tutorials/_lib/tutorial-video-library";

describe("tutorial video library model", () => {
	it("groups all student-facing lessons by curriculum block without lock state", () => {
		const library = buildTutorialVideoLibrary();

		expect(library.totalLessons).toBe(29);
		expect(library.blocks.map((block) => block.id)).toEqual([
			"CEO",
			"DESIGN",
			"BUILD",
			"SHIP",
		]);
		expect(library.blocks.map((block) => block.videoCount)).toEqual([
			8, 3, 17, 1,
		]);
		expect(
			library.blocks
				.find((block) => block.id === "BUILD")
				?.sections.map((section) => section.label),
		).toEqual([
			"Start and orient",
			"Wire the product",
			"Plan and build slices",
			"Stabilize and launch",
		]);
		expect(library.blocks.flatMap((block) => block.lessons)).toHaveLength(29);

		for (const lesson of library.blocks.flatMap((block) => block.lessons)) {
			expect(lesson.href).toBe(`/starter/lessons/${lesson.routeSegment}`);
			expect(lesson.durationLabel).toMatch(/m|s/);
			expect(lesson.thumbnailUrl).toMatch(/^\/api\/video\/thumbnails\//);
			expect("status" in lesson).toBe(false);
			expect("isLocked" in lesson).toBe(false);
		}
	});
});
