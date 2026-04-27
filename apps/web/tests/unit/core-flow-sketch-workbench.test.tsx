/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
	default: ({
		href,
		children,
		...props
	}: {
		href: string;
		children: React.ReactNode;
	}) => React.createElement("a", { href, ...props }, children),
}));

vi.mock(
	"@/app/(workspace)/_components/course/lesson/components/lesson-video-player",
	() => ({
		LessonVideoPlayer: () =>
			React.createElement("div", { "data-testid": "lesson-video-player" }),
	}),
);

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

import { getLessonById } from "@/lib/course/lesson/model";
import {
	getObjectiveTasks,
	getWorkbenchSectionStates,
	getWorkbenchSections,
} from "@/lib/course/lesson/model/registry";
import { CoreFlowSketchWorkbench } from "@/app/(workspace)/_components/course/lesson/workbench/modes/core-flow-sketch/core-flow-sketch-workbench";

describe("CoreFlowSketchWorkbench", () => {
	it("renders tabs, Crazy Eights, pause copy, screen reference, and prerequisites", async () => {
		const lesson = getLessonById("2.1");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 2.1.");
		}

		const fields = lesson.workbenchFields ?? [];
		const workbenchSections = getWorkbenchSections(lesson);
		const sectionStates = getWorkbenchSectionStates(lesson, {});
		const objectiveTasks = getObjectiveTasks(lesson, {});

		render(
			<CoreFlowSketchWorkbench
				lesson={lesson}
				lessonContent={lesson.content}
				fieldValues={{}}
				onFieldChange={vi.fn()}
				pinnedArtifacts={[]}
				layoutMode="focus"
				invalidFieldIds={new Set()}
				invalidFieldMessages={new Map()}
				fields={fields}
				objectiveTasks={objectiveTasks}
				completedTaskCount={0}
				workbenchSections={workbenchSections}
				sectionStates={sectionStates}
			/>,
		);

		const user = userEvent.setup();
		expect(screen.getByRole("tab", { name: "Brief" })).toBeTruthy();
		expect(screen.getByRole("tab", { name: "Sketch" })).toBeTruthy();
		expect(screen.getByRole("tab", { name: "Named screens" })).toBeTruthy();
		expect(screen.getByRole("tab", { name: "Resources" })).toBeTruthy();

		await user.click(screen.getByRole("tab", { name: "Sketch" }));
		expect(screen.getByText(/Crazy Eights template/i)).toBeTruthy();
		expect(
			screen.getByText(/Pause here and sketch for 2 minutes/i),
		).toBeTruthy();

		await user.click(screen.getByRole("tab", { name: "Named screens" }));
		expect(screen.getByText(/Ideas for Posts/i)).toBeTruthy();

		await user.click(screen.getByRole("tab", { name: "Resources" }));
		expect(screen.getByText(/Gather before you sketch/i)).toBeTruthy();
		expect(
			screen.getAllByText(/Figma or Canva brand file/i).length,
		).toBeGreaterThan(0);
	});
});
