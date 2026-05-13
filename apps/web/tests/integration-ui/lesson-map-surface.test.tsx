import React from "react";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import { LessonMapSurface } from "@/app/(app)/_components/execute-ship/lesson-map-surface";

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

const missionState: BonusMissionState = {
	exploredCount: 1,
	totalLessons: 29,
	blocks: [
		{
			id: "BUILD",
			order: 3,
			lessons: [
				{
					lessonKey: "build-kickoff",
					routeSegment: "build-kickoff",
					id: "3.0",
					displayLabel: "3.0",
					title: "Build Kickoff",
					shortTitle: "Kickoff",
					block: "BUILD",
					order: 0,
					status: "opened",
					isImplemented: true,
					artifactLabel: "Build kickoff ready",
				},
				{
					lessonKey: "iterate-the-product-with-ai",
					routeSegment: "iterate-the-product-with-ai",
					id: "3.1",
					displayLabel: "3.1",
					title: "Iterate the product with AI",
					shortTitle: "Iterate",
					block: "BUILD",
					order: 1,
					status: "available",
					isImplemented: true,
					artifactLabel: "Build notes",
				},
			],
		},
	],
};

describe("LessonMapSurface", () => {
	it("exposes region semantics, focuses the heading on mount, and calls onDismiss on Escape and Close", async () => {
		const onDismiss = vi.fn();

		render(
			<LessonMapSurface missionState={missionState} onDismiss={onDismiss} />,
		);

		const surface = screen.getByTestId("lesson-map-surface");
		const heading = screen.getByRole("heading", { name: /lesson map/i });

		expect(surface.getAttribute("role")).toBe("region");
		expect(surface.getAttribute("aria-modal")).toBe("true");
		expect(surface.getAttribute("aria-labelledby")).toBe("lesson-map-heading");

		await waitFor(() => {
			expect(document.activeElement).toBe(heading);
		});

		fireEvent.keyDown(document.activeElement!, { key: "Escape" });
		expect(onDismiss).toHaveBeenCalledTimes(1);

		onDismiss.mockClear();
		fireEvent.click(screen.getByTestId("lesson-map-dismiss"));
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it("keeps Tab focus cycling inside the section", async () => {
		render(
			<LessonMapSurface missionState={missionState} onDismiss={() => {}} />,
		);

		const surface = screen.getByTestId("lesson-map-surface");
		const heading = screen.getByRole("heading", { name: /lesson map/i });
		await waitFor(() => {
			expect(document.activeElement).toBe(heading);
		});

		const interactiveCount =
			within(surface).getAllByRole("button").length +
			within(surface).getAllByRole("link").length;
		expect(interactiveCount).toBeGreaterThanOrEqual(3);

		for (let i = 0; i < 30; i += 1) {
			const active = document.activeElement;
			expect(active).toBeTruthy();
			expect(surface.contains(active)).toBe(true);
			fireEvent.keyDown(active!, { key: "Tab", bubbles: true });
		}
	});
});
