/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
	useQuery: () => undefined,
	useMutation: () => vi.fn(),
}));

vi.mock(
	"@/features/course/lesson/workbench/shared/focus-inline-lesson-video",
	() => ({
		FocusInlineLessonVideo: () =>
			React.createElement("div", { "data-testid": "inline-video" }),
	}),
);

import { getLessonById } from "@/features/course/lesson/model";
import {
	CORE_UX_PLAN_FALLBACK_PROMPT,
	CORE_UX_PLAN_PLANNING_TRIGGER,
} from "@/features/course/lesson/workbench/modes/core-ux-plan-flow/core-ux-plan-flow-constants";
import { WorkbenchRenderer } from "@/features/course/lesson/workbench/renderer";

describe("core UX plan flow workbench (lesson 3.10)", () => {
	it("uses core_ux_plan_flow and surfaces commands, tabs, and planning copy", () => {
		const lesson = getLessonById("3.10");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.10.");
		}
		expect(lesson.workbench).toBe("core_ux_plan_flow");

		render(
			<WorkbenchRenderer
				lesson={lesson}
				lessonContent={lesson.content}
				fieldValues={{}}
				onFieldChange={() => {}}
				pinnedArtifacts={[]}
				layoutMode="focus"
			/>,
		);

		expect(screen.getByText("Commands used in this lesson")).toBeTruthy();
		expect(screen.getByText(CORE_UX_PLAN_PLANNING_TRIGGER)).toBeTruthy();
		expect(screen.getByText(CORE_UX_PLAN_FALLBACK_PROMPT)).toBeTruthy();
		expect(screen.getByRole("tab", { name: /Instructor example/i })).toBeTruthy();
		expect(screen.getByRole("tab", { name: /Your version/i })).toBeTruthy();
		expect(screen.getByText("Recommendations are a draft")).toBeTruthy();
		expect(screen.getByText("What the plan should include")).toBeTruthy();
		expect(screen.getByText("StoryBlast")).toBeTruthy();
		expect(screen.getByText("Approved v1 plan snapshot")).toBeTruthy();
	});
});
