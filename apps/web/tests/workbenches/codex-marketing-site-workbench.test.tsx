/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
	useQuery: () => undefined,
}));

import { getLessonById } from "@/features/course/lesson/model";
import { WorkbenchRenderer } from "@/features/course/lesson/workbench/renderer";

describe("codex marketing site workbench (lesson 3.5)", () => {
	it("renders dependencies, plan-mode alert, prompt card, copy tabs, and handoff", () => {
		const lesson = getLessonById("3.5");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.5.");
		}
		expect(lesson.workbench).toBe("codex_marketing_site");

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

		expect(screen.getByText(/before you start/i)).toBeTruthy();
		expect(screen.getByText(/skip plan mode for this lesson/i)).toBeTruthy();
		expect(screen.getByRole("button", { name: /^copy prompt$/i })).toBeTruthy();
		expect(screen.getByRole("tab", { name: /^eyebrow$/i })).toBeTruthy();
		expect(
			screen.getByRole("tab", { name: /faq \/ comparison/i }),
		).toBeTruthy();
		expect(screen.getByText(/next lesson/i)).toBeTruthy();
	});

	it("copies the marketing prompt template", async () => {
		const writeText = vi.fn(() => Promise.resolve());
		Object.defineProperty(globalThis.navigator, "clipboard", {
			value: { writeText },
			configurable: true,
			writable: true,
		});

		const lesson = getLessonById("3.5");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.5.");
		}

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

		const copyPromptBtn = screen.getByRole("button", { name: /copy prompt/i });
		fireEvent.click(copyPromptBtn);
		expect(writeText).toHaveBeenCalled();
		await waitFor(() =>
			expect(screen.getByText(/copied to clipboard/i)).toBeTruthy(),
		);
	});
});
