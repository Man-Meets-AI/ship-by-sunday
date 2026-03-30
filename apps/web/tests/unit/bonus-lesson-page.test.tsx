import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		scroll: _scroll,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/features/execute-ship/components/bonus-lesson-view-tracker", () => ({
	BonusLessonViewTracker: () => null,
}));

import { BonusLessonPage } from "@/features/execute-ship/components/bonus-lesson-page";
import { BonusLessonFooter } from "@/features/execute-ship/components/bonus-lesson-footer";

const missionState: BonusMissionState = {
	exploredCount: 1,
	totalLessons: 29,
	blocks: [
		{
			id: "CEO",
			order: 1,
			lessons: [],
		},
		{
			id: "DESIGN",
			order: 2,
			lessons: [],
		},
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
		{
			id: "SHIP",
			order: 4,
			lessons: [],
		},
	],
};

describe("BonusLessonPage", () => {
	it("renders the watch shell without the old workbench", () => {
		const markup = renderToStaticMarkup(
			<BonusLessonPage
				lessonKey="build-kickoff"
				missionState={missionState}
				postReviewTargets={{
					reviewDestination: "/review",
					buildLessonsDestination: "/lesson/build-kickoff",
					launchLessonsDestination: "/lesson/product-review",
					lessonMapDestination: "/review?showLessonMap=1",
					latestLessonDestination: "/lesson/build-kickoff",
				}}
			/>,
		);

		expect(markup).toContain("Video-first bonus lesson");
		expect(markup).toContain(
			"Use the packet as the brief and keep BUILD as the default path.",
		);
		expect(markup).toContain("Build Kickoff");
		expect(markup).toContain("Lesson Map");
		expect(markup).not.toContain("Workbench");
	});

	it("keeps the adjacent lesson labels short in the bonus footer", () => {
		const markup = renderToStaticMarkup(
			<BonusLessonFooter lessonKey="iterate-the-product-with-ai" />,
		);

		expect(markup).toContain("Lesson Map");
		expect(markup).toContain("3.0");
	});

	it("keeps static prompt cards on the bonus lesson surface", () => {
		const markup = renderToStaticMarkup(
			<BonusLessonPage
				lessonKey="light-research-not-a-thesis"
				missionState={missionState}
				postReviewTargets={{
					reviewDestination: "/review",
					buildLessonsDestination: "/lesson/build-kickoff",
					launchLessonsDestination: "/lesson/product-review",
					lessonMapDestination: "/review?showLessonMap=1",
					latestLessonDestination: "/lesson/build-kickoff",
				}}
			/>,
		);

		expect(markup).toContain("Light Research, Not a Thesis");
		expect(markup).toContain("Light research prompt");
		expect(markup).toContain("Copy prompt");
	});
});
