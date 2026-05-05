import { describe, expect, it } from "vitest";

import { buildTutorialVideoLibrary } from "@/app/(workspace)/tutorials/_lib/tutorial-video-library";

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
		expect(library.blocks.flatMap((block) => block.lessons)).toHaveLength(29);

		for (const lesson of library.blocks.flatMap((block) => block.lessons)) {
			expect(lesson.href).toBe(`/tutorials/${lesson.routeSegment}`);
			expect(lesson.durationLabel).toMatch(/m|s/);
			expect("status" in lesson).toBe(false);
			expect("isLocked" in lesson).toBe(false);
		}
	});
});
