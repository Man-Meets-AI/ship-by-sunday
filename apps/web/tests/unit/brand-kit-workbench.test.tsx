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
import { BRAND_KIT_ARTIFACT_CHECKLIST_OPTIONS } from "@/features/course/lesson/workbench/modes/brand-kit/brand-kit-constants";
import { WorkbenchRenderer } from "@/features/course/lesson/workbench/renderer";

describe("brand kit workbench (lesson 3.9)", () => {
	it("uses brand_kit_workbench and surfaces resources, checklist, and Stripe branding link", () => {
		const lesson = getLessonById("3.9");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.9.");
		}
		expect(lesson.workbench).toBe("brand_kit_workbench");

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

		expect(screen.getByText("Resources")).toBeTruthy();
		const figmaWhiteboard = screen.getByRole("link", {
			name: /Figma whiteboard template/i,
		});
		expect(figmaWhiteboard.getAttribute("href")).toContain("figma.com");
		expect(
			screen.getByRole("link", { name: /favicon\.io/i }).getAttribute("href"),
		).toBe("https://favicon.io");
		expect(
			screen.getByRole("link", { name: /coolors\.co/i }).getAttribute("href"),
		).toBe("https://coolors.co");
		expect(
			screen
				.getByRole("link", { name: /Stripe → Branding/i })
				.getAttribute("href"),
		).toBe("https://dashboard.stripe.com/settings/branding");

		expect(screen.getByText("Brand inputs")).toBeTruthy();
		expect(screen.getAllByText("Naming exercise").length).toBeGreaterThan(0);
		expect(screen.getByText("Brand preview")).toBeTruthy();
		expect(screen.getByText("Required outputs")).toBeTruthy();
		expect(screen.getByText("Keep branding simple")).toBeTruthy();
		expect(screen.getByText(/Pick a durable name/i)).toBeTruthy();

		for (const line of BRAND_KIT_ARTIFACT_CHECKLIST_OPTIONS) {
			expect(screen.getByText(line)).toBeTruthy();
		}
	});
});
