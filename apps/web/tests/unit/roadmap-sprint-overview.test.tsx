import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;

import { RoadmapSprintOverview } from "@/features/course/lesson/workbench/modes/roadmap-sprint-overview";
import { getLessonById } from "@/features/course/lesson/model";

describe("RoadmapSprintOverview", () => {
	it("surfaces the next-lesson CTA and sprint framing for lesson 1.2", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.2.");
		}

		const markup = renderToStaticMarkup(
			<RoadmapSprintOverview lesson={lesson} lessonContent={lesson.content} />,
		);

		expect(markup).toContain("Sprint path");
		expect(markup).toContain("What this sprint produces");
		expect(markup).toContain("See full lesson list");
		expect(markup).toContain("Complete them in order");
	});
});
