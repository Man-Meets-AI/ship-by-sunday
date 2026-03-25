/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
	default: ({
		href,
		children,
		...props
	}: {
		href: string;
		children: React.ReactNode;
	}) =>
		React.createElement("a", { href, ...props }, children),
}));

vi.mock(
	"@/features/course/lesson/workbench/shared/focus-inline-lesson-video",
	() => ({
		FocusInlineLessonVideo: () =>
			React.createElement("div", { "data-testid": "inline-video" }),
	}),
);

import { routeConfig } from "@/config/product";
import { getLessonById } from "@/features/course/lesson/model";
import {
	getObjectiveTasks,
	getWorkbenchSectionStates,
	getWorkbenchSections,
} from "@/features/course/lesson/model/registry";
import { CompetitorResearchLightWorkbench } from "@/features/course/lesson/workbench/modes/competitor-research-light/competitor-research-light-workbench";

describe("CompetitorResearchLightWorkbench", () => {
	it("renders badges, settings link, tabs, and copy prompt control", () => {
		const lesson = getLessonById("1.6");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.6.");
		}

		const fields = lesson.workbenchFields ?? [];
		const workbenchSections = getWorkbenchSections(lesson);
		const sectionStates = getWorkbenchSectionStates(lesson, {});
		const objectiveTasks = getObjectiveTasks(lesson, {});

		render(
			<CompetitorResearchLightWorkbench
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

		expect(
			screen.getByText(
				"Lightweight, directional pass — quick and usable, not exhaustive.",
			),
		).toBeTruthy();
		const settingsLink = screen.getByRole("link", {
			name: /Connect ChatGPT in settings/i,
		});
		expect(settingsLink.getAttribute("href")).toBe(
			`${routeConfig.settings}#codex-connection`,
		);
		expect(screen.getByRole("tab", { name: "Pricing" })).toBeTruthy();
		expect(screen.getByRole("tab", { name: "Messaging" })).toBeTruthy();
		expect(screen.getByRole("tab", { name: "Product" })).toBeTruthy();
		expect(screen.getByRole("button", { name: /Copy prompt/i })).toBeTruthy();
	});
});
