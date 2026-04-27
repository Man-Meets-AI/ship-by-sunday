/** @vitest-environment jsdom */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("@/lib/course/lesson/lib/copy-course-prompt", () => ({
	copyCoursePromptToClipboard: vi.fn(() => Promise.resolve("copied" as const)),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
	},
}));

import { copyCoursePromptToClipboard } from "@/lib/course/lesson/lib/copy-course-prompt";
import { getLessonById } from "@/lib/course/lesson/model";
import { WorkbenchRenderer } from "@/app/(workspace)/_components/course/lesson/workbench/renderer";

describe("build product iteration workbench (lesson 3.1)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(copyCoursePromptToClipboard).mockImplementation(() =>
			Promise.resolve("copied"),
		);
	});

	it("renders Setup, Iteration workflow, and Outputs tabs plus gating alert", async () => {
		const user = userEvent.setup();
		const lesson = getLessonById("3.1");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.1.");
		}
		expect(lesson.workbench).toBe("build_product_iteration");

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

		expect(screen.getByRole("tab", { name: /^setup$/i })).toBeTruthy();
		expect(
			screen.getByRole("tab", { name: /iteration workflow/i }),
		).toBeTruthy();
		expect(screen.getByRole("tab", { name: /^outputs$/i })).toBeTruthy();

		const gatingAlert = screen
			.getAllByRole("alert")
			.find((el) => el.textContent?.includes("Product access is gated"));
		expect(gatingAlert).toBeTruthy();
		expect(gatingAlert?.textContent).toMatch(/separate/i);
		expect(gatingAlert?.textContent).toMatch(/website login/i);

		await user.click(screen.getByRole("tab", { name: /iteration workflow/i }));
		expect(screen.getByText(/three-step loop/i)).toBeTruthy();

		await user.click(screen.getByRole("tab", { name: /^outputs$/i }));
		const outputsPanel = screen.getByRole("tabpanel", { name: /^outputs$/i });
		expect(within(outputsPanel).getByText(/v1 templates/i)).toBeTruthy();
		expect(
			within(outputsPanel).getByRole("button", { name: /copy prompt/i }),
		).toBeTruthy();
	});

	it("copies the ChatGPT prompt via clipboard", async () => {
		const user = userEvent.setup();
		const lesson = getLessonById("3.1");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.1.");
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

		await user.click(screen.getByRole("tab", { name: /^outputs$/i }));
		const outputsPanel = screen.getByRole("tabpanel", { name: /^outputs$/i });
		await user.click(
			within(outputsPanel).getByRole("button", { name: /copy prompt/i }),
		);

		expect(copyCoursePromptToClipboard).toHaveBeenCalled();
		const firstCall = vi.mocked(copyCoursePromptToClipboard).mock.calls[0];
		expect(firstCall).toBeDefined();
		const firstArg = firstCall![0];
		expect(typeof firstArg).toBe("string");
		expect(firstArg).toContain("Brand strategy instructions");
	});
});
