import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";

vi.mock("server-only", () => ({}));

const fetchAuthenticatedQueryMock = vi.fn();
const notFoundMock = vi.fn(() => {
	throw new Error("NEXT_NOT_FOUND");
});

function getWorkspaceLocalNavMarkup(markup: string) {
	const localNavStart =
		'<div data-testid="local-nav" data-local-nav-kind="workspace">';

	return (
		markup.split(localNavStart)[1]?.split('</div><div class="mx-auto')[0] ?? ""
	);
}

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
	notFound: () => notFoundMock(),
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

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		blueprint: {
			getBlueprintWorkspaceState: "getBlueprintWorkspaceState",
			getBlueprintResumeDestination: "getBlueprintResumeDestination",
		},
		course: {
			getBonusRouteState: "getBonusRouteState",
			getBonusMissionState: "getBonusMissionState",
		},
	},
}));

function createWorkspaceState(
	executeShipUnlockedAt?: number,
): BlueprintWorkspaceState {
	return {
		projectDefinition: null,
		workflowState: executeShipUnlockedAt
			? {
					clerkUserId: "user_123",
					productKey: "ship-by-sunday",
					executeShipUnlockedAt,
					createdAt: executeShipUnlockedAt,
					updatedAt: executeShipUnlockedAt,
				}
			: null,
		firstIncompleteStageId: "review",
		blueprintReadiness: {} as BlueprintWorkspaceState["blueprintReadiness"],
		stageStatuses: [] as BlueprintWorkspaceState["stageStatuses"],
	};
}

function createBonusMissionState(): BonusMissionState {
	return {
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
						durationLabel: "1m 29s",
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
						durationLabel: "3m 43s",
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
}

describe("workspace lesson route", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		notFoundMock.mockClear();
		vi.resetModules();
	});

	it("renders explicit unlock messaging before the bonus lesson is available", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintWorkspaceState") {
				return createWorkspaceState();
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: LessonRoutePage } =
			await import("@/app/(workspace)/lesson/[lessonKey]/page");

		const markup = renderToStaticMarkup(
			await LessonRoutePage({
				params: Promise.resolve({ lessonKey: "build-kickoff" }),
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain("Bonus lessons unlock after Review.");
		expect(markup).toContain(
			"&quot;3.0 Build Kickoff&quot; will open after the bonus unlock is active.",
		);
	});

	it("keeps the restored lesson route reachable after unlock", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintWorkspaceState") {
				return createWorkspaceState(123);
			}

			if (query === "getBonusRouteState") {
				return { hasStartedBonusLesson: false };
			}

			if (query === "getBonusMissionState") {
				return createBonusMissionState();
			}

			if (query === "getBlueprintResumeDestination") {
				return {
					destination: "/lesson/build-kickoff",
					kind: "post_review",
					blueprintStageId: null,
					postReviewTargets: {
						reviewDestination: "/review",
						buildLessonsDestination: "/lesson/build-kickoff",
						launchLessonsDestination: "/lesson/product-review",
						lessonMapDestination: "/review?showLessonMap=1",
						latestLessonDestination: "/lesson/build-kickoff",
					},
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: LessonRoutePage } =
			await import("@/app/(workspace)/lesson/[lessonKey]/page");

		const markup = renderToStaticMarkup(
			await LessonRoutePage({
				params: Promise.resolve({ lessonKey: "build-kickoff" }),
				searchParams: Promise.resolve({}),
			}),
		);

		const localNavMarkup = getWorkspaceLocalNavMarkup(markup);

		expect(markup).toContain("Video-first bonus lesson");
		expect(markup).toContain(
			"Use the blueprint as the brief and keep BUILD as the default path.",
		);
		expect(markup).toContain("Build Kickoff");
		expect(markup).toContain("Lesson Map");
		expect(markup).toContain("Build Lessons");
		expect(localNavMarkup).toContain("Build Lessons");
		expect(localNavMarkup).toContain("Kickoff");
		expect(localNavMarkup).toContain("Iterate");
		expect(localNavMarkup).not.toContain("3.0");
		expect(localNavMarkup).not.toContain("3.1");
	});

	it("falls back to local post-review targets when the resume destination is blueprint-first", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintWorkspaceState") {
				return createWorkspaceState(123);
			}

			if (query === "getBonusRouteState") {
				return { hasStartedBonusLesson: false };
			}

			if (query === "getBonusMissionState") {
				return createBonusMissionState();
			}

			if (query === "getBlueprintResumeDestination") {
				return {
					destination: "/build-plan",
					kind: "blueprint_stage",
					blueprintStageId: "build-plan",
					postReviewTargets: null,
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: LessonRoutePage } =
			await import("@/app/(workspace)/lesson/[lessonKey]/page");

		const markup = renderToStaticMarkup(
			await LessonRoutePage({
				params: Promise.resolve({ lessonKey: "build-kickoff" }),
				searchParams: Promise.resolve({}),
			}),
		);

		const localNavMarkup = getWorkspaceLocalNavMarkup(markup);

		expect(markup).toContain("Build Kickoff");
		expect(markup).toContain("Lesson Map");
		expect(localNavMarkup).toContain("Build Lessons");
		expect(localNavMarkup).toContain("Kickoff");
		expect(localNavMarkup).toContain("Iterate");
		expect(localNavMarkup).not.toContain("3.0");
		expect(localNavMarkup).not.toContain("3.1");
	});

	it("returns not found for an unknown lesson route segment", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintWorkspaceState") {
				return createWorkspaceState(123);
			}

			if (query === "getBonusRouteState") {
				return { hasStartedBonusLesson: false };
			}

			if (query === "getBonusMissionState") {
				return createBonusMissionState();
			}

			if (query === "getBlueprintResumeDestination") {
				return {
					destination: "/lesson/build-kickoff",
					kind: "post_review",
					blueprintStageId: null,
					postReviewTargets: {
						reviewDestination: "/review",
						buildLessonsDestination: "/lesson/build-kickoff",
						launchLessonsDestination: "/lesson/product-review",
						lessonMapDestination: "/review?showLessonMap=1",
						latestLessonDestination: "/lesson/build-kickoff",
					},
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: LessonRoutePage } =
			await import("@/app/(workspace)/lesson/[lessonKey]/page");

		await expect(
			LessonRoutePage({
				params: Promise.resolve({ lessonKey: "not-a-real-lesson" }),
				searchParams: Promise.resolve({}),
			}),
		).rejects.toThrowError("NEXT_NOT_FOUND");
	});
});
