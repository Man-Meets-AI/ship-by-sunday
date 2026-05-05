import { describe, expect, it } from "vitest";

import { getStudentFacingLessons } from "@/lib/course/lesson/model/registry";
import {
	getTutorialsHref,
	getTutorialVideoHref,
} from "@/lib/course/lesson/routing/tutorial-routes";

describe("tutorial route helpers", () => {
	it("maps every student-facing lesson to tutorials instead of the locked lesson route", () => {
		const lessons = getStudentFacingLessons();

		expect(lessons).toHaveLength(29);
		for (const lesson of lessons) {
			const href = getTutorialVideoHref(lesson.lessonKey);

			expect(href).toBe(`/tutorials/${lesson.routeSegment}`);
			expect(href).not.toMatch(/^\/lesson\//);
		}
	});

	it("exposes the Tutorial Videos index href", () => {
		expect(getTutorialsHref()).toBe("/tutorials");
	});
});
