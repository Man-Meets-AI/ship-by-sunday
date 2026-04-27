import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@shipbysunday/blueprint-compiler";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";

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

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({
		children,
		localNav,
	}: {
		children: React.ReactNode;
		localNav?: { kind: string; desktop: React.ReactNode };
	}) => (
		<div>
			{localNav ? (
				<div data-testid="local-nav" data-local-nav-kind={localNav.kind}>
					{localNav.desktop}
				</div>
			) : null}
			{children}
		</div>
	),
}));

vi.mock(
	"@/app/(workspace)/_components/execute-ship/bonus-lesson-view-tracker",
	() => ({
		BonusLessonViewTracker: () => null,
	}),
);

import { BonusLessonPage } from "@/app/(workspace)/_components/execute-ship/bonus-lesson-page";
import { BonusLessonFooter } from "@/app/(workspace)/_components/execute-ship/bonus-lesson-footer";

const blueprintStageStatuses = deriveStageStatus(
	createCompleteProjectDefinition().facts,
).stageStatuses;
import { AppShellFooterRail } from "@/app/(workspace)/_components/app-shell/app-shell-footer-rail";

function getWorkspaceLocalNavMarkup(markup: string) {
	const localNavStart =
		'<div data-testid="local-nav" data-local-nav-kind="workspace">';

	return (
		markup.split(localNavStart)[1]?.split('</div><div class="mx-auto')[0] ?? ""
	);
}

const missionState: BonusMissionState = {
	exploredCount: 1,
	totalLessons: 29,
	blocks: [
		{
			id: "CEO",
			order: 1,
			lessons: [
				{
					lessonKey: "start-with-the-problem",
					routeSegment: "start-with-the-problem",
					id: "1.1",
					displayLabel: "1.1",
					title: "Start With the Problem",
					shortTitle: "Problem",
					block: "CEO",
					order: 1,
					status: "opened",
					isImplemented: true,
					artifactLabel: "Problem set",
				},
			],
		},
		{
			id: "DESIGN",
			order: 2,
			lessons: [
				{
					lessonKey: "find-references-first",
					routeSegment: "find-references-first",
					id: "2.2",
					displayLabel: "2.2",
					title: "Find References First",
					shortTitle: "References",
					block: "DESIGN",
					order: 1,
					status: "available",
					isImplemented: true,
					artifactLabel: "Reference set",
				},
			],
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
			lessons: [
				{
					lessonKey: "product-review",
					routeSegment: "product-review",
					id: "4.0",
					displayLabel: "4.0",
					title: "Product Review",
					shortTitle: "Review",
					block: "SHIP",
					order: 1,
					status: "available",
					isImplemented: true,
					artifactLabel: "Launch review",
				},
			],
		},
	],
};

describe("BonusLessonPage", () => {
	it("renders the watch shell without the old workbench", () => {
		const markup = renderToStaticMarkup(
			<BonusLessonPage
				initialStageStatuses={blueprintStageStatuses}
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
			"Use the blueprint as the brief and keep BUILD as the default path.",
		);
		expect(markup).toContain("Build Kickoff");
		expect(markup).toContain("Lesson Map");
		expect(markup).toContain('data-local-nav-kind="workspace"');
		expect(markup).toContain("Build Lessons");
		expect(markup).toContain("3.0");
		expect(markup).toContain("Iterate");
		const localNavMarkup = getWorkspaceLocalNavMarkup(markup);
		expect(localNavMarkup).toContain("Build Lessons");
		expect(localNavMarkup).toContain("Kickoff");
		expect(localNavMarkup).toContain("Iterate");
		expect(localNavMarkup).not.toContain("3.0");
		expect(localNavMarkup).not.toContain("3.1");
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
				initialStageStatuses={blueprintStageStatuses}
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
		expect(markup).toContain("Product");
		expect(markup).toContain("Design");
		const localNavMarkup = getWorkspaceLocalNavMarkup(markup);
		expect(localNavMarkup).toContain("Product");
		expect(localNavMarkup).toContain("Design");
		expect(localNavMarkup).toContain("Problem");
		expect(localNavMarkup).toContain("References");
		expect(localNavMarkup).not.toContain("1.1");
		expect(localNavMarkup).not.toContain("2.2");
	});

	it("hides the footer skill rail on desktop while keeping the mobile fallback markup", () => {
		const markup = renderToStaticMarkup(
			<AppShellFooterRail
				viewportMode="app"
				activeBlock={{
					label: "Launch Lessons",
					lessons: missionState.blocks[3].lessons,
				}}
				navigationLessons={missionState.blocks.flatMap(
					(block) => block.lessons,
				)}
				currentLessonId="product-review"
				completionCue={null}
			/>,
		);

		expect(markup).toContain("Launch Lessons");
		expect(markup).toContain(
			'class="sticky bottom-0 z-10 shrink-0 border-t bg-background/95 backdrop-blur xl:hidden"',
		);
	});
});
